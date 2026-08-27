# DevLearn — 07 Interactive Courses & Structured Tracks Specification

## Context Files Read Before This Specification

This implementation unit was prepared in accordance with the DevLearn context set:
- [ai-workflow-rules.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/ai-workflow-rules.md) — optional external references, structured learning tracks, dynamic categorization.
- [architecture.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/architecture.md) — PostgreSQL data model, relational integrity, session associations.
- [code-standards.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/code-standards.md) — REST conventions, clean typing, reusable card components.
- [ui-context.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/ui-context.md) — monochrome cards, badge tags, platform indicators.
- [03-core-learning-and-tasks.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/featrues/03-core-learning-and-tasks.md) — timer integration and session logging workflows.

---

## Responsibility Boundary

| Information | Source of Truth |
|---|---|
| Product purpose, core loop, and scope | `project-overview.md` |
| System architecture, boundaries, storage, auth invariants | `architecture.md` |
| Coding rules and conventions | `code-standards.md` |
| Structured Courses, Track Progress & Focus Integration | `07-courses-and-modules.md` |

---

## 1. Domain Rules & Core Principles

### Invariant 1: Structured Course Tracks
- Represents external courses, video playlists, textbook roadmaps, or structured developer tracks (e.g. *"MIT 6.824 Distributed Systems"*, *"NeetCode 150"*, *"Crafting Interpreters"*, *"Stanford CS144 Networking"*).
- Fields: `title`, `platform` (e.g. *"YouTube"*, *"Coursera"*, *"edX"*, *"Book"*, *"Custom"*), `url`, `totalDurationMinutes`, `completedDurationMinutes`, `isCompleted`, `subjectId`, `userId`.

### Invariant 2: Dynamic Progress Rollup
- When a user logs a learning session referencing `courseId`, the system aggregates all session durations linked to that course to update `completedDurationMinutes` and percentage completed.
- Users can also manually toggle a course as completed (`isCompleted: true`).

### Invariant 3: Direct Focus Timer Integration
- Clicking *"Start Focus on Course"* from the `/courses` view navigates to the Focus Timer with the course and its associated subject pre-selected, minimizing friction.

---

## 2. Backend API Module (`apps/api/src/modules/courses`)

### REST Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/courses` | List all courses for authenticated user with dynamic progress and subject details |
| `POST` | `/api/courses` | Create a new course track (`title`, `platform`, `url`, `totalDurationMinutes`, `subjectId`) |
| `GET` | `/api/courses/:id` | Get single course details and list of linked learning sessions |
| `PUT` | `/api/courses/:id` | Update course details or completion status |
| `DELETE` | `/api/courses/:id` | Delete course record (detaches linked sessions cleanly) |

### Request Schema

```typescript
export const createCourseSchema = z.object({
  title: z.string().min(1, 'Course title is required').max(200).trim(),
  platform: z.string().min(1).max(50).default('Custom'),
  url: z.string().url('Invalid URL format').optional().or(z.literal('')),
  description: z.string().max(1000).optional(),
  totalDurationMinutes: z.number().int().nonnegative().default(0),
  subjectId: z.string().uuid().optional(),
});
```

---

## 3. Frontend Architecture (`apps/web`)

### Portal Views
1. **`/courses`**:
   - Course Cards: Display platform badge (e.g. `[YouTube]`, `[Book]`), title, external link icon, linked subject badge, progress bar, completed vs total duration, and quick action button.
   - *"Add Course"* Modal: Form for title, platform selector, external URL, estimated total minutes/hours, and subject association.
   - Filter by completion status (*All*, *In Progress*, *Completed*).
2. **Sidebar Navigation**:
   - Added `/courses` navigation link with `Layers` icon.

---

## 4. Verification & Testing Plan

### Automated Integration Tests (`apps/api/tests/courses_achievements.test.ts`)
1. Create a course with 600 estimated minutes.
2. Log two learning sessions (90m and 120m) associated with the course.
3. Verify `/api/courses` returns `completedDurationMinutes: 210` and calculates 35% completion.
4. Verify updating course completion flag toggles `isCompleted`.
5. Verify User B cannot access or modify User A's courses.
