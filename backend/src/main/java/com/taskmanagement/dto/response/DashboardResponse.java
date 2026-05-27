package com.taskmanagement.dto.response;

import lombok.*;
import java.util.List;
import java.util.Map;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardResponse {
    private long totalProjects;
    private long activeProjects;
    private long totalTasks;
    private long completedTasks;
    private long inProgressTasks;
    private long todoTasks;
    private long overdueTasks;
    private long totalTeams;
    private List<ActivityLogResponse> recentActivity;
    private List<TaskResponse> myTasks;
    private List<ProjectResponse> recentProjects;
    private Map<String, Long> tasksByPriority;
}
