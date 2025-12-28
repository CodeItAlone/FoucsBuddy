package com.focusbuddy.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "streaks")
@Data
@NoArgsConstructor
public class Streak {
    @Id
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonIgnore
    private User user;

    private int currentStreak = 0;
    private int graceDaysRemaining = 1;

    private LocalDate lastSessionDate;

    // Helper to check if streak needs update
    public boolean needsUpdate(LocalDate today) {
        if (lastSessionDate == null)
            return true;
        return !lastSessionDate.equals(today);
    }
}
