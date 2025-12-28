package com.focusbuddy.repository;

import com.focusbuddy.model.Session;
import com.focusbuddy.model.Session.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SessionRepository extends JpaRepository<Session, Long> {
    // Find active session for user
    Optional<Session> findByUserIdAndStatus(Long userId, SessionStatus status);

    List<Session> findByUserId(Long userId);
}
