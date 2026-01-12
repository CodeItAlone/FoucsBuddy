package com.focusbuddy.dto.response;

import com.focusbuddy.model.Task;
import com.focusbuddy.model.Task.TaskPriority;
import com.focusbuddy.model.Task.TaskStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response DTO for task data.
 * 
 * Prevents entity leakage by exposing only necessary fields.
 * User information is excluded as tasks are always user-scoped.
 * 
 * @param id          Unique task identifier
 * @param title       Task title
 * @param description Optional task description
 * @param priority    Priority level (LOW, MEDIUM, HIGH)
 * @param status      Current status (TODO, IN_PROGRESS, COMPLETED)
 * @param dueDate     Optional due date
 * @param createdAt   Creation timestamp
 * @param updatedAt   Last update timestamp
 */
public record TaskResponse(
        Long id,
        String title,
        String description,
        TaskPriority priority,
        TaskStatus status,
        LocalDate dueDate,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
    /**
     * Factory method to create TaskResponse from Task entity.
     * Ensures consistent mapping and prevents entity exposure.
     * 
     * @param task the Task entity to convert
     * @return TaskResponse DTO
     */
    public static TaskResponse fromEntity(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getPriority(),
                task.getStatus(),
                task.getDueDate(),
                task.getCreatedAt(),
                task.getUpdatedAt());
    }
}
