package com.focusbuddy.service;

import com.focusbuddy.model.Streak;
import com.focusbuddy.model.User;
import com.focusbuddy.repository.StreakRepository;
import com.focusbuddy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class StreakService {

    private final StreakRepository streakRepository;
    private final UserRepository userRepository;

    @Transactional
    public void updateStreak(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Streak streak = user.getStreak();
        if (streak == null) {
            streak = new Streak();
            streak.setUser(user);
            user.setStreak(streak);
        }

        LocalDate today = LocalDate.now();
        LocalDate lastSession = streak.getLastSessionDate();

        if (lastSession != null && lastSession.equals(today)) {
            // Already active today, do nothing
            return;
        }

        if (lastSession == null || lastSession.equals(today.minusDays(1))) {
            // Streak continues (or starts)
            streak.setCurrentStreak(streak.getCurrentStreak() + 1);
        } else {
            // Missed a day (lastSession < Yesterday)
            handleMissedDays(streak);
        }

        streak.setLastSessionDate(today);
        streakRepository.save(streak);
    }

    private void handleMissedDays(Streak streak) {
        if (streak.getGraceDaysRemaining() > 0) {
            streak.setGraceDaysRemaining(streak.getGraceDaysRemaining() - 1);
            // Streak preserved
        } else {
            // DECAY ALGORITHM
            // NewStreak = CurrentStreak - (CurrentStreak * 0.20)
            int current = streak.getCurrentStreak();
            int lost = (int) Math.floor(current * 0.20);
            int newStreak = Math.max(0, current - lost);
            streak.setCurrentStreak(newStreak);
        }
    }
}
