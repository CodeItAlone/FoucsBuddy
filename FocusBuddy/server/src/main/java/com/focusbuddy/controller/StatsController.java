package com.focusbuddy.controller;

import com.focusbuddy.dto.*;
import com.focusbuddy.security.CurrentUserService;
import com.focusbuddy.service.ProductivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * Productivity stats and timeline endpoints.
 */
@RestController
@RequestMapping("/api/v1/stats")
@RequiredArgsConstructor
public class StatsController {

    private final ProductivityService productivityService;
    private final CurrentUserService currentUserService;

    /**
     * GET /api/v1/stats?range=DAILY|WEEKLY|MONTHLY
     */
    @GetMapping
    public ResponseEntity<ProductivityStats> getStats(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "DAILY") StatsRange range) {
        Long userId = currentUserService.getUserId(userDetails);
        ProductivityStats stats = productivityService.getStats(userId, range);
        return ResponseEntity.ok(stats);
    }

    /**
     * GET /api/v1/stats/timeline?from=YYYY-MM-DD&to=YYYY-MM-DD&page=0&size=50
     */
    @GetMapping("/timeline")
    public ResponseEntity<Page<TimelineEntry>> getTimeline(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Long userId = currentUserService.getUserId(userDetails);

        if (size > 100)
            size = 100;

        Page<TimelineEntry> timeline = productivityService.getTimeline(userId, from, to, page, size);
        return ResponseEntity.ok(timeline);
    }
}
