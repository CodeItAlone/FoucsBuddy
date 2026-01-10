package com.focusbuddy.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "distraction_logs")
@Data
@NoArgsConstructor
public class DistractionLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    @ToString.Exclude
    @JsonIgnore
    private Session session;

    @Column(nullable = false, length = 255)
    private String description;

    private LocalDateTime loggedAt = LocalDateTime.now();
}
