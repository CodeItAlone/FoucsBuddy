package com.focusbuddy.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SignupRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Handle is required")
    @Size(min = 3, max = 20, message = "Handle must be 3-20 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Handle can only contain letters, numbers, and underscores")
    private String handle;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
}
