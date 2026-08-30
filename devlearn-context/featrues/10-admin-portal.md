# DevLearn — 10 Admin Portal & System Administration Specification

## Context Files Read Before This Specification

This implementation unit was prepared in accordance with the DevLearn context set:
- [project-overview.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/project-overview.md) — product scope, core loop, SaaS evolution.
- [architecture.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/architecture.md) — system architecture, modular boundaries, security invariants.
- [code-standards.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/code-standards.md) — coding standards, error handling, strict typing, telemetry logging.
- [01-design-system.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/featrues/01-design-system.md) — dark monochrome UI tokens, typography, component standards.
- [02-data-model-and-auth.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/featrues/02-data-model-and-auth.md) — authentication architecture and session management.
- [09-production-deployment-and-diagnostics.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/featrues/09-production-deployment-and-diagnostics.md) — health checks, diagnostics telemetry, and containerization.

---

## Responsibility Boundary

| Information | Source of Truth |
|---|---|
| Product purpose, core loop, and scope | `project-overview.md` |
| System architecture, boundaries, storage, auth invariants | `architecture.md` |
| Coding rules and conventions | `code-standards.md` |
| Design tokens, layout grids, components | `01-design-system.md` |
| Administration, RBAC, Platform Metrics, User Management & Audit Logging | `10-admin-portal.md` |

---

## 1. Feature Overview & Architecture Scope

The **Admin Portal** (`/admin`) provides system administrators, operations teams, and platform moderators with centralized oversight, system telemetry, content moderation, security auditing, and account administration capabilities for DevLearn.

### Core Objectives:
1. **Platform Analytics & Growth Telemetry**: Real-time aggregation of total registered users, active sessions, platform-wide study hours, daily active learners, and learning streak distributions.
2. **User Management & Moderation**: Administrative directory of all registered accounts with full search, filtering, role assignment (`USER`, `ADMIN`, `SUPERADMIN`), status toggles (`ACTIVE`, `SUSPENDED`, `BANNED`), session revocation, and account deletion.
3. **Live Infrastructure Diagnostics**: Real-time dashboard displaying PostgreSQL connection pool status, Redis latency and memory cache utilization, Node.js process metrics, event loop lag, and system health telemetry.
4. **Security Audit Log**: Immutable record of administrative operations, role promotions, account status changes, suspicious login attempts, and bulk exports.
5. **System Operations**: Cache purging, broadcast maintenance messages, and database vacuum telemetry.

---

## 2. Role-Based Access Control (RBAC) & Security Invariants

### A. Role Hierarchy
```text
┌───────────────────────────────────────────────┐
│                 SUPERADMIN                    │  <- Full system access, role promotion, DB operations
└───────────────────────┬───────────────────────┘
                        │
┌───────────────────────▼───────────────────────┐
│                   ADMIN                       │  <- User moderation, telemetry, analytics, audit logs
└───────────────────────┬───────────────────────┘
                        │
┌───────────────────────▼───────────────────────┐
│                   USER                        │  <- Standard learner portal access (/dashboard, /learning)
└───────────────────────────────────────────────┘
```

### B. Security Invariants
1. **Server-Side Guard**: All `/api/v1/admin/*` endpoints must strictly pass through `requireAuth` followed by `requireRole(['ADMIN', 'SUPERADMIN'])`.
2. **Non-Elevated Session Rejection**: Requests from users without administrative privileges return HTTP `403 Forbidden` (`INSUFFICIENT_PERMISSIONS`) without disclosing endpoint internals.
3. **Self-Demotion & Self-Deletion Protection**: Administrators cannot delete their own account or remove their own administrative privileges via the admin portal.
4. **Audit Logging**: Any administrative mutation (`PATCH /api/v1/admin/*`, `DELETE /api/v1/admin/*`, `POST /api/v1/admin/*`) creates an immutable `AuditLog` entry with actor ID, target ID, IP address, user agent, action name, and JSON metadata.
5. **Session Revocation on Suspension/Ban**: When a user's status is changed to `SUSPENDED` or `BANNED`, all active sessions in `user_sessions` for that user are immediately invalidated and purged.

---

## 3. Data Model Extensions (Prisma Schema)

