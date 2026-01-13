package com.focusbuddy.controller;

import com.focusbuddy.dto.response.DailySummaryResponseDTO;
import com.focusbuddy.security.CurrentUserService;
import com.focusbuddy.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final CurrentUserService currentUserService;

    @GetMapping("/daily-summary")
    public ResponseEntity<DailySummaryResponseDTO> getDailySummary(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        Long userId = currentUserService.getUserId(userDetails);
        if (date == null) {
            date = LocalDate.now();
        }

        DailySummaryResponseDTO summary = analyticsService.getDailySummary(userId, date);
        return ResponseEntity.ok(summary);
    }
}
