package com.focusbuddy.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "sessions")
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
    @Column(nullable = false)
    private SessionStatus status;

    @Column(nullable = false, length = 60)
    private String taskDescription;

    @Column(nullable = false)
    private int plannedDuration; // 25, 45, or 60

    private LocalDateTime startedAt;
    private LocalDateTime endedAt;

    private String distractionLog;

    public enum SessionStatus {
        ACTIVE, COMPLETED, ABANDONED
    }
}
