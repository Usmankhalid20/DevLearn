# DevLearn — 08 Milestone Badges & Learning Achievements Specification

## Context Files Read Before This Specification

This implementation unit was prepared in accordance with the DevLearn context set:
- [ai-workflow-rules.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/ai-workflow-rules.md) — developer momentum, verifiable milestone recognition.
- [architecture.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/architecture.md) — dynamic evaluation engine, zero paid gamification vendors.
- [code-standards.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/code-standards.md) — clean domain evaluation functions, deterministic business logic.
- [ui-context.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/ui-context.md) — monochrome badge cards, subtle glow accents, progress bars.
- [04-contributions-and-analytics.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/featrues/04-contributions-and-analytics.md) — streak engine and total duration metrics.

---

## Responsibility Boundary

| Information | Source of Truth |
|---|---|
| Product purpose, core loop, and scope | `project-overview.md` |
| System architecture, boundaries, storage, auth invariants | `architecture.md` |
| Coding rules and conventions | `code-standards.md` |
| Gamification Badges, Milestone Evaluation & Criteria | `08-achievements-and-streaks.md` |

---

## 1. Milestone Badges & Criteria Rules

DevLearn automatically evaluates and awards developer milestone badges based on verifiable learning activity:

| Badge ID | Badge Title | Criteria | Description |
|---|---|---|---|
| `first_session` | **First Light** | $\ge 1$ completed learning session | First recorded learning activity in DevLearn |
| `focus_10h` | **10 Hours of Focus** | $\ge 600$ total learning minutes | 10 accumulated hours of dedicated technical study |
| `focus_50h` | **Deep Craft** | $\ge 3,000$ total learning minutes | 50 accumulated hours of mastery and practice |
| `streak_7` | **7-Day Momentum** | $\ge 7$ consecutive active streak days | 1 full week of daily learning consistency |
| `streak_30` | **Consistency Titan** | $\ge 30$ consecutive active streak days | 1 full month of unbroken focus |
| `deep_diver` | **Deep Focus Master** | Any single session $\ge 120$ minutes | High-stamina deep work session |
| `polymath` | **Multi-Subject Polymath**| $\ge 3$ distinct subjects with logged sessions | Cross-disciplinary developer breadth |

---

## 2. Dynamic Evaluation Engine

### Engine Algorithm
When `GET /api/achievements` is requested:
1. Aggregate the user's total study minutes, total session count, longest/current streak, maximum single session duration, and count of distinct active subjects.
2. For each badge definition, check if criteria are satisfied:
   - If satisfied: `isUnlocked: true`, compute `unlockedAt` timestamp based on earliest qualifying record, `progress: 100%`.
   - If locked: `isUnlocked: false`, `unlockedAt: null`, compute accurate `currentProgress` vs. `targetProgress` (e.g. 180m / 600m $\rightarrow$ 30%).
3. Return deterministic list of all badges sorted by unlocked first.

---

## 3. Backend API Module (`apps/api/src/modules/achievements`)

### REST Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/achievements` | Evaluates user activity and returns all badges with unlock status, timestamps, and progress |

### Response Contract

```typescript
export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  criteria: string;
  isUnlocked: boolean;
  unlockedAt: string | null;
  progressPercent: number;
  currentValue: number;
  targetValue: number;
  unit: string;
}

export interface AchievementsResponse {
  unlockedCount: number;
  totalCount: number;
  badges: AchievementBadge[];
}
```

---

## 4. Frontend Architecture (`apps/web`)

### Portal Views
1. **`/achievements`**:
   - Header Summary: Showing *Unlocked (X / 7)* with progress meter.
   - Badge Cards Grid:
     - Unlocked Badges: White border, high-contrast typography, unlocked date badge (`Unlocked Jan 15, 2026`).
     - Locked Badges: Subtle border (`#2A2A2A`), muted typography, progress bar showing exact remaining distance (e.g., `4 / 7 days`, `320 / 600 min`).
2. **Sidebar Navigation**:
   - Added `/achievements` navigation link with `Sparkles` / `Award` icon.

---

## 5. Verification & Testing Plan

### Automated Integration Tests (`apps/api/tests/courses_achievements.test.ts`)
1. Brand new user has 0 unlocked badges.
2. User with 1 session unlocks `first_session` and has accurate progress on `focus_10h`.
3. User with a 130-minute session unlocks `deep_diver`.
4. User logging sessions across 3 subjects unlocks `polymath`.
5. Verify response serialization contains valid numeric progress percentages.
