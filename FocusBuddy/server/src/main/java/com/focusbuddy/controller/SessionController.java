package com.focusbuddy.controller;

import com.focusbuddy.dto.request.AddDistractionRequest;
import com.focusbuddy.dto.request.CreateSessionRequest;
import com.focusbuddy.dto.request.UpdateSessionRequest;
import com.focusbuddy.dto.response.DistractionLogResponse;
import com.focusbuddy.dto.response.SessionResponse;
import com.focusbuddy.mapper.SessionMapper;
import com.focusbuddy.model.DistractionLog;
import com.focusbuddy.model.Session;
import com.focusbuddy.security.CurrentUserService;
import com.focusbuddy.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

/**
 * REST controller for focus session management.
 * Session lifecycle: STARTED → PAUSED → RESUMED → ENDED
 */
@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
@Slf4j
public class SessionController {

    private final SessionService sessionService;
    private final SessionMapper sessionMapper;
    private final CurrentUserService currentUserService;

    /**
     * POST /api/sessions/start - Start a new focus session
     */
    @PostMapping("/start")
    public ResponseEntity<SessionResponse> startSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateSessionRequest request) {
        log.info("START SESSION CONTROLLER HIT: user={}, task={}", userDetails.getUsername(), request.task());

        Long userId = currentUserService.getUserId(userDetails);
        Session session = sessionService.startSession(userId, request.task(), request.duration(),
                request.sessionType());
        return ResponseEntity.status(HttpStatus.CREATED).body(sessionMapper.toResponse(session));
    }

    /**
     * GET /api/v1/sessions - Get all sessions for the current user
     */
    @GetMapping
    public ResponseEntity<List<SessionResponse>> getSessions(
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = currentUserService.getUserId(userDetails);
        List<Session> sessions = sessionService.getSessionHistory(userId);
        return ResponseEntity.ok(sessionMapper.toResponseList(sessions));
    }

    /**
     * GET /api/v1/sessions/summary?date=YYYY-MM-DD
     */
    @GetMapping("/summary")
    public ResponseEntity<java.util.Map<String, Object>> getDailySummary(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) java.time.LocalDate date) {

        Long userId = currentUserService.getUserId(userDetails);
        java.time.LocalDate queryDate = date != null ? date : java.time.LocalDate.now();

        java.util.Map<String, Object> summary = sessionService.getDailySummary(userId, queryDate);

        // Transform inner session list to DTOs and create mutable response map
        @SuppressWarnings("unchecked")
        List<Session> sessions = (List<Session>) summary.get("sessions");
        List<SessionResponse> sessionResponses = sessionMapper.toResponseList(sessions);

        java.util.Map<String, Object> response = new java.util.HashMap<>(summary);
        response.put("sessions", sessionResponses);

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/sessions/current - Get the current active session (if any)
     */
    @GetMapping("/current")
    public ResponseEntity<SessionResponse> getCurrentSession(
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = currentUserService.getUserId(userDetails);
        return sessionService.getActiveSession(userId)
                .map(sessionMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    /**
     * GET /api/v1/sessions/{id} - Get a specific session by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<SessionResponse> getSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        Long userId = currentUserService.getUserId(userDetails);
        Session session = sessionService.getSession(userId, id);
        return ResponseEntity.ok(sessionMapper.toResponse(session));
    }

    /**
     * POST /api/v1/sessions/{id}/pause - Pause an active session
     */
    @PostMapping("/{id}/pause")
    public ResponseEntity<SessionResponse> pauseSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        Long userId = currentUserService.getUserId(userDetails);
        Session session = sessionService.pauseSession(userId, id);
        return ResponseEntity.ok(sessionMapper.toResponse(session));
    }

    /**
     * POST /api/v1/sessions/{id}/resume - Resume a paused session
     */
    @PostMapping("/{id}/resume")
    public ResponseEntity<SessionResponse> resumeSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        Long userId = currentUserService.getUserId(userDetails);
        Session session = sessionService.resumeSession(userId, id);
        return ResponseEntity.ok(sessionMapper.toResponse(session));
    }

    /**
     * POST /api/v1/sessions/{id}/end - End a session
     */
    @PostMapping("/{id}/end")
    public ResponseEntity<SessionResponse> endSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody(required = false) UpdateSessionRequest request) {

        Long userId = currentUserService.getUserId(userDetails);
        String reflection = request != null ? request.reflection() : null;
        com.focusbuddy.model.SessionState status = request != null ? request.status() : null;
        Session session = sessionService.endSession(userId, id, reflection, status);
        return ResponseEntity.ok(sessionMapper.toResponse(session));
    }

    /**
     * POST /api/v1/sessions/{id}/distractions - Add a distraction log to a session
     */
    @PostMapping("/{id}/distractions")
    public ResponseEntity<DistractionLogResponse> addDistraction(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody AddDistractionRequest request) {

        Long userId = currentUserService.getUserId(userDetails);
        DistractionLog log = sessionService.addDistraction(userId, id, request.description());
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new DistractionLogResponse(log.getId(), log.getDescription(), log.getLoggedAt()));
    }
}
