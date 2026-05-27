# TaskFlow API — Sample Requests

All requests (except auth) require: `Authorization: Bearer <token>`

---

## 🔐 Authentication

### Register
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "secret123",
    "role": "TEAM_LEAD",
    "jobTitle": "Engineering Lead"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "jane@example.com", "password": "secret123"}'
```
**Response:** `{ "data": { "token": "eyJ...", "user": {...} } }`

---

## 👥 Teams

### Create Team
```bash
curl -X POST http://localhost:8080/api/teams \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"teamName": "Frontend Squad", "description": "Handles all UI development"}'
```

### Add Member to Team
```bash
curl -X POST http://localhost:8080/api/teams/{teamId}/members/{userId} \
  -H "Authorization: Bearer TOKEN"
```

---

## 📁 Projects

### Create Project
```bash
curl -X POST http://localhost:8080/api/projects \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mobile App Redesign",
    "description": "Complete overhaul of mobile experience",
    "teamId": "uuid-here",
    "deadline": "2024-12-31",
    "status": "ACTIVE",
    "color": "#6550f7"
  }'
```

### Update Project Status
```bash
curl -X PUT http://localhost:8080/api/projects/{id} \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mobile App Redesign",
    "teamId": "uuid-here",
    "status": "COMPLETED"
  }'
```

---

## ✅ Tasks

### Create Task
```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement login screen",
    "description": "Build JWT-based login with form validation",
    "priority": "HIGH",
    "status": "TODO",
    "projectId": "uuid-here",
    "assignedToId": "user-uuid",
    "dueDate": "2024-11-15",
    "estimatedHours": 8
  }'
```

### Move Task to In Progress
```bash
curl -X PUT http://localhost:8080/api/tasks/{id} \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement login screen",
    "priority": "HIGH",
    "status": "IN_PROGRESS",
    "projectId": "uuid-here"
  }'
```

### Search Tasks
```bash
curl "http://localhost:8080/api/tasks/search?q=login" \
  -H "Authorization: Bearer TOKEN"
```

---

## 💬 Comments

### Add Comment to Task
```bash
curl -X POST http://localhost:8080/api/tasks/{taskId}/comments \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "PR is ready for review — see branch feature/login-screen"}'
```

### Get Task Comments
```bash
curl http://localhost:8080/api/tasks/{taskId}/comments \
  -H "Authorization: Bearer TOKEN"
```

---

## 📊 Dashboard

```bash
curl http://localhost:8080/api/dashboard \
  -H "Authorization: Bearer TOKEN"
```

**Response includes:**
- Total/active projects
- Task counts by status
- Overdue tasks
- Recent activity feed
- My assigned tasks
- Priority breakdown

---

## 👤 Profile

### Update Profile
```bash
curl -X PUT http://localhost:8080/api/users/me \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe", "jobTitle": "Staff Engineer", "bio": "Loves clean code"}'
```

### Change Password
```bash
curl -X PUT http://localhost:8080/api/users/me/password \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword": "secret123", "newPassword": "newsecret456"}'
```

### Upload Avatar
```bash
curl -X POST http://localhost:8080/api/users/me/avatar \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@/path/to/avatar.jpg"
```

---

## 🌐 Swagger UI
Visit: `http://localhost:8080/swagger-ui.html`
