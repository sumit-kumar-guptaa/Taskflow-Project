package com.taskmanagement.service;

import com.taskmanagement.dto.request.TeamRequest;
import com.taskmanagement.dto.response.*;
import com.taskmanagement.entity.*;
import com.taskmanagement.exception.*;
import com.taskmanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamService {
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    
    public TeamResponse createTeam(String creatorEmail, TeamRequest request) {
        User creator = userService.findByEmail(creatorEmail);
        Team team = Team.builder()
            .teamName(request.getTeamName())
            .description(request.getDescription())
            .createdBy(creator)
            .build();
        team.getMembers().add(creator);
        return mapTeam(teamRepository.save(team));
    }
    
    public List<TeamResponse> getMyTeams(String email) {
        User user = userService.findByEmail(email);
        return teamRepository.findTeamsByUserId(user.getId()).stream()
            .map(this::mapTeam).collect(Collectors.toList());
    }
    
    public TeamResponse getTeamById(UUID id) {
        return mapTeam(teamRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Team not found")));
    }
    
    public TeamResponse updateTeam(UUID id, TeamRequest request, String email) {
        Team team = findTeam(id);
        team.setTeamName(request.getTeamName());
        if (request.getDescription() != null) team.setDescription(request.getDescription());
        return mapTeam(teamRepository.save(team));
    }
    
    public TeamResponse addMember(UUID teamId, UUID userId) {
        Team team = findTeam(teamId);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        team.getMembers().add(user);
        return mapTeam(teamRepository.save(team));
    }
    
    public TeamResponse removeMember(UUID teamId, UUID userId) {
        Team team = findTeam(teamId);
        team.getMembers().removeIf(m -> m.getId().equals(userId));
        return mapTeam(teamRepository.save(team));
    }
    
    public void deleteTeam(UUID id) {
        teamRepository.deleteById(id);
    }
    
    public List<TeamResponse> getAllTeams() {
        return teamRepository.findAll().stream().map(this::mapTeam).collect(Collectors.toList());
    }
    
    private Team findTeam(UUID id) {
        return teamRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
    }
    
    private TeamResponse mapTeam(Team team) {
        return TeamResponse.builder()
            .id(team.getId()).teamName(team.getTeamName())
            .description(team.getDescription())
            .createdBy(userService.mapUser(team.getCreatedBy()))
            .members(team.getMembers().stream().map(userService::mapUser).collect(Collectors.toList()))
            .projectCount(team.getProjects() != null ? team.getProjects().size() : 0)
            .createdAt(team.getCreatedAt()).build();
    }
}
