package com.focusbuddy.dto.response;

public record MemberStatusResponse(
        Long userId,
        String handle,
        String status,
        String currentTask,
        Integer timeLeftMinutes) {
}
