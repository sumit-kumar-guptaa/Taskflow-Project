package com.taskmanagement.service;

import com.taskmanagement.dto.request.CommentRequest;
import com.taskmanagement.dto.response.CommentResponse;
import com.taskmanagement.entity.*;
import com.taskmanagement.exception.*;
import com.taskmanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final ActivityLogRepository activityLogRepository;
    private final UserService userService;
    
    public CommentResponse addComment(UUID taskId, String email, CommentRequest request) {
        User user = userService.findByEmail(email);
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        
        Comment comment = Comment.builder()
            .content(request.getContent()).task(task).user(user).build();
        Comment saved = commentRepository.save(comment);
        
        ActivityLog log = ActivityLog.builder()
            .action("COMMENTED").details(user.getName() + " commented on task")
            .task(task).user(user).build();
        activityLogRepository.save(log);
        
        return mapComment(saved);
    }
    
    public List<CommentResponse> getTaskComments(UUID taskId) {
        return commentRepository.findByTaskIdOrderByCreatedAtDesc(taskId).stream()
            .map(this::mapComment).collect(Collectors.toList());
    }
    
    public void deleteComment(UUID id, String email) {
        Comment comment = commentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        if (!comment.getUser().getEmail().equals(email))
            throw new UnauthorizedException("Not authorized to delete this comment");
        commentRepository.delete(comment);
    }
    
    private CommentResponse mapComment(Comment c) {
        return CommentResponse.builder()
            .id(c.getId()).content(c.getContent())
            .user(userService.mapUser(c.getUser()))
            .createdAt(c.getCreatedAt()).updatedAt(c.getUpdatedAt()).build();
    }
}
