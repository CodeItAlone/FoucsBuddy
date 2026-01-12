package com.focusbuddy.dto.request;

import com.focusbuddy.model.Task.TaskPriority;
import com.focusbuddy.model.Task.TaskStatus;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Request DTO for updating an existing task.
 * 
 * All fields are optional to support partial updates (PATCH semantics).
 * Only non-null fields will be applied to the existing task.
 * 
 * @param title       New title (max 100 chars, null = no change)
 * @param description New description (max 500 chars, null = no change)
 * @param priority    New priority level (null = no change)
 * @param status      New status (null = no change)
 * @param dueDate     New due date (null = no change, use empty to clear)
 */
public record UpdateTaskRequest(
        @Size(max = 100, message = "Title must be at most 100 characters") String title,

        @Size(max = 500, message = "Description must be at most 500 characters") String description,

        TaskPriority priority,

        TaskStatus status,

        LocalDate dueDate) {
}
