package com.focusbuddy.repository;

import com.focusbuddy.model.DistractionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DistractionLogRepository extends JpaRepository<DistractionLog, Long> {
    List<DistractionLog> findBySessionId(Long sessionId);
}
