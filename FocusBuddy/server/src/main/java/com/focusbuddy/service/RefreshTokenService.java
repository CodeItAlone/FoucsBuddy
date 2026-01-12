package com.focusbuddy.service;

import com.focusbuddy.model.RefreshToken;
import com.focusbuddy.model.User;
import com.focusbuddy.repository.RefreshTokenRepository;
import com.focusbuddy.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

/**
 * Service for managing refresh tokens with rotation and reuse detection.
 */
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    /**
     * Create a new refresh token for user.
     */
    @Transactional
    public RefreshToken createRefreshToken(User user, String deviceInfo) {
        String rawToken = jwtTokenProvider.generateRefreshToken();
        String tokenHash = hashToken(rawToken);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(tokenHash);
        refreshToken.setDeviceInfo(deviceInfo);
        refreshToken.setExpiresAt(LocalDateTime.now().plusSeconds(refreshExpirationMs / 1000));

        refreshTokenRepository.save(refreshToken);

        // Store raw token temporarily for response (not persisted)
        refreshToken.setTokenHash(rawToken);
        return refreshToken;
    }

    /**
     * Validate and rotate refresh token.
     * Returns new token pair if valid, throws exception if token was reused.
     */
    @Transactional
    public RefreshToken rotateRefreshToken(String rawToken, User user, String deviceInfo) {
        String tokenHash = hashToken(rawToken);
        Optional<RefreshToken> existing = refreshTokenRepository.findByTokenHash(tokenHash);

        if (existing.isEmpty()) {
            // Token not found - possible reuse attack, revoke all user tokens
            refreshTokenRepository.revokeAllByUser(user, LocalDateTime.now());
            throw new SecurityException("Refresh token reuse detected - all sessions invalidated");
        }

        RefreshToken token = existing.get();

        if (token.isRevoked()) {
            // Revoked token used - reuse attack, revoke all
            refreshTokenRepository.revokeAllByUser(user, LocalDateTime.now());
            throw new SecurityException("Revoked refresh token used - all sessions invalidated");
        }

        if (token.isExpired()) {
            throw new SecurityException("Refresh token expired");
        }

        // Revoke current token
        token.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(token);

        // Create new token (rotation)
        return createRefreshToken(user, deviceInfo);
    }

    /**
     * Revoke single refresh token (logout).
     */
    @Transactional
    public void revokeToken(String rawToken) {
        String tokenHash = hashToken(rawToken);
        refreshTokenRepository.findByTokenHash(tokenHash)
                .ifPresent(token -> {
                    token.setRevokedAt(LocalDateTime.now());
                    refreshTokenRepository.save(token);
                });
    }

    /**
     * Revoke all refresh tokens for user (logout all devices).
     */
    @Transactional
    public void revokeAllUserTokens(User user) {
        refreshTokenRepository.revokeAllByUser(user, LocalDateTime.now());
    }

    /**
     * SHA-256 hash for secure token storage.
     */
    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    /**
     * Verify token and return associated user.
     */
    @Transactional(readOnly = true)
    public Optional<RefreshToken> verifyRefreshToken(String rawToken) {
        String tokenHash = hashToken(rawToken);
        return refreshTokenRepository.findByTokenHash(tokenHash)
                .filter(RefreshToken::isValid);
    }
}
