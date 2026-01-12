package com.focusbuddy.repository;

import com.focusbuddy.model.Task;
import com.focusbuddy.model.Task.TaskStatus;
import com.focusbuddy.model.Task.TaskPriority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Task entity persistence operations.
 * 
 * Extends JpaRepository for standard CRUD operations and provides
 * custom query methods for task filtering and retrieval.
 * 
 * All queries filter out soft-deleted tasks (deleted = false) by default.
 * 
 * @author FocusBuddy Team
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Find all non-deleted tasks for a specific user.
     * Ordered by creation date (newest first).
     * 
     * @param userId the ID of the user
     * @return list of tasks belonging to the user
     */
    List<Task> findByUserIdAndDeletedFalseOrderByCreatedAtDesc(Long userId);

    /**
     * Find all non-deleted tasks for a user with a specific status.
     * Useful for filtering tasks by completion state.
     * 
     * @param userId the ID of the user
     * @param status the task status to filter by
     * @return list of matching tasks
     */
    List<Task> findByUserIdAndStatusAndDeletedFalseOrderByCreatedAtDesc(Long userId, TaskStatus status);

    /**
     * Find all non-deleted tasks for a user with a specific priority.
     * Useful for showing high-priority items first.
     * 
     * @param userId   the ID of the user
     * @param priority the priority level to filter by
     * @return list of matching tasks
     */
    List<Task> findByUserIdAndPriorityAndDeletedFalseOrderByCreatedAtDesc(Long userId, TaskPriority priority);

    /**
     * Find a specific task by ID, ensuring it's not deleted.
     * Used for single task retrieval operations.
     * 
     * @param id the task ID
     * @return Optional containing the task if found and not deleted
     */
    Optional<Task> findByIdAndDeletedFalse(Long id);

    /**
     * Find tasks due on or before a specific date.
     * Useful for deadline warnings and overdue task detection.
     * 
     * @param userId  the ID of the user
     * @param dueDate the cutoff date
     * @return list of tasks due by the specified date
     */
    @Query("SELECT t FROM Task t WHERE t.user.id = :userId " +
            "AND t.deleted = false AND t.dueDate <= :dueDate " +
            "ORDER BY t.dueDate ASC")
    List<Task> findTasksDueBefore(@Param("userId") Long userId,
            @Param("dueDate") LocalDate dueDate);

    /**
     * Count incomplete tasks (TODO or IN_PROGRESS) for a user.
     * Useful for dashboard statistics.
     * 
     * @param userId the ID of the user
     * @return count of pending tasks
     */
    @Query("SELECT COUNT(t) FROM Task t WHERE t.user.id = :userId " +
            "AND t.deleted = false AND t.status != 'COMPLETED'")
    long countPendingTasks(@Param("userId") Long userId);
}
