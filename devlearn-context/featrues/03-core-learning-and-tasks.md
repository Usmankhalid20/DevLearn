# DevLearn — 03 Core Learning & Task Tracking Specification

## Context Files Read Before This Specification

This implementation unit was prepared in accordance with the DevLearn context set:
- [ai-workflow-rules.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/ai-workflow-rules.md) — core product principles, task vs. session separation, dynamic subject handling.
- [architecture.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/architecture.md) — modular Express monolith, PostgreSQL source of truth, user isolation invariants.
- [code-standards.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/code-standards.md) — thin controllers, robust services, Zod validation, React Hook Form conventions.
- [ui-context.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/ui-context.md) — dark monochrome aesthetic, typography, card spacing, and modal dialogs.
- [02-data-model-and-auth.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/featrues/02-data-model-and-auth.md) — relational Prisma schema and authenticated session middleware.

---

## Responsibility Boundary

| Information | Source of Truth |
|---|---|
| Product purpose, core loop, and scope | `project-overview.md` |
| System architecture, boundaries, storage, auth invariants | `architecture.md` |
| Coding rules and conventions | `code-standards.md` |
| Core Learning Sessions, Dynamic Subjects, Tasks & Timer Details | `03-core-learning-and-tasks.md` |

---

## 1. Domain Rules & Core Principles

### Invariant 1: Dynamic Subjects (Never Hard-Coded)
- Learning subjects are completely user-defined (e.g. *Distributed Systems*, *Compilers*, *PostgreSQL Internals*, *Algorithms*, *Rust*).
- No system-wide categories or fixed presets.
- Uniqueness enforced per user via `@@unique([userId, name])`.
- Deleting a subject cascades or cleanly detaches child records according to relational rules.

### Invariant 2: Tasks vs. Learning Sessions Separation
- **Tasks (Plans / Objectives)**:
  - Represent intended work or study items (`title`, `description`, `dueDate`, `isCompleted`).
  - Toggling a task to completed marks it as done (`completedAt: new Date()`), but **does not** generate learning time.
- **Learning Sessions (Actual Activity & Time)**:
  - Represent verifiable time invested (`durationMinutes > 0`, `date`, `topic`, `learnedNotes`, `generalNotes`).
  - Optionally linked to a `taskId`, `resourceId`, or `courseId`.
  - Is the **only** source for daily learning duration, streaks, and contribution graph activity.

### Invariant 3: Live Interactive Timer Engine
- Supports Countdown (Pomodoro) and Stopwatch (Open Focus) modes.
- **Background Persistence**: The timer state (start timestamp, target duration, running status, elapsed base) is stored in browser `localStorage`.
- Tab closing, page reloads, and browser restarts compute true elapsed time via `Date.now() - startedAt`.
- Upon timer completion or manual stop, opens the **Log Learning Session Dialog** with `durationMinutes` pre-filled.

---

## 2. Backend API Modules

### A. Subjects Module (`apps/api/src/modules/subjects`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/subjects` | List all subjects for user with aggregated session and task counts |
| `POST` | `/api/subjects` | Create a new dynamic subject (`name`, `description`, `colorToken`) |
| `PUT` | `/api/subjects/:id` | Update subject name or description |
| `DELETE` | `/api/subjects/:id` | Delete subject (cascades or prevents deletion if linked items exist) |

```typescript
export const createSubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required').max(100).trim(),
  description: z.string().max(500).optional(),
  colorToken: z.string().max(50).optional(),
});
```

---

### B. Tasks Module (`apps/api/src/modules/tasks`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | List tasks with optional filtering by `subjectId` or `isCompleted` |
| `POST` | `/api/tasks` | Create new planned task (`title`, `description`, `subjectId`, `dueDate`) |
| `PATCH` | `/api/tasks/:id/toggle` | Toggle task completion status (`isCompleted`, `completedAt`) |
| `PUT` | `/api/tasks/:id` | Edit task details |
| `DELETE` | `/api/tasks/:id` | Delete task |

