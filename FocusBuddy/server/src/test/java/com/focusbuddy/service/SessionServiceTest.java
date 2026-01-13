package com.focusbuddy.service;

import com.focusbuddy.model.Session;
import com.focusbuddy.model.SessionState;
import com.focusbuddy.model.SessionType;
import com.focusbuddy.model.User;
import com.focusbuddy.repository.SessionRepository;
import com.focusbuddy.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class SessionServiceTest {

    @Mock
    private SessionRepository sessionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StreakService streakService;

    @InjectMocks
    private SessionService sessionService;

    @Test
    void testEndSessionCalculatesDuration() {
        Long userId = 1L;
        Long sessionId = 100L;
        User user = new User();
        user.setId(userId);

        Session session = new Session();
        session.setId(sessionId);
        session.setUser(user);
        session.setStatus(SessionState.STARTED);
        session.setStartedAt(LocalDateTime.now().minusMinutes(25));

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(sessionRepository.save(any(Session.class))).thenAnswer(i -> i.getArguments()[0]);

        Session endedSession = sessionService.endSession(userId, sessionId, "Good job", SessionState.COMPLETED);

        assertEquals(SessionState.COMPLETED, endedSession.getStatus());
        assertNotNull(endedSession.getEndedAt());
        // Duration should be around 25*60 = 1500 seconds
        // Allow some delta
        assertEquals(1500, endedSession.getActualDuration(), 5);
    }

    @Test
    void testGetDailySummary() {
        Long userId = 1L;
        LocalDate today = LocalDate.now();

        when(sessionRepository.sumActualDurationByUserIdAndDateAndType(userId, today, SessionType.FOCUS))
                .thenReturn(3600); // 60 mins
        when(sessionRepository.sumActualDurationByUserIdAndDateAndType(userId, today, SessionType.BREAK))
                .thenReturn(900); // 15 mins
        when(sessionRepository.findAllByUserIdAndSessionDate(userId, today))
                .thenReturn(Collections.emptyList());

        Map<String, Object> summary = sessionService.getDailySummary(userId, today);

        assertEquals(60, summary.get("totalFocusMinutes"));
        assertEquals(15, summary.get("totalBreakMinutes"));
        assertEquals(80, summary.get("productivityScore")); // 60 / 75 * 100
    }
}
