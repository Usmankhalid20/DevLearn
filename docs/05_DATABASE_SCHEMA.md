# DevLearn — Database Schema & Data Models

This document details the relational database architecture, entity-relationship models, indexing strategies, and Prisma ORM schemas utilized by the DevLearn platform.

---

## 1. Relational Entity Overview

DevLearn utilizes **PostgreSQL 16** managed through **Prisma ORM**. All user learning data is strictly partitioned by `userId`.

```text
               ┌────────────────────────┐
               │          User          │
               └──┬───┬───┬───┬───┬───┬─┘
                  │   │   │   │   │   │
        ┌─────────┘   │   │   │   │   └──────────┐
        ▼             ▼   │   │   ▼              ▼
  ┌───────────┐ ┌─────────┤   │ ┌───────────┐  ┌─────────────┐
  │  Subject  │ │  Task   │   │ │  Course   │  │  Resource   │
  └─────┬─────┘ └────┬────┘   │ └─────┬─────┘  └──────┬──────┘
        │            │        │       │               │
        │            │        ▼       │               │
        │            │  ┌───────────┐ │               │
        │            │  │   Goal    │ │               │
        │            │  └───────────┘ │               │
        │            │                │               │
        ▼            ▼                ▼               ▼
     ┌──────────────────────────────────────────────────┐
     │                 LearningSession                  │
     └────────────────────────┬─────────────────────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │   ContributionDay   │
                   └─────────────────────┘
```

---

## 2. Enums

### `UserRole`
Defines access privileges across the user portal and administrative subsystems:
* `USER`: Standard developer/student learner.
* `ADMIN`: Platform moderator and operations administrator.
* `SUPERADMIN` / `SUPER_ADMIN`: Full system owner with role promotion and maintenance capabilities.

### `UserStatus`
Account lifecycle state:
* `ACTIVE`: Normal operating account.
* `DISABLED`: Inactive or deactivated account.
* `SUSPENDED`: Temporarily restricted account (active sessions invalidated).
* `BANNED`: Permanently blocked account.

---

## 3. Core Models & Table Definitions

### `User` (`users`)
Core identity record.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Unique user identifier |
| `email` | `String` | `@unique` | Verified user email address |
| `passwordHash` | `String` | | Argon2id cryptographic hash |
| `name` | `String?` | | Display name |
| `avatarUrl` | `String?` | | Optional profile picture URL |
| `role` | `UserRole` | `@default(USER)` | Role-based authorization tier |
| `status` | `UserStatus`| `@default(ACTIVE)` | Account operational status |
| `permissions` | `String[]` | `@default([])` | Granular administrator permissions |
| `isEmailVerified`| `Boolean` | `@default(false)` | Email verification flag |
| `createdAt` | `DateTime` | `@default(now())` | Account creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last modification timestamp |
| `lastLoginAt` | `DateTime?`| | Last session creation timestamp |

---

### `Subject` (`subjects`)
Dynamic, user-defined learning topics.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Subject ID |
| `userId` | `String` | `@relation(User)` | Owner foreign key (`onDelete: Cascade`) |
| `name` | `String` | | Name of subject (e.g., "PostgreSQL") |
| `description` | `String?` | | Optional details |
| `colorToken` | `String?` | | Custom monochrome visual token |

* **Unique Constraint**: `@@unique([userId, name])` — Prevents duplicate subject names per user.

---

### `LearningSession` (`learning_sessions`)
The foundational record of actual focus time.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Session ID |
| `userId` | `String` | `@relation(User)` | Owner foreign key (`onDelete: Cascade`) |
| `subjectId` | `String` | `@relation(Subject)` | Associated subject (`onDelete: Cascade`) |
| `taskId` | `String?` | `@relation(Task)` | Optional linked task (`onDelete: SetNull`) |
| `courseId` | `String?` | `@relation(Course)` | Optional linked course (`onDelete: SetNull`) |
| `resourceId` | `String?` | `@relation(Resource)` | Optional linked resource (`onDelete: SetNull`) |
| `durationMinutes`| `Int` | | Actual focus minutes recorded |
| `date` | `DateTime` | | Timestamp of learning activity |
| `topic` | `String?` | | Specific topic studied |
| `learnedNotes`| `String?` | | Key takeaways |
| `generalNotes`| `String?` | | Extended study notes |

