package com.focusbuddy.model;

/**
 * Focus session lifecycle states.
 * Valid transitions: STARTED → PAUSED → RESUMED → ENDED
 */
public enum SessionState {
    STARTED,
    PAUSED,
    RESUMED,
    COMPLETED,
    ABORTED;

    public boolean canTransitionTo(SessionState target) {
        return switch (this) {
            case STARTED -> target == PAUSED || target == COMPLETED || target == ABORTED;
            case PAUSED -> target == RESUMED || target == COMPLETED || target == ABORTED;
            case RESUMED -> target == PAUSED || target == COMPLETED || target == ABORTED;
            case COMPLETED, ABORTED -> false;
        };
    }

    public boolean isActive() {
        return this != COMPLETED && this != ABORTED;
    }
}
