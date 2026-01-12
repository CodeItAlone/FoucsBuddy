package com.focusbuddy.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.EqualsAndHashCode;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity representing a user's task/to-do item.
 * 
 * Tasks are independent of focus sessions and represent items
 * in a user's to-do list. Users can optionally link focus sessions
 * to specific tasks for productivity tracking.
 * 
 * Features:
 * - Priority levels (LOW, MEDIUM, HIGH) for task organization
 * - Status tracking (TODO, IN_PROGRESS, COMPLETED)
 * - Optional due dates for deadline management
 * - Soft delete support for data preservation
 * 
 * @author FocusBuddy Team
 */
@Entity
@Table(name = "tasks", indexes = {
        @Index(name = "idx_task_user_id", columnList = "user_id"),
        @Index(name = "idx_task_status", columnList = "status"),
        @Index(name = "idx_task_due_date", columnList = "due_date")
})
@Data
@NoArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The user who owns this task.
     * Lazy-loaded to prevent N+1 queries when fetching task lists.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonIgnore
    private User user;

    /**
     * Short title of the task (required).
     * Limited to 100 characters for display purposes.
     */
    @Column(nullable = false, length = 100)
    private String title;

    /**
     * Optional detailed description of the task.
     * Supports up to 500 characters for additional context.
     */
    @Column(length = 500)
    private String description;

    /**
     * Priority level for task organization and sorting.
     * Defaults to MEDIUM if not specified.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TaskPriority priority = TaskPriority.MEDIUM;

    /**
     * Current status of the task.
     * Follows TODO -> IN_PROGRESS -> COMPLETED workflow.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private TaskStatus status = TaskStatus.TODO;

    /**
     * Optional due date for deadline tracking.
     * Can be null for tasks without deadlines.
     */
    @Column(name = "due_date")
    private LocalDate dueDate;

    /**
     * Timestamp when the task was created.
     * Automatically set on entity creation.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Timestamp of the last update to this task.
     * Updated automatically on any modification.
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    /**
     * Soft delete flag.
     * When true, the task is hidden from user queries but preserved in database.
     */
    @Column(nullable = false)
    private boolean deleted = false;

    /**
     * Priority levels for task organization.
     * Used for sorting and filtering tasks by importance.
     */
    public enum TaskPriority {
        LOW, // Can be done whenever time permits
        MEDIUM, // Should be done soon (default)
        HIGH // Urgent, requires immediate attention
    }

    /**
     * Status workflow for task lifecycle.
     * Tasks progress from TODO -> IN_PROGRESS -> COMPLETED.
     */
    public enum TaskStatus {
        TODO, // Not yet started
        IN_PROGRESS, // Currently being worked on
        COMPLETED // Finished
    }

    /**
     * Lifecycle callback to update the updatedAt timestamp
     * before any update operation.
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
