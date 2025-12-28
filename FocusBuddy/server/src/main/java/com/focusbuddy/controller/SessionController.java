package com.focusbuddy.controller;

import com.focusbuddy.model.Session;
import com.focusbuddy.service.SessionService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @PostMapping("/start")
    public ResponseEntity<Session> startSession(@RequestBody StartSessionRequest request) {
        try {
            Session session = sessionService.startSession(
                    request.getUserId(),
                    request.getTask(),
                    request.getDuration());
            return ResponseEntity.ok(session);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).build(); // Conflict
        }
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Session> completeSession(@PathVariable Long id, @RequestBody CompletionRequest request) {
        try {
            return ResponseEntity.ok(sessionService.completeSession(id, request.getReflection()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/abandon")
    public ResponseEntity<Session> abandonSession(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(sessionService.abandonSession(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Data
    static class StartSessionRequest {
        private Long userId;
        private String task;
        private int duration;
    }

    @Data
    static class CompletionRequest {
        private String reflection;
    }
}
