package com.focusbuddy.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateSessionRequest(
        @NotBlank(message = "Task description is required") @Size(max = 60, message = "Task description must be at most 60 characters") String task,

        int duration) {
}
