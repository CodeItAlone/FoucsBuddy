package com.focusbuddy.controller;

import com.focusbuddy.exception.ResourceNotFoundException;
import com.focusbuddy.model.Streak;
import com.focusbuddy.model.User;
import com.focusbuddy.repository.StreakRepository;
import com.focusbuddy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/streaks")
@RequiredArgsConstructor
public class StreakController {

    private final StreakRepository streakRepository;
    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<StreakResponse> getMyStreak(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Streak streak = streakRepository.findById(user.getId())
                .orElse(createDefaultStreak(user));

        return ResponseEntity.ok(new StreakResponse(
                streak.getCurrentStreak(),
                streak.getGraceDaysRemaining(),
                streak.getLastSessionDate()));
    }

    private Streak createDefaultStreak(User user) {
        Streak streak = new Streak();
        streak.setUser(user);
        streak.setCurrentStreak(0);
        streak.setGraceDaysRemaining(1);
        return streakRepository.save(streak);
    }

    record StreakResponse(
            int currentStreak,
            int graceDaysRemaining,
            java.time.LocalDate lastSessionDate) {
    }
}
