package com.focusbuddy.controller;

import com.focusbuddy.dto.response.StreakResponse;
import com.focusbuddy.model.Streak;
import com.focusbuddy.security.CurrentUserService;
import com.focusbuddy.service.StreakService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/streaks")
@RequiredArgsConstructor
public class StreakController {

        private final StreakService streakService;
        private final CurrentUserService currentUserService;

        @GetMapping("/me")
        public ResponseEntity<StreakResponse> getMyStreak(@AuthenticationPrincipal UserDetails userDetails) {
                Long userId = currentUserService.getUserId(userDetails);
                Streak streak = streakService.getStreak(userId);

                return ResponseEntity.ok(new StreakResponse(
                                streak.getCurrentStreak(),
                                streak.getGraceDaysRemaining(),
                                streak.getLastSessionDate()));
        }
}
