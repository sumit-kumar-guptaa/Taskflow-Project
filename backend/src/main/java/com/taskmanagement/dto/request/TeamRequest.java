package com.taskmanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class TeamRequest {
    @NotBlank @Size(min=2, max=100)
    private String teamName;
    
    private String description;
}
