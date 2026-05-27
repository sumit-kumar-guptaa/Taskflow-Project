package com.taskmanagement.config;

import com.taskmanagement.entity.Role;
import com.taskmanagement.entity.User;
import com.taskmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@taskflow.io")) {
            User admin = User.builder()
                    .name("Admin User")
                    .email("admin@taskflow.io")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .jobTitle("System Administrator")
                    .bio("TaskFlow system administrator")
                    .build();
            userRepository.save(admin);
            log.info("✅ Default admin created: admin@taskflow.io / admin123");
        }
    }
}
