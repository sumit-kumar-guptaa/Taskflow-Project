package com.taskmanagement.dto.response;

import com.taskmanagement.entity.Role;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserResponse {
    private UUID id;
    private String name;
    private String email;
    private Role role;
    private String profileImage;
    private String bio;
    private String jobTitle;
    private LocalDateTime createdAt;
}
