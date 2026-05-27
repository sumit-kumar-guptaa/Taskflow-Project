package com.taskmanagement.dto.request;

import com.taskmanagement.entity.ProjectStatus;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class ProjectRequest {
    @NotBlank @Size(min=2, max=200)
    private String title;
    
    private String description;
    private LocalDate deadline;
    private ProjectStatus status = ProjectStatus.ACTIVE;
    private String color;
    
    @NotNull
    private UUID teamId;
}
