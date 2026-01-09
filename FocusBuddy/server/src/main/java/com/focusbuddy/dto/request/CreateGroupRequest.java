package com.focusbuddy.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateGroupRequest(
        @NotBlank(message = "Group name is required") String name,

        @NotBlank(message = "Category is required") String category) {
}
