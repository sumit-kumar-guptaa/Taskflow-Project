package com.taskmanagement.service;

import com.taskmanagement.dto.request.ProjectRequest;
import com.taskmanagement.dto.response.*;
import com.taskmanagement.entity.*;
import com.taskmanagement.exception.*;
import com.taskmanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final TaskRepository taskRepository;
    private final UserService userService;
    
    public ProjectResponse createProject(String email, ProjectRequest request) {
        User creator = userService.findByEmail(email);
        Team team = teamRepository.findById(request.getTeamId())
            .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
        
        Project project = Project.builder()
            .title(request.getTitle())
            .description(request.getDescription())
            .deadline(request.getDeadline())
            .status(request.getStatus() != null ? request.getStatus() : ProjectStatus.ACTIVE)
            .color(request.getColor() != null ? request.getColor() : "#6366f1")
            .createdBy(creator)
            .team(team)
            .build();
        
        return mapProject(projectRepository.save(project));
    }
    
    public List<ProjectResponse> getMyProjects(String email) {
        User user = userService.findByEmail(email);
        return projectRepository.findProjectsByTeamMember(user.getId()).stream()
            .map(this::mapProject).collect(Collectors.toList());
    }
    
    public ProjectResponse getProjectById(UUID id) {
        return mapProject(findProject(id));
    }
    
    public ProjectResponse updateProject(UUID id, ProjectRequest request) {
        Project project = findProject(id);
        project.setTitle(request.getTitle());
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getDeadline() != null) project.setDeadline(request.getDeadline());
        if (request.getStatus() != null) project.setStatus(request.getStatus());
        if (request.getColor() != null) project.setColor(request.getColor());
        return mapProject(projectRepository.save(project));
    }
    
    public void deleteProject(UUID id) {
        projectRepository.deleteById(id);
    }
    
    public List<ProjectResponse> getAllProjects() {
        return projectRepository.findAll().stream().map(this::mapProject).collect(Collectors.toList());
    }
    
    private Project findProject(UUID id) {
        return projectRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
    }
    
    public ProjectResponse mapProject(Project project) {
        long total = taskRepository.countByProjectAndStatus(project.getId(), null) >= 0 ?
            taskRepository.findByProjectId(project.getId()).size() : 0;
        long completed = taskRepository.countByProjectAndStatus(project.getId(), TaskStatus.COMPLETED);
        long inProgress = taskRepository.countByProjectAndStatus(project.getId(), TaskStatus.IN_PROGRESS);
        long todo = taskRepository.countByProjectAndStatus(project.getId(), TaskStatus.TODO);
        
        return ProjectResponse.builder()
            .id(project.getId()).title(project.getTitle())
            .description(project.getDescription()).deadline(project.getDeadline())
            .status(project.getStatus()).color(project.getColor())
            .createdBy(userService.mapUser(project.getCreatedBy()))
            .teamId(project.getTeam() != null ? project.getTeam().getId() : null)
            .teamName(project.getTeam() != null ? project.getTeam().getTeamName() : null)
            .totalTasks((int)total).completedTasks((int)completed)
            .inProgressTasks((int)inProgress).todoTasks((int)todo)
            .createdAt(project.getCreatedAt()).updatedAt(project.getUpdatedAt()).build();
    }
}
