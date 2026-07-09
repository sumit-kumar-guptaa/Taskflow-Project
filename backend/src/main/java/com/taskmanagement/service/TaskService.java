package com.taskmanagement.service;

import com.taskmanagement.dto.request.*;
import com.taskmanagement.dto.response.*;
import com.taskmanagement.entity.*;
import com.taskmanagement.exception.*;
import com.taskmanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final ActivityLogRepository activityLogRepository;
    private final UserService userService;
    private final NotificationService notificationService;
    
    @Transactional
    public TaskResponse createTask(String email, TaskRequest request) {
        User creator = userService.findByEmail(email);
        Project project = projectRepository.findById(request.getProjectId())
            .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        
        User assignee = null;
        if (request.getAssignedToId() != null) {
            assignee = userRepository.findById(request.getAssignedToId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));
        }
        
        Task task = Task.builder()
            .title(request.getTitle()).description(request.getDescription())
            .priority(request.getPriority() != null ? request.getPriority() : TaskPriority.MEDIUM)
            .status(request.getStatus() != null ? request.getStatus() : TaskStatus.TODO)
            .dueDate(request.getDueDate()).estimatedHours(request.getEstimatedHours())
            .assignedTo(assignee).createdBy(creator).project(project).build();
        
        Task saved = taskRepository.save(task);
        logActivity(saved, creator, "CREATED", "Task created: " + task.getTitle());
        if (assignee != null)
            logActivity(saved, creator, "ASSIGNED", "Task assigned to " + assignee.getName());
        if (assignee != null)
            notificationService.notifyTaskAssigned(saved, creator, assignee);
        return mapTask(saved);
    }
    
    public List<TaskResponse> getTasksByProject(UUID projectId) {
        return taskRepository.findByProjectId(projectId).stream()
            .map(this::mapTask).collect(Collectors.toList());
    }
    
    public TaskResponse getTaskById(UUID id) {
        return mapTask(findTask(id));
    }
    
    @Transactional
    public TaskResponse updateTask(UUID id, TaskRequest request, String email) {
        Task task = findTask(id);
        User user = userService.findByEmail(email);
        String changes = "";
        
        if (!task.getTitle().equals(request.getTitle())) {
            changes += "Title changed. ";
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getPriority() != null && task.getPriority() != request.getPriority()) {
            changes += "Priority changed to " + request.getPriority() + ". ";
            task.setPriority(request.getPriority());
        }
        if (request.getStatus() != null && task.getStatus() != request.getStatus()) {
            changes += "Status changed to " + request.getStatus() + ". ";
            task.setStatus(request.getStatus());
        }
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        if (request.getEstimatedHours() != null) task.setEstimatedHours(request.getEstimatedHours());
        if (request.getAssignedToId() != null) {
            User assignee = userRepository.findById(request.getAssignedToId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            task.setAssignedTo(assignee);
            changes += "Assigned to " + assignee.getName() + ". ";
        }
        
        Task saved = taskRepository.save(task);
        if (!changes.isEmpty()) logActivity(saved, user, "UPDATED", changes);
        if (saved.getAssignedTo() != null) {
            notificationService.notifyTaskUpdated(saved, user, saved.getAssignedTo());
        }
        return mapTask(saved);
    }
    
    @Transactional
    public void deleteTask(UUID id, String email) {
        taskRepository.deleteById(id);
    }
    
    public List<TaskResponse> getMyTasks(String email) {
        User user = userService.findByEmail(email);
        return taskRepository.findByAssignedToId(user.getId()).stream()
            .map(this::mapTask).collect(Collectors.toList());
    }
    
    public List<TaskResponse> searchTasks(String query) {
        return taskRepository.searchAll(query).stream().map(this::mapTask).collect(Collectors.toList());
    }
    
    private void logActivity(Task task, User user, String action, String details) {
        ActivityLog log = ActivityLog.builder()
            .action(action).details(details).task(task).user(user).build();
        activityLogRepository.save(log);
    }
    
    private Task findTask(UUID id) {
        return taskRepository.findByIdWithRelations(id)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    }
    
    public TaskResponse mapTask(Task task) {
        int commentCount = commentRepository.findByTaskIdOrderByCreatedAtDesc(task.getId()).size();
        return TaskResponse.builder()
            .id(task.getId()).title(task.getTitle()).description(task.getDescription())
            .priority(task.getPriority()).status(task.getStatus())
            .dueDate(task.getDueDate()).estimatedHours(task.getEstimatedHours())
            .assignedTo(task.getAssignedTo() != null ? userService.mapUser(task.getAssignedTo()) : null)
            .createdBy(task.getCreatedBy() != null ? userService.mapUser(task.getCreatedBy()) : null)
            .projectId(task.getProject() != null ? task.getProject().getId() : null)
            .projectTitle(task.getProject() != null ? task.getProject().getTitle() : null)
            .commentCount(commentCount)
            .createdAt(task.getCreatedAt()).updatedAt(task.getUpdatedAt()).build();
    }
}
