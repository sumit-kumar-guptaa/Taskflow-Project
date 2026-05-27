package com.taskmanagement.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ActivityLogResponse {
    private UUID id;
    private String action;
    private String details;
    private UserResponse user;
    private UUID taskId;
    private String taskTitle;
    private LocalDateTime timestamp;
}
