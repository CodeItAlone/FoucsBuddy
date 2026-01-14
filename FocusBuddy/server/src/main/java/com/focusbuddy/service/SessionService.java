package com.focusbuddy.service;

import com.focusbuddy.exception.ResourceNotFoundException;
import com.focusbuddy.exception.UnauthorizedException;
import com.focusbuddy.model.DistractionLog;
import com.focusbuddy.model.Session;
import com.focusbuddy.model.SessionState;
import com.focusbuddy.model.SessionType;
import com.focusbuddy.model.User;
import com.focusbuddy.repository.DistractionLogRepository;
import com.focusbuddy.repository.SessionRepository;
import com.focusbuddy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service for managing focus sessions with proper state machine.
 * Valid lifecycle: STARTED → PAUSED → RESUMED → ENDED
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SessionService {

    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final DistractionLogRepository distractionLogRepository;
    private final StreakService streakService;

    /**
     * Start a new focus session.
     * Only one active session per user is allowed.
     */
    @Transactional
    public Session startSession(Long userId, String taskDescription, int durationMinutes, SessionType sessionType) {
        log.debug("Starting session for user: {}, task: {}", userId, taskDescription);
        Optional<Session> activeSession = sessionRepository.findActiveSessionByUserId(userId);
        if (activeSession.isPresent()) {
            throw new IllegalStateException("User already has an active session");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Session session = new Session();
        session.setUser(user);
        session.setStatus(SessionState.STARTED);
        session.setTaskDescription(taskDescription);
        session.setPlannedDuration(durationMinutes);
        session.setStartedAt(LocalDateTime.now());
        session.setSessionDate(java.time.LocalDate.now());
        session.setSessionType(sessionType != null ? sessionType : SessionType.FOCUS);

        Session savedSession = sessionRepository.save(session);
        // Force flush to ensure persistence immediately (helpful for testing/debugging)
        sessionRepository.flush();
        log.debug("Session started and saved with ID: {}", savedSession.getId());

        return savedSession;
    }

    /**
     * Pause an active session.
     */
    @Transactional
    public Session pauseSession(Long userId, Long sessionId) {
        Session session = getSessionWithOwnershipCheck(userId, sessionId);
        session.transitionTo(SessionState.PAUSED);
        return sessionRepository.save(session);
    }

    /**
     * Resume a paused session.
     */
    @Transactional
    public Session resumeSession(Long userId, Long sessionId) {
        Session session = getSessionWithOwnershipCheck(userId, sessionId);
        session.transitionTo(SessionState.RESUMED);
        return sessionRepository.save(session);
    }

    /**
     * End a session (complete or abandon).
     */
    @Transactional
    public Session endSession(Long userId, Long sessionId, String reflection, SessionState status) {
        log.debug("Ending session {} for user {}", sessionId, userId);
        Session session = getSessionWithOwnershipCheck(userId, sessionId);

        session.setReflection(reflection);
        SessionState targetState = (status == SessionState.ABORTED) ? SessionState.ABORTED : SessionState.COMPLETED;
        session.transitionTo(targetState);

        // Calculate and set actual duration
        session.setActualDuration((int) session.getActualFocusSeconds());

        Session savedSession = sessionRepository.save(session);
        sessionRepository.flush();
        log.debug("Session ended and saved with ID: {}. Actual duration: {}", savedSession.getId(),
                savedSession.getActualDuration());

        // Update streak on session completion
        if (targetState == SessionState.COMPLETED) {
            streakService.updateStreak(userId);
        }

        return savedSession;
    }

    /**
     * Get a specific session by ID (with ownership check).
     */
    public Session getSession(Long userId, Long sessionId) {
        return getSessionWithOwnershipCheck(userId, sessionId);
    }

    /**
     * Add a distraction log to an active session.
     */
    @Transactional
    public DistractionLog addDistraction(Long userId, Long sessionId, String description) {
        Session session = getSessionWithOwnershipCheck(userId, sessionId);

        if (!session.isActive()) {
            throw new IllegalStateException("Can only add distractions to an active session");
        }

        DistractionLog log = new DistractionLog();
        log.setSession(session);
        log.setDescription(description);
        log.setLoggedAt(LocalDateTime.now());

        return distractionLogRepository.save(log);
    }

    /**
     * Get the current active session for a user.
     */
    public Optional<Session> getActiveSession(Long userId) {
        return sessionRepository.findActiveSessionByUserId(userId);
    }

    /**
     * Get all sessions for a user (history).
     */
    public List<Session> getSessionHistory(Long userId) {
        return sessionRepository.findByUserIdOrderByStartedAtDesc(userId);
    }

    /**
     * Get daily summary statistics.
     */
    public java.util.Map<String, Object> getDailySummary(Long userId, java.time.LocalDate date) {
        Integer totalFocusSeconds = sessionRepository.sumActualDurationByUserIdAndDateAndType(
                userId, date, SessionType.FOCUS);
        Integer totalBreakSeconds = sessionRepository.sumActualDurationByUserIdAndDateAndType(
                userId, date, SessionType.BREAK);

        int focusTime = totalFocusSeconds != null ? totalFocusSeconds : 0;
        int breakTime = totalBreakSeconds != null ? totalBreakSeconds : 0;

        double productivity = 0.0;
        if (focusTime + breakTime > 0) {
            productivity = (double) focusTime / (focusTime + breakTime) * 100.0;
        }

        List<Session> sessions = sessionRepository.findAllByUserIdAndSessionDate(userId, date);

        return java.util.Map.of(
                "totalFocusMinutes", focusTime / 60,
                "totalBreakMinutes", breakTime / 60,
                "productivityScore", (int) productivity,
                "sessions", sessions);
    }

    private Session getSessionWithOwnershipCheck(Long userId, Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        if (!session.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to access this session");
        }

        return session;
    }
}
