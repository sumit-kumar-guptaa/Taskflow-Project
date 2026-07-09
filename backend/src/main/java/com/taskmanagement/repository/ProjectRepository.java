package com.taskmanagement.repository;

import com.taskmanagement.entity.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.*;

public interface ProjectRepository extends JpaRepository<Project, UUID> {
    List<Project> findByTeamId(UUID teamId);
    List<Project> findByCreatedById(UUID userId);

    long countByTeamId(UUID teamId);
    
    @Query("SELECT DISTINCT p FROM Project p " +
           "LEFT JOIN FETCH p.team t " +
           "LEFT JOIN FETCH p.createdBy cb " +
           "WHERE p.team.id IN " +
           "(SELECT t2.id FROM Team t2 JOIN t2.members m WHERE m.id = :userId)")
    List<Project> findProjectsByTeamMember(UUID userId);
    
    Page<Project> findByStatus(ProjectStatus status, Pageable pageable);
    
    @Query("SELECT COUNT(p) FROM Project p WHERE p.status = :status")
    long countByStatus(ProjectStatus status);
}
