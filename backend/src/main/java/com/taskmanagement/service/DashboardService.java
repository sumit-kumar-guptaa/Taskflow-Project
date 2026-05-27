package com.taskmanagement.service;

import com.taskmanagement.dto.response.*;
import com.taskmanagement.entity.*;
import com.taskmanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final ActivityLogRepository activityLogRepository;
    private final UserService userService;
    private final ProjectService projectService;
    private final TaskService taskService;
    
    public DashboardResponse getDashboard(String email) {
        User user = userService.findByEmail(email);
        
        long totalProjects = projectRepository.findProjectsByTeamMember(user.getId()).size();
        long activeProjects = projectRepository.findProjectsByTeamMember(user.getId()).stream()
            .filter(p -> p.getStatus() == ProjectStatus.ACTIVE).count();
        long totalTasks = taskRepository.countByAssignedToAndStatus(user.getId(), TaskStatus.TODO)
            + taskRepository.countByAssignedToAndStatus(user.getId(), TaskStatus.IN_PROGRESS)
            + taskRepository.countByAssignedToAndStatus(user.getId(), TaskStatus.COMPLETED);
        long completedTasks = taskRepository.countByAssignedToAndStatus(user.getId(), TaskStatus.COMPLETED);
        long inProgressTasks = taskRepository.countByAssignedToAndStatus(user.getId(), TaskStatus.IN_PROGRESS);
        long todoTasks = taskRepository.countByAssignedToAndStatus(user.getId(), TaskStatus.TODO);
        long overdueTasks = taskRepository.findOverdueTasks(LocalDate.now()).stream()
            .filter(t -> t.getAssignedTo() != null && t.getAssignedTo().getId().equals(user.getId())).count();
        long totalTeams = teamRepository.findTeamsByUserId(user.getId()).size();
        
        List<ActivityLogResponse> recentActivity = activityLogRepository
            .findRecentActivity(PageRequest.of(0, 10)).stream()
            .map(this::mapActivity).collect(Collectors.toList());
        
        List<TaskResponse> myTasks = taskRepository.findByAssignedToId(user.getId()).stream()
            .limit(5).map(taskService::mapTask).collect(Collectors.toList());
        
        List<ProjectResponse> recentProjects = projectRepository.findProjectsByTeamMember(user.getId()).stream()
            .limit(4).map(projectService::mapProject).collect(Collectors.toList());
        
        Map<String, Long> tasksByPriority = Map.of(
            "LOW", taskRepository.findByAssignedToId(user.getId()).stream()
                .filter(t -> t.getPriority() == TaskPriority.LOW).count(),
            "MEDIUM", taskRepository.findByAssignedToId(user.getId()).stream()
                .filter(t -> t.getPriority() == TaskPriority.MEDIUM).count(),
            "HIGH", taskRepository.findByAssignedToId(user.getId()).stream()
                .filter(t -> t.getPriority() == TaskPriority.HIGH).count()
        );
        
        return DashboardResponse.builder()
            .totalProjects(totalProjects).activeProjects(activeProjects)
            .totalTasks(totalTasks).completedTasks(completedTasks)
            .inProgressTasks(inProgressTasks).todoTasks(todoTasks)
            .overdueTasks(overdueTasks).totalTeams(totalTeams)
            .recentActivity(recentActivity).myTasks(myTasks)
            .recentProjects(recentProjects).tasksByPriority(tasksByPriority).build();
    }
    
    private ActivityLogResponse mapActivity(ActivityLog log) {
        return ActivityLogResponse.builder()
            .id(log.getId()).action(log.getAction()).details(log.getDetails())
            .user(log.getUser() != null ? userService.mapUser(log.getUser()) : null)
            .taskId(log.getTask() != null ? log.getTask().getId() : null)
            .taskTitle(log.getTask() != null ? log.getTask().getTitle() : null)
            .timestamp(log.getTimestamp()).build();
    }
}
