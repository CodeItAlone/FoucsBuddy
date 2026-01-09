package com.focusbuddy.dto.response;

import java.util.List;

public record GroupResponse(
        Long id,
        String name,
        String category,
        String status,
        List<GroupMemberResponse> members) {

    public record GroupMemberResponse(
            Long id,
            String handle) {
    }
}
