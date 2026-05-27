package com.taskmanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @Size(min=2, max=100)
    private String name;
    private String bio;
    private String jobTitle;
}
