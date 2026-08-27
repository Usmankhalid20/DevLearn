# DevLearn — 06 Learning Goals, Milestones & Data Export Specification

## Context Files Read Before This Specification

This implementation unit was prepared in accordance with the DevLearn context set:
- [ai-workflow-rules.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/ai-workflow-rules.md) — structured goal management, data ownership, CI/CD verification.
- [architecture.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/architecture.md) — data portability principles, PostgreSQL aggregation, GitHub Actions CI pipeline.
- [code-standards.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/code-standards.md) — export streaming, error handling, Zod validation.
- [ui-context.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/ui-context.md) — goal cards, progress bars, milestone tags.
- [03-core-learning-and-tasks.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/featrues/03-core-learning-and-tasks.md) — dynamic subjects and learning session sources.

---

## Responsibility Boundary

| Information | Source of Truth |
|---|---|
| Product purpose, core loop, and scope | `project-overview.md` |
| System architecture, boundaries, storage, auth invariants | `architecture.md` |
| Coding rules and conventions | `code-standards.md` |
| Learning Goals, Data Portability & CI/CD Pipeline | `06-goals-and-data-export.md` |

---

## 1. Domain Rules & Core Principles

### Invariant 1: Structured Learning Goals
- Goals represent long-term targets (e.g. *"Master Distributed Systems — 40 Hours"*, *"DSA Marathon — 60 Hours"*).
- Can optionally be linked to a specific `Subject` or represent overall study hours.
- Fields: `title`, `description`, `targetMinutes` (or hours), `currentMinutes`, `startDate`, `endDate`, `status` (`IN_PROGRESS`, `COMPLETED`, `ARCHIVED`), `isAchieved`.
- **Dynamic Hours Progress**: When querying goals, the system computes actual hours logged in linked learning sessions within the goal's date range and updates progress percentage.

### Invariant 2: Developer Data Portability (No Lock-In)
- Developers own 100% of their learning data.
- **Full JSON Archive (`/api/export/json`)**: Complete export dump containing User profile, settings, subjects, tasks, learning sessions, goals, courses, and contribution days.
- **Spreadsheet CSV Log (`/api/export/csv`)**: Tabular export of all recorded learning sessions (`Date`, `Subject`, `Topic`, `Duration (Minutes)`, `Notes`, `Resource URL`).

### Invariant 3: Automated CI/CD Workflows
- Continuous integration pipeline (`.github/workflows/ci.yml`) automatically triggers on pull requests and pushes to `main` and `development`.
- Verifies: TypeScript typecheck across monorepo, ESLint validation, full Vitest integration test suite, and Next.js static production build.

---

## 2. Backend API Modules

### A. Goals Module (`apps/api/src/modules/goals`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/goals` | List all goals with dynamic progress percentages and days remaining |
| `POST` | `/api/goals` | Create a new target goal (`title`, `targetHours`, `subjectId`, `startDate`, `endDate`) |
| `PUT` | `/api/goals/:id` | Update goal target, description, or manually mark completed/archived |
| `DELETE` | `/api/goals/:id` | Delete goal record |

```typescript
export const createGoalSchema = z.object({
  title: z.string().min(1, 'Goal title is required').max(200).trim(),
  description: z.string().max(1000).optional(),
  targetHours: z.number().positive('Target hours must be greater than 0').max(10000),
  subjectId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});
```

---

### B. Data Export Module (`apps/api/src/modules/export`)

| Method | Endpoint | Headers | Description |
|---|---|---|---|
| `GET` | `/api/export/json` | `Content-Type: application/json`, `Content-Disposition: attachment; filename="devlearn-backup-*.json"` | Streams entire account JSON database dump |
| `GET` | `/api/export/csv` | `Content-Type: text/csv`, `Content-Disposition: attachment; filename="devlearn-sessions-*.csv"` | Streams session log formatted as CSV |

---

## 3. Frontend Architecture (`apps/web`)

### Portal Views
1. **`/goals`**:
   - Status Tabs: *Active Goals*, *Completed*, *All*.
   - Goal Cards: Display title, linked subject badge, milestone progress bar, current vs. target hours, and days remaining.
   - *Create Goal Modal*: Clean dialog with target hours input and subject selector.
2. **`/settings` (Data Portability Section)**:
   - *Download JSON Backup*: 1-click download triggering `/api/export/json`.
   - *Export Sessions to CSV*: 1-click download triggering `/api/export/csv`.
3. **Sidebar Navigation**:
   - Added `/goals` navigation item with `Target` icon.

---

## 4. Verification & Testing Plan

### Automated Integration Tests (`apps/api/tests/goals.test.ts`)
1. Create a goal with target of 20 hours linked to a subject.
2. Log learning sessions totaling 5 hours for that subject.
3. Verify `/api/goals` calculates current hours as 5.0 and progress percentage as 25%.
4. Verify `/api/export/json` returns valid JSON with all user domain entities.
5. Verify `/api/export/csv` contains valid CSV headers and rows matching logged sessions.
6. Verify User B cannot access User A's exported data or goals.
