package com.taskmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class GolkiIoApplication {
    public static void main(String[] args) {
        SpringApplication.run(GolkiIoApplication.class, args);
    }
}
