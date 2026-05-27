package com.taskmanagement.repository;

import com.taskmanagement.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
    List<Comment> findByTaskIdOrderByCreatedAtDesc(UUID taskId);
}
