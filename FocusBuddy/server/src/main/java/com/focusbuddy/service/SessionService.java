package com.focusbuddy.service;

import com.focusbuddy.exception.ResourceNotFoundException;
import com.focusbuddy.exception.UnauthorizedException;
import com.focusbuddy.model.DistractionLog;
import com.focusbuddy.model.Session;
import com.focusbuddy.model.Session.SessionStatus;
import com.focusbuddy.model.User;
import com.focusbuddy.repository.DistractionLogRepository;
import com.focusbuddy.repository.SessionRepository;
import com.focusbuddy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final DistractionLogRepository distractionLogRepository;
    private final StreakService streakService;

    /**
     * Create a new focus session
     */
    @Transactional
    public Session createSession(Long userId, String taskDescription, int durationMinutes) {
        Optional<Session> activeSession = sessionRepository.findByUserIdAndStatus(userId, SessionStatus.ACTIVE);
        if (activeSession.isPresent()) {
            throw new IllegalStateException("User already has an active session.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Session session = new Session();
        session.setUser(user);
        session.setStatus(SessionStatus.ACTIVE);
        session.setTaskDescription(taskDescription);
        session.setPlannedDuration(durationMinutes);
        session.setStartedAt(LocalDateTime.now());

        return sessionRepository.save(session);
    }

    /**
     * Get a specific session by ID (with ownership check)
     */
    public Session getSession(Long userId, Long sessionId) {
        return getSessionWithOwnershipCheck(userId, sessionId);
    }

    /**
     * Update session status (complete or abandon)
     */
    @Transactional
    public Session updateSession(Long userId, Long sessionId, SessionStatus newStatus, String reflection) {
        Session session = getSessionWithOwnershipCheck(userId, sessionId);

        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new IllegalStateException("Session is not active.");
        }

        if (newStatus == null) {
            throw new IllegalArgumentException("Status is required for update.");
        }

        LocalDateTime now = LocalDateTime.now();
        session.setEndedAt(now);
        session.setReflection(reflection);

        switch (newStatus) {
            case COMPLETED -> {
                long minutesElapsed = Duration.between(session.getStartedAt(), now).toMinutes();
                if (minutesElapsed < session.getPlannedDuration()) {
                    // Cannot complete before planned duration
                    session.setStatus(SessionStatus.ABANDONED);
                    session.setReflection("Ended early. " + (reflection != null ? reflection : ""));
                } else {
                    session.setStatus(SessionStatus.COMPLETED);
                    streakService.updateStreak(session.getUser().getId());
                }
            }
            case ABANDONED -> session.setStatus(SessionStatus.ABANDONED);
            default -> throw new IllegalArgumentException("Invalid status: " + newStatus);
        }

        return sessionRepository.save(session);
    }

    /**
     * Add a distraction log to an active session
     */
    @Transactional
    public DistractionLog addDistraction(Long userId, Long sessionId, String description) {
        Session session = getSessionWithOwnershipCheck(userId, sessionId);

        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new IllegalStateException("Can only add distractions to an active session.");
        }

        DistractionLog log = new DistractionLog();
        log.setSession(session);
        log.setDescription(description);
        log.setLoggedAt(LocalDateTime.now());

        return distractionLogRepository.save(log);
    }

    /**
     * Get the current active session for a user
     */
    public Optional<Session> getActiveSession(Long userId) {
        return sessionRepository.findByUserIdAndStatus(userId, SessionStatus.ACTIVE);
    }

    /**
     * Get all sessions for a user (history)
     */
    public List<Session> getSessionHistory(Long userId) {
        return sessionRepository.findByUserId(userId);
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
