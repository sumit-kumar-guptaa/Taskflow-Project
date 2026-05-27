package com.taskmanagement.dto.request;

import com.taskmanagement.entity.TaskPriority;
import com.taskmanagement.entity.TaskStatus;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class TaskRequest {
    @NotBlank @Size(min=2, max=200)
    private String title;
    
    private String description;
    
    private TaskPriority priority = TaskPriority.MEDIUM;
    private TaskStatus status = TaskStatus.TODO;
    private LocalDate dueDate;
    private Integer estimatedHours;
    private UUID assignedToId;
    
    @NotNull
    private UUID projectId;
}
