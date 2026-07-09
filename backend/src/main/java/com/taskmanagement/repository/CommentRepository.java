package com.taskmanagement.repository;

import com.taskmanagement.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.*;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
    @Query("SELECT c FROM Comment c " +
        "JOIN FETCH c.user u " +
        "JOIN FETCH c.task t " +
        "WHERE t.id = :taskId " +
        "ORDER BY c.createdAt DESC")
    List<Comment> findByTaskIdOrderByCreatedAtDesc(UUID taskId);
}
