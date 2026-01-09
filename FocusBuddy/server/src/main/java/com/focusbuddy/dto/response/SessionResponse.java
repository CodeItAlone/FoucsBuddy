package com.focusbuddy.dto.response;

import java.time.LocalDateTime;

public record SessionResponse(
        Long id,
        String status,
        String taskDescription,
        int plannedDuration,
        LocalDateTime startedAt,
        LocalDateTime endedAt,
        String distractionLog) {
}
