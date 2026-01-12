package com.focusbuddy.service;

import com.focusbuddy.dto.*;
import com.focusbuddy.exception.UnauthorizedException;
import com.focusbuddy.model.*;
import com.focusbuddy.repository.UserRepository;
import com.focusbuddy.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Authentication service with access + refresh token support.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    @Value("${app.jwt.access-expiration-ms}")
    private long accessExpirationMs;

    @Transactional
    public AuthResponse signup(SignupRequest request, String deviceInfo) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already taken");
        }

        if (userRepository.findByHandle(request.getHandle()).isPresent()) {
            throw new IllegalArgumentException("Handle already taken");
        }

        User newUser = new User();
        newUser.setEmail(request.getEmail());
        newUser.setHandle(request.getHandle());
        newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        newUser.setRole(Role.USER);

        Streak streak = new Streak();
        streak.setUser(newUser);
        newUser.setStreak(streak);

        User savedUser = userRepository.save(newUser);

        return generateAuthResponse(savedUser, deviceInfo);
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String deviceInfo) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        return generateAuthResponse(user, deviceInfo);
    }

    @Transactional
    public TokenResponse refresh(String refreshToken, String deviceInfo) {
        RefreshToken verified = refreshTokenService.verifyRefreshToken(refreshToken)
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired refresh token"));

        User user = verified.getUser();

        RefreshToken newToken = refreshTokenService.rotateRefreshToken(
                refreshToken, user, deviceInfo);

        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole());

        return new TokenResponse(accessToken, newToken.getTokenHash(), accessExpirationMs / 1000);
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenService.revokeToken(refreshToken);
    }

    @Transactional
    public void logoutAll(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        refreshTokenService.revokeAllUserTokens(user);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private AuthResponse generateAuthResponse(User user, String deviceInfo) {
        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole());

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user, deviceInfo);

        return new AuthResponse(
                accessToken,
                refreshToken.getTokenHash(),
                accessExpirationMs / 1000,
                UserResponse.fromUser(user));
    }
}
