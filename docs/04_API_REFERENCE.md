# DevLearn — Complete REST API Reference

This document provides the complete API specification for the DevLearn backend server.

---

## 1. Global API Conventions

### Base URLs
* **Versioned (Recommended)**: `http://localhost:5000/api/v1`
* **Compatibility Route**: `http://localhost:5000/api`
* **Root Fallback**: `http://localhost:5000/`

### Standard Response Envelope
All API responses follow a uniform JSON structure:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "req_1234567890",
    "timestamp": "2026-08-31T12:00:00.000Z"
  }
}
```

### Standard Error Response Envelope
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid session duration",
    "details": [
      {
        "field": "durationMinutes",
        "message": "Duration must be greater than 0"
      }
    ]
  },
  "meta": {
    "requestId": "req_1234567890"
  }
}
```

### Authentication
* **Web Client**: Authenticates via signed, HTTP-only cookie (`devlearn_session`).
* **Mobile / Direct Clients**: Accepts session cookie or Bearer token header (`Authorization: Bearer <sessionToken>`).

---

## 2. Health & System Diagnostics

### Health Check Probe
`GET /health`
* **Access**: Public
* **Response `200 OK`**:
```json
{
  "status": "ok",
  "timestamp": "2026-08-31T12:00:00.000Z",
  "uptime": 86400,
  "environment": "development",
  "version": "0.1.0",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### Deep Diagnostics
`GET /api/v1/system/diagnostics`
* **Access**: Public / System Monitor
* **Response `200 OK`**:
```json
{
  "status": "healthy",
  "timestamp": "2026-08-31T12:00:00.000Z",
  "uptimeSeconds": 86400,
  "nodeVersion": "v20.18.0",
  "platform": "win32",
  "memoryUsage": {
    "heapUsedMB": 42.5,
    "heapTotalMB": 64.0,
    "rssMB": 105.2
  },
  "services": {
    "database": { "status": "connected", "latencyMs": 3.4 },
    "redis": { "status": "connected", "latencyMs": 1.2 }
  }
}
```

---

## 3. Authentication Module (`/auth`)

| Method | Path | Description | Access |
|---|---|---|---|
| `POST` | `/auth/register` | Create a new user account | Public |
| `POST` | `/auth/login` | Authenticate with email/password and set session cookie | Public |
| `POST` | `/auth/logout` | Terminate active session and clear cookie | Authenticated |
| `GET` | `/auth/me` | Retrieve current authenticated user and settings | Authenticated |
| `POST` | `/auth/verify-email` | Verify email with token | Public |
| `POST` | `/auth/forgot-password`| Request password reset email | Public |
| `POST` | `/auth/reset-password` | Set new password with reset token | Public |

#### Example: Register (`POST /auth/register`)
```json
// Request Body
{
  "email": "developer@example.com",
  "password": "SecurePassword123!",
  "name": "Jane Developer"
}

