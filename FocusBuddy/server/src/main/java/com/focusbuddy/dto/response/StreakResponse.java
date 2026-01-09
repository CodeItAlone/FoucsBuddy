package com.focusbuddy.dto.response;

import java.time.LocalDate;

public record StreakResponse(
        int currentStreak,
        int graceDaysRemaining,
        LocalDate lastSessionDate) {
}
