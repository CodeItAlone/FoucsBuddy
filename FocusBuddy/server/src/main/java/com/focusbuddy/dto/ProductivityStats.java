package com.focusbuddy.dto;

import java.time.LocalDate;

/**
 * Productivity stats response.
 */
public record ProductivityStats(
        long totalFocusMinutes,
        int totalSessions,
        int completedSessions,
        double completionRate,
        int completedTasks,
        int currentStreak,
        double focusConsistencyPercent,
        LocalDate startDate,
        LocalDate endDate) {
}
