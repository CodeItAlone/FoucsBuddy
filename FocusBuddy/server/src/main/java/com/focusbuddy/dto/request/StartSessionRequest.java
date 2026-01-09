package com.focusbuddy.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record StartSessionRequest(
        @NotBlank(message = "Task description is required") String task,

        @NotNull(message = "Duration is required") Integer duration) {
}
