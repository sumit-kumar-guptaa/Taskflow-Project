package com.taskmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "teams")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String teamName;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private User createdBy;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "team_members",
        joinColumns = @JoinColumn(name = "team_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id"))
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private Set<User> members = new HashSet<>();

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private List<Project> projects = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;
}
