package com.taskmanagement.controller;

import com.taskmanagement.dto.response.ApiResponse;
import com.taskmanagement.dto.response.NotificationResponse;
import com.taskmanagement.service.NotificationService;
import com.taskmanagement.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "User notifications")
public class NotificationController {
    private final NotificationService notificationService;
    private final UserService userService;

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> unread(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getUnread(ud.getUsername(), userService)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> recent(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getRecent(ud.getUsername(), userService)));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(
        @PathVariable UUID id,
        @AuthenticationPrincipal UserDetails ud
    ) {
        notificationService.markRead(id, ud.getUsername(), userService);
        return ResponseEntity.ok(ApiResponse.success(null, "Notification read"));
    }

    @PostMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead(@AuthenticationPrincipal UserDetails ud) {
        notificationService.markAllRead(ud.getUsername(), userService);
        return ResponseEntity.ok(ApiResponse.success(null, "Notifications read"));
    }
}
