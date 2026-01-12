package com.focusbuddy.service;

import com.focusbuddy.dto.request.CreateTaskRequest;
import com.focusbuddy.dto.request.UpdateTaskRequest;
import com.focusbuddy.exception.ResourceNotFoundException;
import com.focusbuddy.exception.UnauthorizedException;
import com.focusbuddy.model.Task;
import com.focusbuddy.model.Task.TaskPriority;
import com.focusbuddy.model.Task.TaskStatus;
import com.focusbuddy.model.User;
import com.focusbuddy.repository.TaskRepository;
import com.focusbuddy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service layer for Task business logic.
 * 
 * Handles all task-related operations including CRUD, filtering,
 * and ownership authorization. Business logic is isolated here
 * to keep controllers thin and focused on HTTP concerns.
 * 
 * Key features:
 * - All operations include user ownership verification
 * - Soft delete preserves data for analytics
 * - Partial updates support (only non-null fields updated)
 * 
 * @author FocusBuddy Team
 */
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    /**
     * Create a new task for the authenticated user.
     * 
     * Defaults priority to MEDIUM and status to TODO if not specified.
     * 
     * @param userId  the ID of the authenticated user
     * @param request the task creation request with title, description, etc.
     * @return the newly created Task entity
     * @throws ResourceNotFoundException if user not found
     */
    @Transactional
    public Task createTask(Long userId, CreateTaskRequest request) {
        // Fetch user to establish relationship
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Create and populate task entity
        Task task = new Task();
        task.setUser(user);
        task.setTitle(request.title());
        task.setDescription(request.description());

        // Apply priority, defaulting to MEDIUM if not provided
        task.setPriority(request.priority() != null ? request.priority() : TaskPriority.MEDIUM);

        // Due date is optional
        task.setDueDate(request.dueDate());

        return taskRepository.save(task);
    }

    /**
     * Retrieve a single task by ID with ownership verification.
     * 
     * @param userId the ID of the authenticated user
     * @param taskId the ID of the task to retrieve
     * @return the Task entity
     * @throws ResourceNotFoundException if task not found
     * @throws UnauthorizedException     if user doesn't own the task
     */
    public Task getTask(Long userId, Long taskId) {
        return getTaskWithOwnershipCheck(userId, taskId);
    }

    /**
     * Retrieve all tasks for the authenticated user.
     * 
     * @param userId the ID of the authenticated user
     * @return list of user's tasks (newest first)
     */
    public List<Task> getAllTasks(Long userId) {
        return taskRepository.findByUserIdAndDeletedFalseOrderByCreatedAtDesc(userId);
    }

    /**
     * Retrieve tasks filtered by status.
     * 
     * @param userId the ID of the authenticated user
     * @param status the status to filter by
     * @return list of matching tasks
     */
    public List<Task> getTasksByStatus(Long userId, TaskStatus status) {
        return taskRepository.findByUserIdAndStatusAndDeletedFalseOrderByCreatedAtDesc(userId, status);
    }

    /**
     * Retrieve tasks filtered by priority.
     * 
     * @param userId   the ID of the authenticated user
     * @param priority the priority to filter by
     * @return list of matching tasks
     */
    public List<Task> getTasksByPriority(Long userId, TaskPriority priority) {
        return taskRepository.findByUserIdAndPriorityAndDeletedFalseOrderByCreatedAtDesc(userId, priority);
    }

    /**
     * Update an existing task with partial data.
     * 
     * Only non-null fields in the request are applied to the task.
     * This enables PATCH-style updates without overwriting existing data.
     * 
     * @param userId  the ID of the authenticated user
     * @param taskId  the ID of the task to update
     * @param request the update request with optional fields
     * @return the updated Task entity
     * @throws ResourceNotFoundException if task not found
     * @throws UnauthorizedException     if user doesn't own the task
     */
    @Transactional
    public Task updateTask(Long userId, Long taskId, UpdateTaskRequest request) {
        Task task = getTaskWithOwnershipCheck(userId, taskId);

        // Apply non-null updates (PATCH semantics)
        if (request.title() != null && !request.title().isBlank()) {
            task.setTitle(request.title());
        }
        if (request.description() != null) {
            task.setDescription(request.description());
        }
        if (request.priority() != null) {
            task.setPriority(request.priority());
        }
        if (request.status() != null) {
            task.setStatus(request.status());
        }
        if (request.dueDate() != null) {
            task.setDueDate(request.dueDate());
        }

        return taskRepository.save(task);
    }

    /**
     * Soft delete a task.
     * 
     * The task is marked as deleted but preserved in the database
     * for potential recovery and analytics purposes.
     * 
     * @param userId the ID of the authenticated user
     * @param taskId the ID of the task to delete
     * @throws ResourceNotFoundException if task not found
     * @throws UnauthorizedException     if user doesn't own the task
     */
    @Transactional
    public void deleteTask(Long userId, Long taskId) {
        Task task = getTaskWithOwnershipCheck(userId, taskId);
        task.setDeleted(true);
        taskRepository.save(task);
    }

    /**
     * Get count of pending (non-completed) tasks for a user.
     * Useful for dashboard statistics.
     * 
     * @param userId the ID of the user
     * @return count of pending tasks
     */
    public long getPendingTaskCount(Long userId) {
        return taskRepository.countPendingTasks(userId);
    }

    /**
     * Private helper to retrieve a task with ownership verification.
     * 
     * Ensures the task exists, is not deleted, and belongs to the
     * requesting user. Centralizes authorization logic.
     * 
     * @param userId the ID of the authenticated user
     * @param taskId the ID of the task to retrieve
     * @return the Task entity
     * @throws ResourceNotFoundException if task not found
     * @throws UnauthorizedException     if user doesn't own the task
     */
    private Task getTaskWithOwnershipCheck(Long userId, Long taskId) {
        Task task = taskRepository.findByIdAndDeletedFalse(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        // Verify ownership
        if (!task.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to access this task");
        }

        return task;
    }
}
