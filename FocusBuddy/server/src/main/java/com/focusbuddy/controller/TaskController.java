package com.focusbuddy.controller;

import com.focusbuddy.dto.request.CreateTaskRequest;
import com.focusbuddy.dto.request.UpdateTaskRequest;
import com.focusbuddy.dto.response.TaskResponse;
import com.focusbuddy.model.Task;
import com.focusbuddy.model.Task.TaskPriority;
import com.focusbuddy.model.Task.TaskStatus;
import com.focusbuddy.security.CurrentUserService;
import com.focusbuddy.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Task management endpoints.
 * 
 * Provides CRUD operations for user tasks with proper authentication
 * and authorization. All endpoints require JWT authentication.
 * 
 * Endpoints:
 * - POST /api/tasks - Create new task
 * - GET /api/tasks - List all tasks (with optional filters)
 * - GET /api/tasks/{id} - Get single task
 * - PUT /api/tasks/{id} - Update task
 * - DELETE /api/tasks/{id} - Delete task (soft delete)
 * - GET /api/tasks/count - Get pending task count
 * 
 * @author FocusBuddy Team
 */
@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final CurrentUserService currentUserService;

    /**
     * Create a new task.
     * 
     * @param userDetails authenticated user details from JWT
     * @param request     task creation request body
     * @return created task with 201 status
     */
    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateTaskRequest request) {

        Long userId = currentUserService.getUserId(userDetails);
        Task task = taskService.createTask(userId, request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(TaskResponse.fromEntity(task));
    }

    /**
     * Get all tasks for the authenticated user.
     * 
     * Supports optional filtering by status or priority.
     * 
     * @param userDetails authenticated user details from JWT
     * @param status      optional status filter (TODO, IN_PROGRESS, COMPLETED)
     * @param priority    optional priority filter (LOW, MEDIUM, HIGH)
     * @return list of matching tasks
     */
    @GetMapping
    public ResponseEntity<List<TaskResponse>> getTasks(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) TaskPriority priority) {

        Long userId = currentUserService.getUserId(userDetails);
        List<Task> tasks;

        // Apply filters if provided
        if (status != null) {
            tasks = taskService.getTasksByStatus(userId, status);
        } else if (priority != null) {
            tasks = taskService.getTasksByPriority(userId, priority);
        } else {
            tasks = taskService.getAllTasks(userId);
        }

        List<TaskResponse> response = tasks.stream()
                .map(TaskResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(response);
    }

    /**
     * Get a specific task by ID.
     * 
     * @param userDetails authenticated user details from JWT
     * @param id          task ID from path
     * @return task details
     */
    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTask(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        Long userId = currentUserService.getUserId(userDetails);
        Task task = taskService.getTask(userId, id);

        return ResponseEntity.ok(TaskResponse.fromEntity(task));
    }

    /**
     * Update an existing task.
     * 
     * Supports partial updates - only non-null fields are applied.
     * 
     * @param userDetails authenticated user details from JWT
     * @param id          task ID from path
     * @param request     update request with optional fields
     * @return updated task
     */
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskRequest request) {

        Long userId = currentUserService.getUserId(userDetails);
        Task task = taskService.updateTask(userId, id, request);

        return ResponseEntity.ok(TaskResponse.fromEntity(task));
    }

    /**
     * Delete a task (soft delete).
     * 
     * Task is marked as deleted but preserved in database.
     * 
     * @param userDetails authenticated user details from JWT
     * @param id          task ID from path
     * @return 204 No Content on success
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        Long userId = currentUserService.getUserId(userDetails);
        taskService.deleteTask(userId, id);

        return ResponseEntity.noContent().build();
    }

    /**
     * Get count of pending (incomplete) tasks.
     * 
     * Useful for dashboard widgets and notifications.
     * 
     * @param userDetails authenticated user details from JWT
     * @return count of pending tasks
     */
    @GetMapping("/count")
    public ResponseEntity<Long> getPendingTaskCount(
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = currentUserService.getUserId(userDetails);
        long count = taskService.getPendingTaskCount(userId);

        return ResponseEntity.ok(count);
    }
}