```prisma
enum UserRole {
  USER
  ADMIN
  SUPERADMIN
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  BANNED
}

model User {
  id              String      @id @default(uuid())
  email           String      @unique
  passwordHash    String
  name            String?
  avatarUrl       String?
  role            UserRole    @default(USER)
  status          UserStatus  @default(ACTIVE)
  isEmailVerified Boolean     @default(false)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Audit relations
  performedAuditLogs AuditLog[] @relation("ActorAuditLogs")
  targetAuditLogs    AuditLog[] @relation("TargetAuditLogs")

  // Existing Relations
  sessions            UserSession[]
  verificationTokens  VerificationToken[]
  passwordResetTokens PasswordResetToken[]
  settings            UserSettings?
  subjects            Subject[]
  tasks               Task[]
  goals               Goal[]
  resources           Resource[]
  courses             Course[]
  learningSessions    LearningSession[]
  contributionDays    ContributionDay[]

  @@map("users")
}

model AuditLog {
  id        String   @id @default(uuid())
  actorId   String
  targetId  String?
  action    String   // e.g. "USER_ROLE_UPDATED", "USER_SUSPENDED", "USER_DELETED", "SESSIONS_REVOKED"
  ipAddress String?
  userAgent String?
  metadata  Json?
  createdAt DateTime @default(now())

  actor  User  @relation("ActorAuditLogs", fields: [actorId], references: [id], onDelete: Cascade)
  target User? @relation("TargetAuditLogs", fields: [targetId], references: [id], onDelete: SetNull)

  @@index([actorId])
  @@index([targetId])
  @@index([action])
  @@index([createdAt])
  @@map("audit_logs")
}
```

---

## 4. Audit Action Dictionary

| Action | Trigger | Actor |
|---|---|---|
| `USER_ROLE_UPDATED` | Role changed between `USER`, `ADMIN`, `SUPERADMIN` | `SUPERADMIN` |
| `USER_STATUS_UPDATED` | Status changed (`ACTIVE`, `SUSPENDED`, `BANNED`) | `ADMIN`, `SUPERADMIN` |
| `USER_SESSIONS_REVOKED` | Force sign-out of all user devices | `ADMIN`, `SUPERADMIN` |
| `USER_DELETED` | Administrative purge of a user account | `ADMIN`, `SUPERADMIN` |
| `CACHE_PURGED` | Manual Redis cache eviction for analytics or user | `ADMIN`, `SUPERADMIN` |
| `VERIFICATION_OVERRIDDEN` | Manually mark user email as verified | `ADMIN`, `SUPERADMIN` |

---

## 5. API Endpoints & Contract Specifications

All routes are mounted under `/api/v1/admin` and protected by `requireAuth` + `requireRole(['ADMIN', 'SUPERADMIN'])`.

### A. Platform Overview & Metrics
* **Endpoint**: `GET /api/v1/admin/overview`
* **Response**:
```json
{
  "success": true,
  "data": {
    "metrics": {
      "totalUsers": 1284,
      "activeUsersLast30Days": 842,
      "totalLearningHours": 14250.5,
      "totalSessionsLogged": 28940,
      "activeStreaksCount": 612,
      "totalTasksCompleted": 18450
    },
    "growth": {
      "userSignupsPast30Days": [
        { "date": "2026-08-01", "count": 14 },
        { "date": "2026-08-02", "count": 22 }
      ],
      "studyMinutesPast30Days": [
        { "date": "2026-08-01", "totalMinutes": 1840 },
        { "date": "2026-08-02", "totalMinutes": 2450 }
      ]
    },
    "popularSubjects": [
      { "name": "Distributed Systems", "totalMinutes": 48200, "userCount": 310 },
      { "name": "TypeScript & React", "totalMinutes": 39500, "userCount": 285 }
    ]
  }
}
```

### B. User Directory & Search
* **Endpoint**: `GET /api/v1/admin/users?page=1&limit=20&search=john&role=USER&status=ACTIVE`
* **Response**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid-123",
        "email": "john@example.com",
        "name": "John Doe",
        "avatarUrl": null,
        "role": "USER",
        "status": "ACTIVE",
        "isEmailVerified": true,
        "createdAt": "2026-08-01T12:00:00.000Z",
        "_count": {
          "learningSessions": 45,
          "subjects": 6,
          "tasks": 28
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalCount": 1284,
      "totalPages": 65
    }
  }
}
```

### C. Update User Role or Status
* **Endpoint**: `PATCH /api/v1/admin/users/:id`
* **Body**:
```json
{
  "role": "ADMIN",
  "status": "SUSPENDED"
}
```
* **Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-123",
      "email": "john@example.com",
      "role": "ADMIN",
      "status": "SUSPENDED"
    }
  }
}
```

