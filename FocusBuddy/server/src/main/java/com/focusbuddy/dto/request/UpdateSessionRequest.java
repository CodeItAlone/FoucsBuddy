package com.focusbuddy.dto.request;

import com.focusbuddy.model.Session.SessionStatus;

public record UpdateSessionRequest(
        SessionStatus status,
        String reflection) {
}
