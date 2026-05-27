# ⚡ TaskFlow — Smart Task & Team Management System

A production-grade, full-stack task management platform similar to Trello/Jira. Built with Spring Boot, React, and Supabase PostgreSQL.

![TaskFlow](https://img.shields.io/badge/version-1.0.0-blue) ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green) ![React](https://img.shields.io/badge/React-18-blue) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-teal)

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Recharts, React Router DOM |
| Backend | Java 17, Spring Boot 3.2, Spring Security, JWT |
| Database | Supabase PostgreSQL |
| Auth | JWT Bearer Token |
| Docs | Swagger/OpenAPI |
| Deploy | Docker, Nginx |

---

## ✨ Features

- 🔐 **JWT Authentication** — Register, Login, Role-based (Admin/Team Lead/Member)
- 📋 **Kanban Board** — Drag-and-drop task management
- 📊 **Analytics Dashboard** — Charts, progress tracking, team productivity
- 👥 **Team Management** — Create teams, invite members, assign roles
- 📁 **Project Management** — Full CRUD, color coding, deadlines, status tracking
- ✅ **Task Management** — Priority levels, status, assignees, due dates
- 💬 **Comments** — Thread discussions on tasks
- 📈 **Activity Logs** — Full audit trail for all task changes
- 🔍 **Search & Filter** — Search tasks across projects
- 🌙 **Dark Mode UI** — Beautiful dark-themed interface

---

## ⚙️ Quick Start

### 1. Clone & Setup

```bash
git clone https://github.com/your-org/taskflow.git
cd taskflow
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 2. Database Setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `docs/schema.sql`
3. Copy your connection string from **Project Settings → Database**

### 3. Run Backend

```bash
cd backend
# Set environment variables in .env or export them
export DB_URL="jdbc:postgresql://db.xxx.supabase.co:5432/postgres"
export DB_USERNAME="postgres"
export DB_PASSWORD="your-password"
export JWT_SECRET="your-256-bit-secret"

mvn spring-boot:run
# API runs at http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

### 4. Run Frontend

```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:3000
```

### 5. Docker (All-in-one)

```bash
# From project root
docker-compose -f docker/docker-compose.yml up --build
```

---

## 📡 API Reference

Base URL: `http://localhost:8080/api`

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, returns JWT |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Get current user |
| PUT | `/users/me` | Update profile |
| POST | `/users/me/avatar` | Upload avatar |
| PUT | `/users/me/password` | Change password |
| GET | `/users` | List all users |
| GET | `/users/search?q=` | Search users |

### Teams
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/teams` | Create team |
| GET | `/teams` | My teams |
| GET | `/teams/{id}` | Team detail |
| PUT | `/teams/{id}` | Update team |
| DELETE | `/teams/{id}` | Delete team |
| POST | `/teams/{id}/members/{userId}` | Add member |
| DELETE | `/teams/{id}/members/{userId}` | Remove member |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/projects` | Create project |
| GET | `/projects` | My projects |
| GET | `/projects/{id}` | Project detail |
| PUT | `/projects/{id}` | Update project |
| DELETE | `/projects/{id}` | Delete project |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/tasks` | Create task |
| GET | `/tasks/project/{id}` | Tasks by project |
| GET | `/tasks/my` | My assigned tasks |
| GET | `/tasks/{id}` | Task detail |
| PUT | `/tasks/{id}` | Update task |
| DELETE | `/tasks/{id}` | Delete task |
| GET | `/tasks/search?q=` | Search tasks |
| POST | `/tasks/{id}/comments` | Add comment |
| GET | `/tasks/{id}/comments` | Get comments |
| DELETE | `/tasks/comments/{id}` | Delete comment |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Full dashboard analytics |

---

## 📁 Project Structure

```
taskflow/
├── backend/
│   └── src/main/java/com/taskmanagement/
│       ├── controller/         # REST controllers
│       ├── service/            # Business logic
│       ├── repository/         # Data access (JPA)
│       ├── entity/             # JPA entities
│       ├── dto/request/        # Request DTOs
│       ├── dto/response/       # Response DTOs
│       ├── security/           # JWT + auth
│       ├── exception/          # Global exception handling
│       └── config/             # Security, Swagger config
├── frontend/
│   └── src/
│       ├── pages/              # Route pages
│       ├── components/         # Reusable components
│       │   └── layout/         # Sidebar, Topbar, AppLayout
│       ├── context/            # AuthContext
│       ├── services/           # Axios API service
│       └── routes/             # Protected routes
├── docs/
│   └── schema.sql              # Supabase DB schema
├── docker/
│   └── docker-compose.yml
└── .env.example
```

---

## 🔐 Roles & Permissions

| Feature | Admin | Team Lead | Member |
|---------|-------|-----------|--------|
| Create Teams | ✅ | ✅ | ❌ |
| Manage Members | ✅ | ✅ (own team) | ❌ |
| Create Projects | ✅ | ✅ | ❌ |
| Create/Edit Tasks | ✅ | ✅ | ✅ |
| Delete Projects | ✅ | ✅ (own) | ❌ |
| View Dashboard | ✅ | ✅ | ✅ |

---

## 🌐 Deployment

### Supabase (Database)
1. Create account at supabase.com
2. Create new project, note the connection string
3. Run `docs/schema.sql` in the SQL Editor

### Railway / Render (Backend)
```bash
# Set env vars in dashboard, then:
mvn clean package -DskipTests
# Deploy the generated .jar
```

### Vercel / Netlify (Frontend)
```bash
npm run build
# Deploy the dist/ folder
```

---

## 📝 Sample API Requests

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"secret123","role":"MEMBER"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"secret123"}'

# Create Task (with token)
curl -X POST http://localhost:8080/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Design homepage","priority":"HIGH","status":"TODO","projectId":"uuid-here"}'
```

---

## 📜 License

MIT © 2024 TaskFlow