### D. Force Revoke User Sessions
* **Endpoint**: `POST /api/v1/admin/users/:id/revoke-sessions`
* **Response**:
```json
{
  "success": true,
  "data": {
    "message": "All active sessions for this user have been terminated."
  }
}
```

### E. System Telemetry & Live Diagnostics
* **Endpoint**: `GET /api/v1/admin/telemetry`
* **Response**:
```json
{
  "success": true,
  "data": {
    "status": "HEALTHY",
    "timestamp": "2026-08-30T04:00:00.000Z",
    "uptimeSeconds": 86400,
    "system": {
      "nodeVersion": "v20.18.0",
      "platform": "linux",
      "memoryUsageMb": {
        "rss": 112.4,
        "heapTotal": 64.2,
        "heapUsed": 48.8
      }
    },
    "database": {
      "status": "CONNECTED",
      "latencyMs": 4.2,
      "openConnections": 8
    },
    "redis": {
      "status": "CONNECTED",
      "latencyMs": 1.1,
      "usedMemoryKb": 1024
    }
  }
}
```

### F. Security Audit Logs
* **Endpoint**: `GET /api/v1/admin/audit-logs?page=1&limit=50&action=USER_ROLE_UPDATED`
* **Response**:
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log-1",
        "action": "USER_ROLE_UPDATED",
        "actor": { "id": "admin-1", "name": "Admin User", "email": "admin@devlearn.io" },
        "target": { "id": "user-2", "name": "Jane Developer", "email": "jane@example.com" },
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0 ...",
        "metadata": { "previousRole": "USER", "newRole": "ADMIN" },
        "createdAt": "2026-08-30T03:45:00.000Z"
      }
    ],
    "pagination": { "page": 1, "limit": 50, "totalCount": 312, "totalPages": 7 }
  }
}
```

---

## 6. Frontend Admin Portal Screen Architecture (`apps/web`)

The Admin Portal lives under a dedicated route group `apps/web/app/(admin)/admin/` with its own isolated layout and role guard:

```text
apps/web/app/(admin)/
├── layout.tsx                     # Admin layout (top navigation, sub-navigation, role guard)
└── admin/
    ├── page.tsx                   # Redirects to /admin/overview
    ├── overview/page.tsx          # System KPIs, user growth charts, study volume metrics
    ├── users/
    │   ├── page.tsx               # Paginated user table, search, role & status moderation
    │   └── [id]/page.tsx          # Detailed user inspection (learning history, sessions, tasks)
    ├── telemetry/page.tsx         # Live system telemetry, DB latency, Redis stats, memory charts
    └── audit-logs/page.tsx        # Security & administration audit trail with search & filters
```

### UI & Styling Guidelines:
- **Design Tokens**: Dark monochrome aesthetic (`bg-base`, `bg-surface`, `bg-surface-elevated`, `border-border`).
- **Data Tables**: High-density, monospace metadata tables with status badges, sortable columns, and paginated footers.
- **Charts**: Recharts telemetry line charts and bar charts rendered in grayscale / white tones.
- **Notifications**: Integrated `react-toastify` for administrative mutation confirmations and error alerts.

---

## 7. Implementation Checklist & Verification

- [ ] Add `UserRole` and `UserStatus` enums to `prisma/schema.prisma`.
- [ ] Add `AuditLog` model to `prisma/schema.prisma` and execute `prisma db push`.
- [ ] Implement `apps/api/src/middleware/role.middleware.ts` (`requireRole(['ADMIN', 'SUPERADMIN'])`).
- [ ] Implement `apps/api/src/modules/admin/` domain module (service, controller, routes, types).
- [ ] Mount admin routes at `/api/v1/admin` in `apps/api/src/app.ts`.
- [ ] Create `@devlearn/types` admin DTOs (`AdminOverviewDto`, `AdminUserDto`, `AuditLogDto`, `TelemetryDto`).
- [ ] Create `apps/web/app/(admin)/admin/` pages and components with role verification guard.
- [ ] Verify test suite with `npm test --workspace=@devlearn/api`.
- [ ] Verify full monorepo build with `npm run build`.
