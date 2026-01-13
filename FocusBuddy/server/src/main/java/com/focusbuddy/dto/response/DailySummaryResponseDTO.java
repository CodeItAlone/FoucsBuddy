package com.focusbuddy.dto.response;

public record DailySummaryResponseDTO(
        long focusSeconds,
        long breakSeconds,
        long meetingSeconds,
        long otherSeconds,
        long totalSeconds,
        long goalSeconds) {
}