// Response 201 Created
{
  "success": true,
  "data": {
    "user": {
      "id": "u_987654321",
      "email": "developer@example.com",
      "name": "Jane Developer",
      "role": "USER",
      "status": "ACTIVE",
      "isEmailVerified": false,
      "createdAt": "2026-08-31T12:00:00.000Z"
    }
  }
}
```

---

## 4. Dynamic Subjects Module (`/subjects`)

| Method | Path | Description | Access |
|---|---|---|---|
| `GET` | `/subjects` | List all subjects created by the user | Authenticated |
| `POST` | `/subjects` | Create a new dynamic subject | Authenticated |
| `GET` | `/subjects/:id` | Get subject details with session counts | Authenticated |
| `PATCH` | `/subjects/:id` | Update subject name, description, or color | Authenticated |
| `DELETE` | `/subjects/:id` | Delete subject and cascade delete sessions | Authenticated |

#### Example: Create Subject (`POST /subjects`)
```json
// Request Body
{
  "name": "PostgreSQL Internals",
  "description": "B-Tree indexes, WAL, MVCC, and query planner",
  "colorToken": "level-3"
}
```

---

## 5. Learning Sessions Module (`/learning-sessions`)

| Method | Path | Description | Access |
|---|---|---|---|
| `GET` | `/learning-sessions` | List sessions (supports `?subjectId=...&limit=20&page=1`) | Authenticated |
| `POST` | `/learning-sessions` | Record a completed focus session | Authenticated |
| `GET` | `/learning-sessions/:id` | Retrieve single session details | Authenticated |
| `PATCH` | `/learning-sessions/:id` | Update session duration, notes, or topic | Authenticated |
| `DELETE` | `/learning-sessions/:id` | Remove session and recalculate daily heatmap | Authenticated |

#### Example: Log Session (`POST /learning-sessions`)
```json
// Request Body
{
  "subjectId": "sub_12345",
  "durationMinutes": 90,
  "date": "2026-08-31T12:00:00.000Z",
  "topic": "WAL and Checkpoint Tuning",
  "learnedNotes": "Learned how max_wal_size triggers background checkpoints",
  "generalNotes": "Check postgres docs chapter 30 for tuning parameters",
  "taskId": "task_abc",
  "courseId": "course_xyz",
  "resourceId": "res_123"
}
```

---

## 6. Tasks Module (`/tasks`)

| Method | Path | Description | Access |
|---|---|---|---|
| `GET` | `/tasks` | List all planned tasks | Authenticated |
| `POST` | `/tasks` | Create a new task | Authenticated |
| `PATCH` | `/tasks/:id` | Update task title, description, or toggle `isCompleted` | Authenticated |
| `DELETE` | `/tasks/:id` | Delete a task | Authenticated |

---

## 7. Courses Module (`/courses`)

| Method | Path | Description | Access |
|---|---|---|---|
| `GET` | `/courses` | List all tracked courses with progress % | Authenticated |
| `POST` | `/courses` | Create a course track | Authenticated |
| `GET` | `/courses/:id` | Get course details and associated sessions | Authenticated |
| `PATCH` | `/courses/:id` | Update course total duration or metadata | Authenticated |
| `DELETE` | `/courses/:id` | Delete course track | Authenticated |

---

## 8. Goals Module (`/goals`)

| Method | Path | Description | Access |
|---|---|---|---|
| `GET` | `/goals` | List all hourly goals and progress | Authenticated |
| `POST` | `/goals` | Create a new hourly focus target | Authenticated |
| `PATCH` | `/goals/:id` | Update target hours or status | Authenticated |
| `DELETE` | `/goals/:id` | Delete goal | Authenticated |

---

## 9. Resources Module (`/resources`)

| Method | Path | Description | Access |
|---|---|---|---|
| `GET` | `/resources` | List bookmarked documentation, repos & URLs | Authenticated |
| `POST` | `/resources` | Create a new resource bookmark | Authenticated |
| `PATCH` | `/resources/:id` | Update resource title or URL | Authenticated |
| `DELETE` | `/resources/:id` | Delete resource bookmark | Authenticated |

---

## 10. Contributions & Analytics Modules

### Contributions Calendar
`GET /contributions/calendar`
* **Access**: Authenticated
* **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "days": [
      {
        "date": "2026-08-31",
        "minutes": 120,
        "level": 4,
        "sessionCount": 2
      }
    ],
    "totalActiveDays": 45,
    "totalMinutesYear": 5400
  }
}
```

### Analytics Summary
`GET /analytics/summary`
* **Access**: Authenticated
* **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "totalMinutes": 3600,
    "totalHours": 60.0,
    "totalSessions": 40,
    "currentStreak": 7,
    "longestStreak": 14,
    "averageSessionMinutes": 90,
    "subjectDistribution": [
      {
        "subjectId": "sub_123",
        "subjectName": "PostgreSQL Internals",
        "totalMinutes": 2400,
        "percentage": 66.7
      }
    ],
    "dailyActivityTrend": [
      { "date": "2026-08-30", "minutes": 90, "sessionCount": 1 },
      { "date": "2026-08-31", "minutes": 120, "sessionCount": 2 }
    ]
  }
}
```

---

## 11. Achievements Module (`/achievements`)

`GET /achievements`
* **Access**: Authenticated
* **Response `200 OK`**: Returns array of all 7 milestone badges with live `isUnlocked`, `progressPercentage`, and `unlockedAt` timestamps.

---

## 12. Data Export Module (`/export`)

| Method | Path | Description | Access |
|---|---|---|---|
| `GET` | `/export/json` | Download full user data bundle in JSON format | Authenticated |
| `GET` | `/export/csv` | Download complete study sessions in CSV format | Authenticated |

---

## 13. System Administration Module (`/admin`)

*All admin endpoints require `ADMIN` or `SUPERADMIN` roles.*

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/overview` | Platform KPI metrics, growth graphs, popular subjects |
| `GET` | `/admin/users` | Paginated user directory with role/status filters |
| `PATCH` | `/admin/users/:id` | Update user role or account status (`SUSPENDED`/`BANNED`) |
| `POST` | `/admin/users/:id/revoke-sessions` | Invalidate all active sessions for target user |
| `GET` | `/admin/telemetry` | Live DB latency, Redis memory, and Node.js process stats |
| `GET` | `/admin/audit-logs` | Query security and administration audit log entries |
| `GET` | `/admin/settings` | Retrieve platform-wide operational settings |
| `PATCH` | `/admin/settings` | Toggle maintenance mode or registration allowances |
