package com.focusbuddy.dto;

import java.time.LocalDateTime;

/**
 * Timeline entry for focus session history.
 */
public record TimelineEntry(
        Long sessionId,
        String taskDescription,
        String status,
        LocalDateTime startedAt,
        LocalDateTime endedAt,
        long focusMinutes,
        int distractionCount) {
}
