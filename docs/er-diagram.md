# TaskFlow — ER Diagram (Text Format)

```
┌────────────────────┐         ┌────────────────────┐
│       users        │         │       teams        │
├────────────────────┤         ├────────────────────┤
│ id (PK, UUID)      │◄──────┐ │ id (PK, UUID)      │
│ name               │       │ │ team_name          │
│ email (unique)     │       └─┤ created_by_id (FK) │
│ password           │         │ description        │
│ role               │         │ created_at         │
│ profile_image      │         └────────┬───────────┘
│ bio                │                  │ 1
│ job_title          │                  │
│ enabled            │                  │ M (team_members)
│ created_at         │◄─────────────────┤
│ updated_at         │                  │
└────────┬───────────┘         ┌────────▼───────────┐
         │ 1                   │   team_members     │
         │                     ├────────────────────┤
         │ M                   │ team_id (FK, PK)   │
         │                     │ user_id (FK, PK)   │
┌────────▼───────────┐         └────────────────────┘
│      projects      │
├────────────────────┤         ┌────────────────────┐
│ id (PK, UUID)      │         │       teams        │
│ title              │◄────────┤ team_id (FK)       │
│ description        │         └────────────────────┘
│ deadline           │
│ status             │         ┌────────────────────┐
│ color              │         │       users        │
│ created_by_id (FK) │◄────────┤ created_by_id (FK) │
│ team_id (FK)       │         └────────────────────┘
│ created_at         │
│ updated_at         │
└────────┬───────────┘
         │ 1
         │
         │ M
┌────────▼───────────┐
│       tasks        │
├────────────────────┤
│ id (PK, UUID)      │
│ title              │
│ description        │
│ priority           │◄─── ENUM: LOW | MEDIUM | HIGH
│ status             │◄─── ENUM: TODO | IN_PROGRESS | COMPLETED
│ due_date           │
│ estimated_hours    │
│ position           │
│ assigned_to_id(FK) │──────────────► users
│ created_by_id (FK) │──────────────► users
│ project_id (FK)    │──────────────► projects
│ created_at         │
│ updated_at         │
└────────┬───────────┘
         │ 1
    ┌────┴────┐
    │ 1       │ 1
    ▼ M       ▼ M
┌──────────┐  ┌───────────────────┐
│ comments │  │  activity_logs    │
├──────────┤  ├───────────────────┤
│ id (PK)  │  │ id (PK)           │
│ content  │  │ action            │
│ task_id  │  │ details           │
│ user_id  │  │ task_id (FK)      │
│ created  │  │ user_id (FK)      │
│ updated  │  │ timestamp         │
└──────────┘  └───────────────────┘
```

## Relationships Summary

| Table | Relationship | Table |
|-------|-------------|-------|
| users | 1:M (creates) | teams |
| users ↔ teams | M:M (via team_members) | |
| teams | 1:M | projects |
| users | 1:M (creates) | projects |
| projects | 1:M | tasks |
| users | 1:M (assigned) | tasks |
| tasks | 1:M | comments |
| tasks | 1:M | activity_logs |
| users | 1:M | comments |
| users | 1:M | activity_logs |
