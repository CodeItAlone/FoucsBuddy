package com.focusbuddy.controller;

import com.focusbuddy.exception.ResourceNotFoundException;
import com.focusbuddy.exception.UnauthorizedException;
import com.focusbuddy.model.Session;
import com.focusbuddy.model.User;
import com.focusbuddy.repository.SessionRepository;
import com.focusbuddy.repository.UserRepository;
import com.focusbuddy.service.SessionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;
    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;

    @PostMapping("/start")
    public ResponseEntity<Session> startSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody StartSessionRequest request) {

        User user = getUserFromPrincipal(userDetails);
        Session session = sessionService.startSession(
                user.getId(),
                request.getTask(),
                request.getDuration());
        return ResponseEntity.ok(session);
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Session> completeSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody CompletionRequest request) {

        User user = getUserFromPrincipal(userDetails);
        validateSessionOwnership(id, user.getId());

        return ResponseEntity.ok(sessionService.completeSession(id, request.getReflection()));
    }

    @PostMapping("/{id}/abandon")
    public ResponseEntity<Session> abandonSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        User user = getUserFromPrincipal(userDetails);
        validateSessionOwnership(id, user.getId());

        return ResponseEntity.ok(sessionService.abandonSession(id));
    }

    @GetMapping("/active")
    public ResponseEntity<Session> getActiveSession(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getUserFromPrincipal(userDetails);
        return sessionRepository.findByUserIdAndStatus(user.getId(), Session.SessionStatus.ACTIVE)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/history")
    public ResponseEntity<?> getSessionHistory(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getUserFromPrincipal(userDetails);
        return ResponseEntity.ok(sessionRepository.findByUserId(user.getId()));
    }

    private User getUserFromPrincipal(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void validateSessionOwnership(Long sessionId, Long userId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        if (!session.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to modify this session");
        }
    }

    @Data
    static class StartSessionRequest {
        @NotBlank(message = "Task description is required")
        private String task;

        @NotNull(message = "Duration is required")
        private Integer duration;
    }

    @Data
    static class CompletionRequest {
        private String reflection;
    }
}