* **Indices**:
  * `@@index([userId, date])` — Optimized for calendar queries and streak calculations.
  * `@@index([subjectId])` — Optimized for subject distribution analytics.

---

### `ContributionDay` (`contribution_days`)
Aggregated daily activity cache table powering the 52-week monochrome heatmap.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Record ID |
| `userId` | `String` | `@relation(User)` | Owner foreign key (`onDelete: Cascade`) |
| `date` | `String` | | ISO Date string (`YYYY-MM-DD`) |
| `totalMinutes`| `Int` | `@default(0)` | Sum of study minutes for this day |
| `sessionCount`| `Int` | `@default(0)` | Total number of sessions completed |
| `level` | `Int` | `@default(0)` | Grayscale intensity level (`0` to `4`) |

* **Unique Constraint**: `@@unique([userId, date])` — Guarantees one summary record per user per calendar day.

---

### `Task` (`tasks`)
Planned study goals and actionable items.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Task ID |
| `userId` | `String` | `@relation(User)` | Owner foreign key (`onDelete: Cascade`) |
| `subjectId` | `String?` | `@relation(Subject)` | Optional subject link (`onDelete: SetNull`) |
| `title` | `String` | | Task title |
| `description` | `String?` | | Optional notes |
| `isCompleted` | `Boolean` | `@default(false)` | Completion toggle |
| `completedAt` | `DateTime?`| | Timestamp when completed |
| `dueDate` | `DateTime?`| | Optional due date |

---

### `Course` (`courses`)
Structured learning curriculums and tracks.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Course ID |
| `userId` | `String` | `@relation(User)` | Owner foreign key (`onDelete: Cascade`) |
| `subjectId` | `String?` | `@relation(Subject)` | Optional subject link (`onDelete: SetNull`) |
| `title` | `String` | | Course name |
| `platform` | `String` | `@default("Custom")` | Course provider (Coursera, Udemy, YouTube) |
| `totalDurationMinutes`| `Int`| `@default(0)` | Estimated total curriculum length |
| `completedDurationMinutes`| `Int`| `@default(0)` | Accumulated study duration |
| `isCompleted`| `Boolean` | `@default(false)` | Course completion flag |

---

### `Goal` (`goals`)
Target study hours and deadline tracking.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Goal ID |
| `userId` | `String` | `@relation(User)` | Owner foreign key (`onDelete: Cascade`) |
| `subjectId` | `String?` | `@relation(Subject)` | Optional subject link (`onDelete: SetNull`) |
| `title` | `String` | | Goal title |
| `targetMinutes`| `Int` | | Target focus minutes |
| `currentMinutes`| `Int` | `@default(0)` | Accumulated focus minutes |
| `status` | `String` | `@default("IN_PROGRESS")` | Goal status |
| `isAchieved` | `Boolean` | `@default(false)` | Achievement toggle |

---

### `Resource` (`resources`)
Documentation and link bookmark library.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Resource ID |
| `userId` | `String` | `@relation(User)` | Owner foreign key (`onDelete: Cascade`) |
| `title` | `String` | | Bookmark title |
| `url` | `String` | | Target URL |
| `type` | `String` | `@default("url")` | Resource category (doc, repo, video) |

---

### `AuditLog` (`audit_logs`)
Immutable administrative security audit trail.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Unique log entry ID |
| `actorId` | `String` | `@relation(User)` | Admin user who triggered the action |
| `targetId` | `String?` | `@relation(User)` | Target user modified by the action |
| `action` | `String` | | Standard audit key |
| `ipAddress` | `String?` | | Client IP address |
| `userAgent` | `String?` | | Client user agent string |
| `metadata` | `Json?` | | JSON payload containing attribute changes |
| `createdAt` | `DateTime` | `@default(now())` | Log creation timestamp |

* **Indices**:
  * `@@index([actorId])`
  * `@@index([targetId])`
  * `@@index([action])`
  * `@@index([createdAt])`
