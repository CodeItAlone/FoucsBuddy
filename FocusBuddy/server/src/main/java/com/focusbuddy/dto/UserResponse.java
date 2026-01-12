package com.focusbuddy.dto;

import com.focusbuddy.model.User;

/**
 * User response DTO with role included.
 */
public record UserResponse(
        Long id,
        String email,
        String handle,
        String role,
        Integer currentStreak,
        Integer graceDaysRemaining) {
    public static UserResponse fromUser(User user) {
        int streak = 0;
        int graceDays = 1;
        if (user.getStreak() != null) {
            streak = user.getStreak().getCurrentStreak();
            graceDays = user.getStreak().getGraceDaysRemaining();
        }
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getHandle(),
                user.getRole().name(),
                streak,
                graceDays);
    }
}
