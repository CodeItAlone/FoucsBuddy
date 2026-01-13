package com.focusbuddy.dto.request;

/**
 * Request to end a session with optional reflection.
 */
public record UpdateSessionRequest(
        String reflection,
        com.focusbuddy.model.SessionState status) {
}
