package com.taskmanagement.controller;

import com.taskmanagement.dto.request.ProjectRequest;
import com.taskmanagement.dto.response.*;
import com.taskmanagement.service.ProjectService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Project management endpoints")
public class ProjectController {
    private final ProjectService projectService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> create(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(projectService.createProject(ud.getUsername(), request)));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getMyProjects(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getMyProjects(ud.getUsername())));
    }
    
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getAllProjects() {
        return ResponseEntity.ok(ApiResponse.success(projectService.getAllProjects()));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getProjectById(id)));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(ApiResponse.success(projectService.updateProject(id, request)));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Project deleted"));
    }
}
