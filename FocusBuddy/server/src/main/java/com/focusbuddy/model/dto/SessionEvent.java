package com.focusbuddy.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SessionEvent {
    private String userHandle;
    private String status; // ACTIVE, COMPLETED, ABANDONED
    private String task;
    private int timeLeft; // Minutes (planned - elapsed) or just planned for start
}
