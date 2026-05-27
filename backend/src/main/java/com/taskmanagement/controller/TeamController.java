package com.taskmanagement.controller;

import com.taskmanagement.dto.request.TeamRequest;
import com.taskmanagement.dto.response.*;
import com.taskmanagement.service.TeamService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
@Tag(name = "Teams", description = "Team management endpoints")
public class TeamController {
    private final TeamService teamService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<TeamResponse>> create(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody TeamRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(teamService.createTeam(ud.getUsername(), request), "Team created"));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<TeamResponse>>> getMyTeams(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(teamService.getMyTeams(ud.getUsername())));
    }
    
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<TeamResponse>>> getAllTeams() {
        return ResponseEntity.ok(ApiResponse.success(teamService.getAllTeams()));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TeamResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(teamService.getTeamById(id)));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TeamResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody TeamRequest request,
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(teamService.updateTeam(id, request, ud.getUsername())));
    }
    
    @PostMapping("/{teamId}/members/{userId}")
    public ResponseEntity<ApiResponse<TeamResponse>> addMember(
            @PathVariable UUID teamId, @PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.success(teamService.addMember(teamId, userId), "Member added"));
    }
    
    @DeleteMapping("/{teamId}/members/{userId}")
    public ResponseEntity<ApiResponse<TeamResponse>> removeMember(
            @PathVariable UUID teamId, @PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.success(teamService.removeMember(teamId, userId), "Member removed"));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        teamService.deleteTeam(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Team deleted"));
    }
}
