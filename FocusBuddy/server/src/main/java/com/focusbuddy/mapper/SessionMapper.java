package com.focusbuddy.mapper;

import com.focusbuddy.dto.response.SessionResponse;
import com.focusbuddy.model.Session;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SessionMapper {

    public SessionResponse toResponse(Session session) {
        return new SessionResponse(
                session.getId(),
                session.getStatus().name(),
                session.getTaskDescription(),
                session.getPlannedDuration(),
                session.getStartedAt(),
                session.getEndedAt(),
                session.getDistractionLog());
    }

    public List<SessionResponse> toResponseList(List<Session> sessions) {
        return sessions.stream()
                .map(this::toResponse)
                .toList();
    }
}
