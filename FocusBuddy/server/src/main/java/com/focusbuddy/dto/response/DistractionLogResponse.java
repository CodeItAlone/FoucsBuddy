package com.focusbuddy.dto.response;

import java.time.LocalDateTime;

public record DistractionLogResponse(
        Long id,
        String description,
        LocalDateTime loggedAt) {
}
