# DevLearn — 03 Core Learning & Task Tracking Specification

## Purpose

Define the implementation specification for Subjects, Tasks, Learning Sessions, and the Live Interactive Timer.

---

## 1. Domain Rules & Responsibilities

1. **Subjects**:
   - User-defined and dynamic (e.g. "Data Structures", "System Design", "Rust", "Distributed Systems").
   - Cannot hard-code example subjects.
   - Unique per user: `@@unique([userId, name])`.

2. **Tasks (Plans)**:
   - Represent intended work, objectives, or to-dos.
   - Status: pending vs completed.
   - Task completion **does not** equal learning duration.

3. **Learning Sessions (Actual Activity)**:
   - Required fields: `subjectId`, `durationMinutes` (> 0), `date`.
   - Optional fields: `taskId`, `resourceId`, `courseId`, `topic`, `learnedNotes`, `generalNotes`.
   - Modifying or creating a learning session triggers contribution updates and cache invalidation.

4. **Live Interactive Timer**:
   - Client-side countdown / stopwatch with start, pause, resume, reset.
   - Background-resilient: Stores timestamp in `localStorage` so refreshing or switching tabs maintains accurate elapsed time.
   - On completion: Opens a pre-filled session log dialog with the recorded duration.

---

## 2. API Endpoints

### Subjects (`/api/subjects`)
- `GET /api/subjects` — List all subjects for authenticated user with session/task counts.
- `POST /api/subjects` — Create a new subject (`name`, `description`, `colorToken`).
- `PUT /api/subjects/:id` — Update a subject.
- `DELETE /api/subjects/:id` — Delete a subject.

### Tasks (`/api/tasks`)
- `GET /api/tasks` — List tasks with filtering by subject or completion status.
- `POST /api/tasks` — Create task (`title`, `description`, `subjectId`, `dueDate`).
- `PATCH /api/tasks/:id/toggle` — Toggle task completion.
- `PUT /api/tasks/:id` — Edit task.
- `DELETE /api/tasks/:id` — Delete task.

### Learning Sessions (`/api/learning-sessions`)
- `GET /api/learning-sessions` — List sessions with pagination and date range / subject filters.
- `POST /api/learning-sessions` — Create a session (`subjectId`, `durationMinutes`, `date`, `topic`, `learnedNotes`, `generalNotes`, `taskId`, `resourceId`).
- `PUT /api/learning-sessions/:id` — Update a session.
- `DELETE /api/learning-sessions/:id` — Delete a session.

### Resources & Goals (`/api/resources`, `/api/goals`)
- CRUD endpoints for managing supporting resources and learning goals.

---

## 3. Frontend Views (`apps/web`)

- **`/learning`**:
  - Live Interactive Timer widget with start/pause/resume/save.
  - Manual session entry dialog / form.
  - Recent sessions list with edit/delete modals.
- **`/tasks`**:
  - Task list organized by status and subject.
  - Quick add task input.
  - Checkbox toggle for completion with visual distinction from learning sessions.
- **`/resources`**:
  - Curated links and reference URLs.
- **`/history`**:
  - Paginated timeline of completed learning sessions.
