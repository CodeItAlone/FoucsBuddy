package com.focusbuddy.dto.request;

import com.focusbuddy.model.Task.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Request DTO for creating a new task.
 * 
 * Uses Java record for immutability and concise syntax.
 * Includes validation annotations for input sanitization.
 * 
 * @param title       Task title (required, max 100 chars)
 * @param description Optional detailed description (max 500 chars)
 * @param priority    Optional priority level (defaults to MEDIUM)
 * @param dueDate     Optional due date for deadline tracking
 */
public record CreateTaskRequest(
        @NotBlank(message = "Task title is required") @Size(max = 100, message = "Title must be at most 100 characters") String title,

        @Size(max = 500, message = "Description must be at most 500 characters") String description,

        TaskPriority priority,

        LocalDate dueDate) {
}
