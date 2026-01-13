package com.focusbuddy.mapper;

import com.focusbuddy.dto.response.DistractionLogResponse;
import com.focusbuddy.dto.response.SessionResponse;
import com.focusbuddy.model.DistractionLog;
import com.focusbuddy.model.Session;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SessionMapper {

    public SessionResponse toResponse(Session session) {
        List<DistractionLogResponse> distractionLogs = session.getDistractionLogs().stream()
                .map(this::toDistractionLogResponse)
                .toList();

        return new SessionResponse(
                session.getId(),
                session.getStatus().name(),
                session.getTaskDescription(),
                session.getPlannedDuration(),
                session.getActualDuration(),
                session.getStartedAt(),
                session.getEndedAt(),
                session.getReflection(),
                session.getSessionType().name(),
                distractionLogs);
    }

    public List<SessionResponse> toResponseList(List<Session> sessions) {
        return sessions.stream()
                .map(this::toResponse)
                .toList();
    }

    private DistractionLogResponse toDistractionLogResponse(DistractionLog log) {
        return new DistractionLogResponse(
                log.getId(),
                log.getDescription(),
                log.getLoggedAt());
    }
}
