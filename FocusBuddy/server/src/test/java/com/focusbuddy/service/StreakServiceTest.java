package com.focusbuddy.service;

import com.focusbuddy.model.Streak;
import com.focusbuddy.model.User;
import com.focusbuddy.repository.StreakRepository;
import com.focusbuddy.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class StreakServiceTest {

    @Mock
    private StreakRepository streakRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private StreakService streakService;

    private User user;
    private Streak streak;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        user = new User();
        user.setId(1L);
        streak = new Streak();
        streak.setUser(user);
        streak.setUserId(1L);
        user.setStreak(streak);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
    }

    @Test
    void testIncrementStreakConsecutiveDays() {
        streak.setCurrentStreak(5);
        streak.setLastSessionDate(LocalDate.now().minusDays(1)); // Yesterday

        streakService.updateStreak(1L);

        assertEquals(6, streak.getCurrentStreak());
        verify(streakRepository).save(streak);
    }

    @Test
    void testNoChangeSameDay() {
        streak.setCurrentStreak(5);
        streak.setLastSessionDate(LocalDate.now()); // Today

        streakService.updateStreak(1L);

        assertEquals(5, streak.getCurrentStreak());
        verify(streakRepository, never()).save(streak); // It still saves update date? Actually logic says returns
                                                        // early if equals today.
        // Wait, logic implementation:
        // if (lastSession != null && lastSession.equals(today)) return;
        // So verify save is NOT called if I implemented it that way.
        // Checking implementation... yes, returns early.
        // Updating verification to never().
    }

    @Test
    void testGraceUse() {
        streak.setCurrentStreak(10);
        streak.setLastSessionDate(LocalDate.now().minusDays(2)); // Missed yesterday
        streak.setGraceDaysRemaining(1);

        streakService.updateStreak(1L);

        assertEquals(10, streak.getCurrentStreak()); // No change
        assertEquals(0, streak.getGraceDaysRemaining()); // Consumed
        verify(streakRepository).save(streak);
    }

    @Test
    void testDecayNoGrace() {
        streak.setCurrentStreak(100);
        streak.setLastSessionDate(LocalDate.now().minusDays(2)); // Missed yesterday
        streak.setGraceDaysRemaining(0);

        streakService.updateStreak(1L);

        // Decay: 100 - floor(100 * 0.20) = 100 - 20 = 80
        assertEquals(80, streak.getCurrentStreak());
        verify(streakRepository).save(streak);
    }

    @Test
    void testDecayRounding() {
        streak.setCurrentStreak(13);
        streak.setLastSessionDate(LocalDate.now().minusDays(2));
        streak.setGraceDaysRemaining(0);

        streakService.updateStreak(1L);

        // Decay: 13 - floor(2.6) = 13 - 2 = 11
        assertEquals(11, streak.getCurrentStreak());
    }
}
