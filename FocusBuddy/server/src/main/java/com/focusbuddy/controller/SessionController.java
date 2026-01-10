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

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;
    private final SessionMapper sessionMapper;
    private final CurrentUserService currentUserService;

    /**
     * POST /api/sessions - Create a new focus session
     */
    @PostMapping
    public ResponseEntity<SessionResponse> createSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateSessionRequest request) {

        Long userId = currentUserService.getUserId(userDetails);
        Session session = sessionService.createSession(userId, request.task(), request.duration());
        return ResponseEntity.status(HttpStatus.CREATED).body(sessionMapper.toResponse(session));
    }

    /**
     * GET /api/sessions - Get all sessions for the current user
     */
    @GetMapping
    public ResponseEntity<List<SessionResponse>> getSessions(
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = currentUserService.getUserId(userDetails);
        List<Session> sessions = sessionService.getSessionHistory(userId);
        return ResponseEntity.ok(sessionMapper.toResponseList(sessions));
    }

    /**
     * GET /api/sessions/current - Get the current active session (if any)
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
     * GET /api/sessions/{id} - Get a specific session by ID
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
     * PATCH /api/sessions/{id} - Update session status (complete or abandon)
     */
    @PatchMapping("/{id}")
    public ResponseEntity<SessionResponse> updateSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody UpdateSessionRequest request) {

        Long userId = currentUserService.getUserId(userDetails);
        Session session = sessionService.updateSession(userId, id, request.status(), request.reflection());
        return ResponseEntity.ok(sessionMapper.toResponse(session));
    }

    /**
     * POST /api/sessions/{id}/distractions - Add a distraction log to a session
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
