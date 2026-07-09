package com.taskmanagement.service;

import com.taskmanagement.dto.request.*;
import com.taskmanagement.dto.response.*;
import com.taskmanagement.entity.User;
import com.taskmanagement.exception.*;
import com.taskmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Value("${file.upload-dir}")
    private String uploadDir;
    
    public UserResponse getCurrentUser(String email) {
        return mapUser(findByEmail(email));
    }
    
    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = findByEmail(email);
        if (request.getName() != null) user.setName(request.getName());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getJobTitle() != null) user.setJobTitle(request.getJobTitle());
        return mapUser(userRepository.save(user));
    }
    
    @Transactional
    public UserResponse uploadProfileImage(String email, MultipartFile file) throws IOException {
        User user = findByEmail(email);
        Path uploadPath = Paths.get(uploadDir, "profiles");
        Files.createDirectories(uploadPath);
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Files.copy(file.getInputStream(), uploadPath.resolve(filename));
        user.setProfileImage("/uploads/profiles/" + filename);
        return mapUser(userRepository.save(user));
    }
    
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = findByEmail(email);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword()))
            throw new BadRequestException("Current password is incorrect");
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
    
    public List<UserResponse> searchUsers(String query) {
        return userRepository.searchUsers(query).stream().map(this::mapUser).collect(Collectors.toList());
    }
    
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::mapUser).collect(Collectors.toList());
    }
    
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
    
    public UserResponse mapUser(User user) {
        return UserResponse.builder()
            .id(user.getId()).name(user.getName()).email(user.getEmail())
            .role(user.getRole()).profileImage(user.getProfileImage())
            .bio(user.getBio()).jobTitle(user.getJobTitle())
            .createdAt(user.getCreatedAt()).build();
    }
}
