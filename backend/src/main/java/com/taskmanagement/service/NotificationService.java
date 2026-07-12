package com.taskmanagement.service;

import com.taskmanagement.dto.response.NotificationResponse;
import com.taskmanagement.entity.Notification;
import com.taskmanagement.entity.NotificationType;
import com.taskmanagement.entity.Task;
import com.taskmanagement.entity.User;
import com.taskmanagement.exception.BadRequestException;
import com.taskmanagement.exception.UnauthorizedException;
import com.taskmanagement.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;

    @Transactional
    public void notifyTaskAssigned(Task task, User actor, User recipient) {
        save(task, actor, recipient, NotificationType.TASK_ASSIGNED, buildAssignedMessage(task, actor));
    }

    @Transactional
    public void notifyTaskUpdated(Task task, User actor, User recipient) {
        save(task, actor, recipient, NotificationType.TASK_UPDATED, buildUpdatedMessage(task, actor));
    }

    public List<NotificationResponse> getUnread(String email, UserService userService) {
        User user = userService.findByEmail(email);
        return notificationRepository.findUnreadByRecipientId(user.getId()).stream()
            .map(this::mapNotification)
            .collect(Collectors.toList());
    }

    public List<NotificationResponse> getRecent(String email, UserService userService) {
        User user = userService.findByEmail(email);
        return notificationRepository.findRecentByRecipientId(user.getId()).stream()
            .map(this::mapNotification)
            .collect(Collectors.toList());
    }

    @Transactional
    public void markRead(UUID notificationId, String email, UserService userService) {
        User user = userService.findByEmail(email);
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new BadRequestException("Notification not found"));
        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new UnauthorizedException("Not allowed");
        }
        notification.setReadFlag(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllRead(String email, UserService userService) {
        User user = userService.findByEmail(email);
        notificationRepository.findUnreadByRecipientId(user.getId()).forEach(n -> n.setReadFlag(true));
    }

    private void save(Task task, User actor, User recipient, NotificationType type, String message) {
        Notification notification = Notification.builder()
            .task(task)
            .actor(actor)
            .recipient(recipient)
            .type(type)
            .message(message)
            .readFlag(false)
            .build();
        notificationRepository.save(notification);
    }

    private String buildAssignedMessage(Task task, User actor) {
        return actor.getName() + " assigned you to task \"" + task.getTitle() + "\"";
    }

    private String buildUpdatedMessage(Task task, User actor) {
        return actor.getName() + " updated task \"" + task.getTitle() + "\"";
    }

    public NotificationResponse mapNotification(Notification notification) {
        return NotificationResponse.builder()
            .id(notification.getId())
            .type(notification.getType())
            .message(notification.getMessage())
            .read(notification.isReadFlag())
            .taskId(notification.getTask() != null ? notification.getTask().getId() : null)
            .taskTitle(notification.getTask() != null ? notification.getTask().getTitle() : null)
            .actorId(notification.getActor() != null ? notification.getActor().getId() : null)
            .actorName(notification.getActor() != null ? notification.getActor().getName() : null)
            .createdAt(notification.getCreatedAt())
            .build();
    }
}
