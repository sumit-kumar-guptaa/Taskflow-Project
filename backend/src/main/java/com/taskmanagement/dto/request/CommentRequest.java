package com.taskmanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CommentRequest {
    @NotBlank
    private String content;
}
