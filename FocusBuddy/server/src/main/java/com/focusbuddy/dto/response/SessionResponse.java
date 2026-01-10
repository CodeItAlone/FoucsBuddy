package com.focusbuddy.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record SessionResponse(
                Long id,
                String status,
                String taskDescription,
                int plannedDuration,
                LocalDateTime startedAt,
                LocalDateTime endedAt,
                String reflection,
                List<DistractionLogResponse> distractionLogs) {
}
