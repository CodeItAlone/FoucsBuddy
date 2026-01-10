package com.focusbuddy.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddDistractionRequest(
        @NotBlank(message = "Description is required") @Size(max = 255, message = "Description must be at most 255 characters") String description) {
}
