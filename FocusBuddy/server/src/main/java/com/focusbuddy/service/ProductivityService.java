package com.focusbuddy.service;

import com.focusbuddy.dto.*;
import com.focusbuddy.model.*;
import com.focusbuddy.repository.SessionRepository;
import com.focusbuddy.repository.TaskRepository;
import com.focusbuddy.repository.StreakRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * Service for computing productivity analytics from session data.
 */
@Service
@RequiredArgsConstructor
public class ProductivityService {

        private final SessionRepository sessionRepository;
        private final TaskRepository taskRepository;
        private final StreakRepository streakRepository;

        /**
         * Get productivity stats for given range.
         */
        @Transactional(readOnly = true)
        public ProductivityStats getStats(Long userId, StatsRange range) {
                LocalDate endDate = LocalDate.now();
                LocalDate startDate = switch (range) {
                        case DAILY -> endDate;
                        case WEEKLY -> endDate.minusDays(6);
                        case MONTHLY -> endDate.minusDays(29);
                };

                LocalDateTime startDateTime = startDate.atStartOfDay();
                LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

                List<Session> sessions = sessionRepository.findByUserIdAndStartedAtBetween(
                                userId, startDateTime, endDateTime);

                long totalFocusSeconds = sessions.stream()
                                .filter(s -> s.getStatus() == SessionState.ENDED)
                                .mapToLong(Session::getActualFocusSeconds)
                                .sum();

                int totalSessions = sessions.size();
                int completedSessions = (int) sessions.stream()
                                .filter(s -> s.getStatus() == SessionState.ENDED)
                                .count();

                double completionRate = totalSessions > 0
                                ? (double) completedSessions / totalSessions * 100
                                : 0;

                int completedTasks = taskRepository.countByUserIdAndStatusAndUpdatedAtBetween(
                                userId, Task.TaskStatus.COMPLETED, startDateTime, endDateTime);

                int currentStreak = streakRepository.findById(userId)
                                .map(Streak::getCurrentStreak)
                                .orElse(0);

                // Focus consistency: % of days in range with at least one completed session
                long daysWithFocus = sessions.stream()
                                .filter(s -> s.getStatus() == SessionState.ENDED)
                                .map(s -> s.getStartedAt().toLocalDate())
                                .distinct()
                                .count();
                int totalDays = (int) java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
                double focusConsistency = totalDays > 0 ? (double) daysWithFocus / totalDays * 100 : 0;

                return new ProductivityStats(
                                totalFocusSeconds / 60,
                                totalSessions,
                                completedSessions,
                                Math.round(completionRate * 10) / 10.0,
                                completedTasks,
                                currentStreak,
                                Math.round(focusConsistency * 10) / 10.0,
                                startDate,
                                endDate);
        }

        /**
         * Get timeline of sessions for charts.
         */
        @Transactional(readOnly = true)
        public Page<TimelineEntry> getTimeline(Long userId, LocalDate from, LocalDate to, int page, int size) {
                LocalDateTime startDateTime = from.atStartOfDay();
                LocalDateTime endDateTime = to.atTime(LocalTime.MAX);

                Pageable pageable = PageRequest.of(page, size, Sort.by("startedAt").descending());

                return sessionRepository.findByUserIdAndStartedAtBetweenPaged(
                                userId, startDateTime, endDateTime, pageable).map(
                                                session -> new TimelineEntry(
                                                                session.getId(),
                                                                session.getTaskDescription(),
                                                                session.getStatus().name(),
                                                                session.getStartedAt(),
                                                                session.getEndedAt(),
                                                                session.getActualFocusSeconds() / 60,
                                                                session.getDistractionLogs().size()));
        }
}
