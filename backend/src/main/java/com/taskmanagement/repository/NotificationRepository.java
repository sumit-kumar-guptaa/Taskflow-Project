package com.taskmanagement.repository;

import com.taskmanagement.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    @Query("SELECT n FROM Notification n " +
        "JOIN FETCH n.recipient r " +
        "JOIN FETCH n.actor a " +
        "JOIN FETCH n.task t " +
        "WHERE r.id = :userId AND n.readFlag = false " +
        "ORDER BY n.createdAt DESC")
    List<Notification> findUnreadByRecipientId(UUID userId);

    @Query("SELECT n FROM Notification n " +
        "JOIN FETCH n.recipient r " +
        "JOIN FETCH n.actor a " +
        "JOIN FETCH n.task t " +
        "WHERE r.id = :userId " +
        "ORDER BY n.createdAt DESC")
    List<Notification> findRecentByRecipientId(UUID userId);
}
