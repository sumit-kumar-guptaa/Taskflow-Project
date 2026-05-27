package com.taskmanagement.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TeamResponse {
    private UUID id;
    private String teamName;
    private String description;
    private UserResponse createdBy;
    private List<UserResponse> members;
    private int projectCount;
    private LocalDateTime createdAt;
}
