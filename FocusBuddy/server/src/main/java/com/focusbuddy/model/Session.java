package com.focusbuddy.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Focus session entity with state machine lifecycle.
 * Valid states: STARTED → PAUSED → RESUMED → ENDED
 */
@Entity
@Table(name = "focus_sessions", indexes = {
        @Index(name = "idx_sessions_user_start", columnList = "user_id, startedAt DESC")
})
@Data
@NoArgsConstructor
public class Session {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @JsonIgnore
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SessionState status = SessionState.STARTED;

    @Column(nullable = false, length = 100)
    private String taskDescription;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SessionType sessionType = SessionType.FOCUS;

    @Column(nullable = false)
    private int plannedDuration;

    @Column(nullable = false)
    private LocalDateTime startedAt;

    private LocalDateTime pausedAt;
    private LocalDateTime resumedAt;
    private LocalDateTime endedAt;

    @Column(nullable = false)
    private int totalPausedSeconds = 0;

    /**
     * persistent field for analytics queries
     */
    @Column(columnDefinition = "integer default 0")
    private int actualDuration;

    @Column(name = "session_date")
    private java.time.LocalDate sessionDate;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<DistractionLog> distractionLogs = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String reflection;

    /**
     * Calculate actual focus duration excluding paused time.
     */
    public long getActualFocusSeconds() {
        if (startedAt == null)
            return 0;
        LocalDateTime end = endedAt != null ? endedAt : LocalDateTime.now();
        long totalSeconds = Duration.between(startedAt, end).getSeconds();
        return Math.max(0, totalSeconds - totalPausedSeconds);
    }

    /**
     * Transition to new state with validation.
     */
    public void transitionTo(SessionState newState) {
        if (!status.canTransitionTo(newState)) {
            throw new IllegalStateException(
                    "Cannot transition from " + status + " to " + newState);
        }

        LocalDateTime now = LocalDateTime.now();

        switch (newState) {
            case PAUSED -> {
                pausedAt = now;
            }
            case RESUMED -> {
                if (pausedAt != null) {
                    totalPausedSeconds += (int) Duration.between(pausedAt, now).getSeconds();
                }
                resumedAt = now;
                pausedAt = null;
            }
            case COMPLETED, ABORTED -> {
                if (pausedAt != null) {
                    totalPausedSeconds += (int) Duration.between(pausedAt, now).getSeconds();
                }
                endedAt = now;
            }
            default -> {
            }
        }

        status = newState;
    }

    public boolean isActive() {
        return status.isActive();
    }
}
