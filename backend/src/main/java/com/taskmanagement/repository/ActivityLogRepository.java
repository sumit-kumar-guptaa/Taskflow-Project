package com.taskmanagement.repository;

import com.taskmanagement.entity.ActivityLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.*;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, UUID> {
    List<ActivityLog> findByTaskIdOrderByTimestampDesc(UUID taskId);
    
    @Query("SELECT a FROM ActivityLog a ORDER BY a.timestamp DESC")
    List<ActivityLog> findRecentActivity(Pageable pageable);
    
    @Query("SELECT a FROM ActivityLog a WHERE a.user.id = :userId ORDER BY a.timestamp DESC")
    List<ActivityLog> findByUserId(UUID userId, Pageable pageable);
}
