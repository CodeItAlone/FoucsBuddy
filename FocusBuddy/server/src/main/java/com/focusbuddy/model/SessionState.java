package com.focusbuddy.model;

/**
 * Focus session lifecycle states.
 * Valid transitions: STARTED → PAUSED → RESUMED → ENDED
 */
public enum SessionState {
    STARTED,
    PAUSED,
    RESUMED,
    ENDED;

    public boolean canTransitionTo(SessionState target) {
        return switch (this) {
            case STARTED -> target == PAUSED || target == ENDED;
            case PAUSED -> target == RESUMED || target == ENDED;
            case RESUMED -> target == PAUSED || target == ENDED;
            case ENDED -> false;
        };
    }

    public boolean isActive() {
        return this != ENDED;
    }
}
