package com.focusbuddy.service;

import com.focusbuddy.model.Group;
import com.focusbuddy.model.Session;
import com.focusbuddy.model.Session.SessionStatus;
import com.focusbuddy.model.User;
import com.focusbuddy.model.dto.SessionEvent;
import com.focusbuddy.repository.SessionRepository;
import com.focusbuddy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final StreakService streakService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public Session startSession(Long userId, String taskDescription, int durationMinutes) {
        // Validation
        Optional<Session> activeSession = sessionRepository.findByUserIdAndStatus(userId, SessionStatus.ACTIVE);
        if (activeSession.isPresent()) {
            throw new IllegalStateException("User already has an active session.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Session session = new Session();
        session.setUser(user);
        session.setStatus(SessionStatus.ACTIVE);
        session.setTaskDescription(taskDescription);
        session.setPlannedDuration(durationMinutes);
        session.setStartedAt(LocalDateTime.now());

        Session savedSession = sessionRepository.save(session);

        // Broadcast "STARTED" to all user's groups
        broadcastSessionUpdate(savedSession, user, durationMinutes);

        return savedSession;
    }

    @Transactional
    public Session completeSession(Long sessionId, String reflection) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));

        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new IllegalStateException("Session is not active.");
        }

        LocalDateTime now = LocalDateTime.now();
        session.setEndedAt(now);

        long minutesElapsed = Duration.between(session.getStartedAt(), now).toMinutes();
        int duration = session.getPlannedDuration();

        if (minutesElapsed < duration) {
            session.setStatus(SessionStatus.ABANDONED);
            session.setDistractionLog("Abandoned early. " + reflection);
        } else {
            session.setStatus(SessionStatus.COMPLETED);
            session.setDistractionLog(reflection);
            streakService.updateStreak(session.getUser().getId());
        }

        Session savedSession = sessionRepository.save(session);
        broadcastSessionUpdate(savedSession, session.getUser(), 0);
        return savedSession;
    }

    @Transactional
    public Session abandonSession(Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));

        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new IllegalStateException("Session is not active.");
        }

        session.setEndedAt(LocalDateTime.now());
        session.setStatus(SessionStatus.ABANDONED);
        Session savedSession = sessionRepository.save(session);
        broadcastSessionUpdate(savedSession, session.getUser(), 0);
        return savedSession;
    }

    private void broadcastSessionUpdate(Session session, User user, int timeLeft) {
        SessionEvent event = new SessionEvent(
                user.getHandle(),
                session.getStatus().name(),
                session.getTaskDescription(),
                timeLeft);

        // Broadcast to all groups the user belongs to
        for (Group group : user.getGroups()) {
            messagingTemplate.convertAndSend("/topic/group/" + group.getId(), event);
        }

        // Also broadcast to a user-specific topic for direct subscribers
        messagingTemplate.convertAndSend("/topic/user/" + user.getId(), event);
    }
}