```typescript
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200).trim(),
  description: z.string().max(1000).optional(),
  subjectId: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
});
```

---

### C. Learning Sessions Module (`apps/api/src/modules/learning`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/learning-sessions` | List sessions with pagination (`page`, `limit`) and subject/date filters |
| `POST` | `/api/learning-sessions` | Record a session; triggers atomic sync with `ContributionDay` |
| `GET` | `/api/learning-sessions/:id` | Get full details of a specific learning session |
| `PUT` | `/api/learning-sessions/:id` | Update session duration/notes; recalculates affected contribution day |
| `DELETE` | `/api/learning-sessions/:id` | Delete session; recalculates affected contribution day |

```typescript
export const createLearningSessionSchema = z.object({
  subjectId: z.string().uuid('Valid subject is required'),
  durationMinutes: z.number().int().min(1, 'Duration must be at least 1 minute').max(1440),
  date: z.string().datetime().or(z.date()),
  topic: z.string().max(200).optional(),
  learnedNotes: z.string().max(5000).optional(),
  generalNotes: z.string().max(5000).optional(),
  taskId: z.string().uuid().optional(),
  resourceId: z.string().uuid().optional(),
  courseId: z.string().uuid().optional(),
});
```

#### Contribution Day Synchronization Algorithm
When a learning session is created, modified, or deleted:
1. Identify the calendar date `YYYY-MM-DD` in the user's timezone.
2. Sum all `durationMinutes` for that `userId` and `date`.
3. Count total sessions for that date.
4. Calculate contribution level:
   - $0\text{ min} \rightarrow \text{Level 0}$
   - $1\text{--}29\text{ min} \rightarrow \text{Level 1}$
   - $30\text{--}59\text{ min} \rightarrow \text{Level 2}$
   - $60\text{--}119\text{ min} \rightarrow \text{Level 3}$
   - $\ge 120\text{ min} \rightarrow \text{Level 4}$
5. Upsert the `ContributionDay` record inside a PostgreSQL transaction.

---

### D. Resources Module (`apps/api/src/modules/resources`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/resources` | List user bookmark resources |
| `POST` | `/api/resources` | Save reference URL (`title`, `url`, `type`) |
| `PUT` | `/api/resources/:id` | Update resource |
| `DELETE` | `/api/resources/:id` | Delete resource |

---

## 3. Frontend Architecture (`apps/web`)

### Portal Routes
```text
app/(portal)/
 ├── dashboard/page.tsx   # Aggregated summary: Today's time, Streak, Heatmap, Recent sessions
 ├── learning/page.tsx    # Live Focus Timer widget + Quick Manual Log + Active sessions
 ├── tasks/page.tsx       # Planned tasks management by subject, toggle completion
 ├── history/page.tsx     # Paginated timeline log of all completed learning sessions
 └── resources/page.tsx   # Saved developer reference materials and documentation links
```

### Reusable Feature Components (`apps/web/components`)
1. **`FocusTimer`**: Monochrome timer display with Start, Pause, Reset, and Mode Toggle (Stopwatch / Pomodoro).
2. **`SessionLogDialog`**: Modal for recording or editing learning sessions with Subject selector, duration input, and Markdown-supported note fields.
3. **`SubjectSelect`**: Reusable dropdown with "Create new subject" inline action.
4. **`TaskCard`**: Minimal monochrome task row with checkbox toggle and subject badge.

---

## 4. Verification & Testing Plan

### Automated Integration Tests (`apps/api/tests/learning.test.ts`)
1. Create dynamic user-scoped subject and verify uniqueness constraint.
2. Create planned task and toggle completion status (verifying `completedAt` timestamp).
3. Log learning session linked to subject and task, verifying `durationMinutes` persistence.
4. Verify `ContributionDay` table is automatically upserted with correct total minutes and level.
5. Verify cross-user data isolation (User B cannot query User A's subjects, tasks, or sessions).
6. Verify updating session duration recalculates the corresponding `ContributionDay` entry.
