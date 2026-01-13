package com.focusbuddy.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record SessionResponse(
                Long id,
                String status,
                String taskDescription,
                int plannedDuration,
                int actualDuration,
                LocalDateTime startedAt,
                LocalDateTime endedAt,
                String reflection,
                String sessionType,
                List<DistractionLogResponse> distractionLogs) {
}
