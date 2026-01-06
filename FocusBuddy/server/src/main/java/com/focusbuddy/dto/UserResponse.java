package com.focusbuddy.dto;

import com.focusbuddy.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String handle;
    private Integer currentStreak;
    private Integer graceDaysRemaining;

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
                streak,
                graceDays);
    }
}
