package com.focusbuddy.controller;

import com.focusbuddy.dto.request.CompleteSessionRequest;
import com.focusbuddy.dto.request.StartSessionRequest;
import com.focusbuddy.dto.response.SessionResponse;
import com.focusbuddy.mapper.SessionMapper;
import com.focusbuddy.model.Session;
import com.focusbuddy.security.CurrentUserService;
import com.focusbuddy.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

    @PostMapping("/start")
    public ResponseEntity<SessionResponse> startSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody StartSessionRequest request) {

        Long userId = currentUserService.getUserId(userDetails);
        Session session = sessionService.startSession(userId, request.task(), request.duration());
        return ResponseEntity.ok(sessionMapper.toResponse(session));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<SessionResponse> completeSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody CompleteSessionRequest request) {

        Long userId = currentUserService.getUserId(userDetails);
        Session session = sessionService.completeSession(userId, id, request.reflection());
        return ResponseEntity.ok(sessionMapper.toResponse(session));
    }

    @PostMapping("/{id}/abandon")
    public ResponseEntity<SessionResponse> abandonSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        Long userId = currentUserService.getUserId(userDetails);
        Session session = sessionService.abandonSession(userId, id);
        return ResponseEntity.ok(sessionMapper.toResponse(session));
    }

    @GetMapping("/active")
    public ResponseEntity<SessionResponse> getActiveSession(
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = currentUserService.getUserId(userDetails);
        return sessionService.getActiveSession(userId)
                .map(sessionMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/history")
    public ResponseEntity<List<SessionResponse>> getSessionHistory(
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = currentUserService.getUserId(userDetails);
        List<Session> sessions = sessionService.getSessionHistory(userId);
        return ResponseEntity.ok(sessionMapper.toResponseList(sessions));
    }
}
