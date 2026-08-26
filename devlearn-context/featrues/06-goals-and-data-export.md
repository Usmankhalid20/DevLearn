# DevLearn — 06 Learning Goals, Milestones & Data Export Specification

## Purpose

Define the specification for structured learning goals (target hours & deadlines), milestone tracking, data export (JSON/CSV), and production CI/CD workflows.

---

## 1. Domain Rules & Responsibilities

1. **Learning Goals**:
   - Users can define long-term goals (e.g. "Master Distributed Systems — 40 Hours", "DSA Marathon — 60 Hours").
   - A goal can be linked to a specific `Subject` or be overall.
   - Target metrics: `targetHours`, `currentHours` (dynamically computed or synced from learning sessions within the goal's date range), `startDate`, `endDate`, `status` (`IN_PROGRESS`, `COMPLETED`, `ARCHIVED`).

2. **Data Export & Portability**:
   - Developers own their data.
   - `GET /api/export/json` — Complete user data dump (User profile, settings, subjects, tasks, sessions, goals, contributions).
   - `GET /api/export/csv` — CSV table of all completed learning sessions.

3. **CI/CD & Containerization**:
   - Production Dockerfiles for `apps/api` and `apps/web`.
   - GitHub Actions workflow (`.github/workflows/ci.yml`) validating lint, typecheck, tests, and builds on push to `main` and `development`.

---

## 2. API Endpoints

### Goals (`/api/goals`)
- `GET /api/goals` — List user goals with progress percentage and days remaining.
- `POST /api/goals` — Create new goal (`title`, `description`, `targetHours`, `subjectId`, `startDate`, `endDate`).
- `PUT /api/goals/:id` — Update goal details or mark completed/archived.
- `DELETE /api/goals/:id` — Delete a goal.

### Data Export (`/api/export`)
- `GET /api/export/json` — Download full account archive.
- `GET /api/export/csv` — Download learning session log in CSV format.

---

## 3. Frontend Views (`apps/web`)

- **`/goals`**:
  - Goals board with active, completed, and upcoming targets.
  - Interactive progress bars showing current hours vs target hours.
  - "New Goal" modal.
- **`/settings` Update**:
  - "Data Portability" card with 1-click JSON & CSV export buttons.
- Update Sidebar with navigation link to `/goals`.
