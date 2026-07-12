package com.taskmanagement.dto.response;

import com.taskmanagement.entity.NotificationType;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private UUID id;
    private NotificationType type;
    private String message;
    private boolean read;
    private UUID taskId;
    private String taskTitle;
    private UUID actorId;
    private String actorName;
    private LocalDateTime createdAt;
}
