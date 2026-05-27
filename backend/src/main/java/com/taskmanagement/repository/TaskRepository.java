package com.taskmanagement.repository;

import com.taskmanagement.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import java.util.*;

public interface TaskRepository extends JpaRepository<Task, UUID>, JpaSpecificationExecutor<Task> {
    List<Task> findByProjectId(UUID projectId);
    List<Task> findByAssignedToId(UUID userId);
    List<Task> findByProjectIdAndStatus(UUID projectId, TaskStatus status);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignedTo.id = :userId AND t.status = :status")
    long countByAssignedToAndStatus(UUID userId, TaskStatus status);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId AND t.status = :status")
    long countByProjectAndStatus(UUID projectId, TaskStatus status);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.status = :status")
    long countByStatus(TaskStatus status);
    
    @Query("SELECT t FROM Task t WHERE (t.title LIKE %:q% OR t.description LIKE %:q%) AND t.project.id = :projectId")
    List<Task> searchInProject(String q, UUID projectId);
    
    @Query("SELECT t FROM Task t WHERE t.title LIKE %:q% OR t.description LIKE %:q%")
    List<Task> searchAll(String q);
    
    @Query("SELECT t FROM Task t WHERE t.dueDate <= :date AND t.status != 'COMPLETED' ORDER BY t.dueDate")
    List<Task> findOverdueTasks(java.time.LocalDate date);
}
