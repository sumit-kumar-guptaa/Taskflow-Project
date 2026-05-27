package com.taskmanagement.controller;

import com.taskmanagement.dto.request.*;
import com.taskmanagement.dto.response.*;
import com.taskmanagement.service.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Task management endpoints")
public class TaskController {
    private final TaskService taskService;
    private final CommentService commentService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<TaskResponse>> create(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(taskService.createTask(ud.getUsername(), request)));
    }
    
    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getByProject(@PathVariable UUID projectId) {
        return ResponseEntity.ok(ApiResponse.success(taskService.getTasksByProject(projectId)));
    }
    
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getMyTasks(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(taskService.getMyTasks(ud.getUsername())));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(taskService.getTaskById(id)));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(taskService.updateTask(id, request, ud.getUsername())));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id, @AuthenticationPrincipal UserDetails ud) {
        taskService.deleteTask(id, ud.getUsername());
        return ResponseEntity.ok(ApiResponse.success(null, "Task deleted"));
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> search(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.success(taskService.searchTasks(q)));
    }
    
    // Comments
    @PostMapping("/{taskId}/comments")
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable UUID taskId, @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody CommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(commentService.addComment(taskId, ud.getUsername(), request)));
    }
    
    @GetMapping("/{taskId}/comments")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(@PathVariable UUID taskId) {
        return ResponseEntity.ok(ApiResponse.success(commentService.getTaskComments(taskId)));
    }
    
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable UUID commentId, @AuthenticationPrincipal UserDetails ud) {
        commentService.deleteComment(commentId, ud.getUsername());
        return ResponseEntity.ok(ApiResponse.success(null, "Comment deleted"));
    }
}
