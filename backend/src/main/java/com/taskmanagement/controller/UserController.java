package com.taskmanagement.controller;

import com.taskmanagement.dto.request.*;
import com.taskmanagement.dto.response.*;
import com.taskmanagement.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management endpoints")
public class UserController {
    private final UserService userService;
    
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMe(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(userService.getCurrentUser(ud.getUsername())));
    }
    
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateProfile(ud.getUsername(), request)));
    }
    
    @PostMapping("/me/avatar")
    public ResponseEntity<ApiResponse<UserResponse>> uploadAvatar(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam MultipartFile file) throws Exception {
        return ResponseEntity.ok(ApiResponse.success(userService.uploadProfileImage(ud.getUsername(), file)));
    }
    
    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(ud.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password changed successfully"));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers()));
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserResponse>>> search(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.success(userService.searchUsers(q)));
    }
}
