package com.focusbuddy.dto;

import lombok.Data;

@Data
public class SignupRequest {
    private String email;
    private String handle;
    private String password;
}
