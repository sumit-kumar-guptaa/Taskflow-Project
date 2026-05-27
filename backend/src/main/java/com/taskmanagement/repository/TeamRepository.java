package com.taskmanagement.repository;

import com.taskmanagement.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.*;

public interface TeamRepository extends JpaRepository<Team, UUID> {
    @Query("SELECT t FROM Team t JOIN t.members m WHERE m.id = :userId")
    List<Team> findTeamsByUserId(UUID userId);
    
    @Query("SELECT t FROM Team t WHERE t.createdBy.id = :userId")
    List<Team> findTeamsCreatedBy(UUID userId);
}
