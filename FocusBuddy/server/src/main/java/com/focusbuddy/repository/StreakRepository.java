package com.focusbuddy.repository;

import com.focusbuddy.model.Streak;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StreakRepository extends JpaRepository<Streak, Long> {
}
