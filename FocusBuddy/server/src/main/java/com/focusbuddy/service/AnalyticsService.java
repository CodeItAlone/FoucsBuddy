package com.focusbuddy.service;

import com.focusbuddy.dto.response.DailySummaryResponseDTO;
import com.focusbuddy.model.Session;
import com.focusbuddy.model.SessionType;
import com.focusbuddy.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final SessionRepository sessionRepository;

    @Transactional(readOnly = true)
    public DailySummaryResponseDTO getDailySummary(Long userId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();

        List<Session> sessions = sessionRepository.findByUserIdAndStartedAtBetween(userId, startOfDay, endOfDay);

        long focusSeconds = 0;
        long breakSeconds = 0;
        long meetingSeconds = 0;
        long otherSeconds = 0;

        for (Session session : sessions) {
            long duration = session.getActualFocusSeconds();
            switch (session.getSessionType()) {
                case FOCUS -> focusSeconds += duration;
                case BREAK -> breakSeconds += duration;
                case MEETING -> meetingSeconds += duration;
                case OTHER -> otherSeconds += duration;
            }
        }

        long totalSeconds = focusSeconds + breakSeconds + meetingSeconds + otherSeconds;
        long goalSeconds = 8 * 3600; // Hardcoded goal for now: 8 hours

        return new DailySummaryResponseDTO(
                focusSeconds,
                breakSeconds,
                meetingSeconds,
                otherSeconds,
                totalSeconds,
                goalSeconds);
    }
}
