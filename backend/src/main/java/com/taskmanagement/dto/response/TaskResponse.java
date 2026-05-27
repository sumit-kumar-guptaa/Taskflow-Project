package com.taskmanagement.dto.response;

import com.taskmanagement.entity.TaskPriority;
import com.taskmanagement.entity.TaskStatus;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TaskResponse {
    private UUID id;
    private String title;
    private String description;
    private TaskPriority priority;
    private TaskStatus status;
    private LocalDate dueDate;
    private Integer estimatedHours;
    private UserResponse assignedTo;
    private UserResponse createdBy;
    private UUID projectId;
    private String projectTitle;
    private int commentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
