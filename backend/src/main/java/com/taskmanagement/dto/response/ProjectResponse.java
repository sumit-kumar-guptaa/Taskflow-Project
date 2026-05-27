package com.taskmanagement.dto.response;

import com.taskmanagement.entity.ProjectStatus;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ProjectResponse {
    private UUID id;
    private String title;
    private String description;
    private LocalDate deadline;
    private ProjectStatus status;
    private String color;
    private UserResponse createdBy;
    private UUID teamId;
    private String teamName;
    private int totalTasks;
    private int completedTasks;
    private int inProgressTasks;
    private int todoTasks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
