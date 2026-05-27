package com.taskmanagement.service;

import com.taskmanagement.dto.request.*;
import com.taskmanagement.dto.response.*;
import com.taskmanagement.entity.*;
import com.taskmanagement.exception.*;
import com.taskmanagement.repository.UserRepository;
import com.taskmanagement.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final com.taskmanagement.security.CustomUserDetailsService userDetailsService;
    
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail()))
            throw new BadRequestException("Email already registered");
        
        User user = User.builder()
            .name(request.getName())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .role(request.getRole() != null ? request.getRole() : Role.MEMBER)
            .bio(request.getBio())
            .jobTitle(request.getJobTitle())
            .build();
        
        userRepository.save(user);
        
        UserDetails ud = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(ud);
        return AuthResponse.builder().token(token).user(mapUser(user)).build();
    }
    
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        UserDetails ud = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(ud);
        return AuthResponse.builder().token(token).user(mapUser(user)).build();
    }
    
    private UserResponse mapUser(User user) {
        return UserResponse.builder()
            .id(user.getId()).name(user.getName()).email(user.getEmail())
            .role(user.getRole()).profileImage(user.getProfileImage())
            .bio(user.getBio()).jobTitle(user.getJobTitle())
            .createdAt(user.getCreatedAt()).build();
    }
}
