package com.focusbuddy.controller;

import com.focusbuddy.model.User;
import com.focusbuddy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody com.focusbuddy.dto.LoginRequest loginRequest) {
        // Simple Insecure Login for MVP
        return userRepository.findByEmail(loginRequest.getEmail())
                .filter(u -> u.getPasswordHash().equals(loginRequest.getPassword())) // Plaintext in MVP for speed
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(401).build());
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody com.focusbuddy.dto.SignupRequest signupRequest) {
        try {
            if (userRepository.findByEmail(signupRequest.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body("Email already taken");
            }
            if (userRepository.findByHandle(signupRequest.getHandle()).isPresent()) {
                return ResponseEntity.badRequest().body("Handle already taken");
            }

            User newUser = new User();
            newUser.setEmail(signupRequest.getEmail());
            newUser.setHandle(signupRequest.getHandle());
            newUser.setPasswordHash(signupRequest.getPassword());

            return ResponseEntity.ok(userRepository.save(newUser));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
}
