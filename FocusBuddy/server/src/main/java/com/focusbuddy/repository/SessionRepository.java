package com.focusbuddy.repository;

import com.focusbuddy.model.Session;
import com.focusbuddy.model.SessionState;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {

    Optional<Session> findByUserIdAndStatusNot(Long userId, SessionState status);

    @Query("SELECT s FROM Session s WHERE s.user.id = :userId AND s.status != 'ENDED'")
    Optional<Session> findActiveSessionByUserId(@Param("userId") Long userId);

    List<Session> findByUserIdOrderByStartedAtDesc(Long userId);

    @Query("SELECT s FROM Session s WHERE s.user.id = :userId " +
            "AND s.startedAt BETWEEN :start AND :end ORDER BY s.startedAt DESC")
    List<Session> findByUserIdAndStartedAtBetween(
            @Param("userId") Long userId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT s FROM Session s WHERE s.user.id = :userId " +
            "AND s.startedAt BETWEEN :start AND :end")
    Page<Session> findByUserIdAndStartedAtBetweenPaged(
            @Param("userId") Long userId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            Pageable pageable);

    @Query("SELECT COUNT(s) FROM Session s WHERE s.user.id = :userId " +
            "AND s.status = 'ENDED' AND s.startedAt >= :since")
    long countCompletedSessionsSince(@Param("userId") Long userId, @Param("since") LocalDateTime since);
}
