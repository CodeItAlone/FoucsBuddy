package com.focusbuddy.service;

import com.focusbuddy.dto.AuthResponse;
import com.focusbuddy.dto.LoginRequest;
import com.focusbuddy.dto.SignupRequest;
import com.focusbuddy.dto.UserResponse;
import com.focusbuddy.exception.UnauthorizedException;
import com.focusbuddy.model.Streak;
import com.focusbuddy.model.User;
import com.focusbuddy.repository.UserRepository;
import com.focusbuddy.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already taken");
        }

        // Check if handle already exists
        if (userRepository.findByHandle(request.getHandle()).isPresent()) {
            throw new IllegalArgumentException("Handle already taken");
        }

        // Create new user with hashed password
        User newUser = new User();
        newUser.setEmail(request.getEmail());
        newUser.setHandle(request.getHandle());
        newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        // Initialize streak for new user
        Streak streak = new Streak();
        streak.setUser(newUser);
        newUser.setStreak(streak);

        User savedUser = userRepository.save(newUser);

        // Generate JWT token
        String token = jwtTokenProvider.generateTokenFromUserId(savedUser.getId(), savedUser.getEmail());

        return new AuthResponse(token, UserResponse.fromUser(savedUser));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        // Verify password using BCrypt
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        // Generate JWT token
        String token = jwtTokenProvider.generateTokenFromUserId(user.getId(), user.getEmail());

        return new AuthResponse(token, UserResponse.fromUser(user));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
