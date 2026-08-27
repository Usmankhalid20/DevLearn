# DevLearn — 04 Contributions, Streaks & Analytics Engine Specification

## Context Files Read Before This Specification

This implementation unit was prepared in accordance with the DevLearn context set:
- [ai-workflow-rules.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/ai-workflow-rules.md) — daily contribution calculation, streak rules, verifiable metrics.
- [architecture.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/architecture.md) — internal activity visualization, no external GitHub API dependency.
- [code-standards.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/code-standards.md) — numeric presentation, date handling, Recharts integration.
- [ui-context.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/ui-context.md) — monochrome contribution palette (Levels 0–4), compact density.
- [03-core-learning-and-tasks.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/featrues/03-core-learning-and-tasks.md) — learning session source records and `ContributionDay` synchronization.

---

## Responsibility Boundary

| Information | Source of Truth |
|---|---|
| Product purpose, core loop, and scope | `project-overview.md` |
| System architecture, boundaries, storage, auth invariants | `architecture.md` |
| Coding rules and conventions | `code-standards.md` |
| Contribution Calendar, Streak Algorithm & Analytics Summaries | `04-contributions-and-analytics.md` |

---

## 1. Learning Contribution Calendar Architecture

### Core Invariants
- DevLearn generates its own GitHub-style 52-week activity calendar from recorded **learning sessions**.
- Does **not** require or import external GitHub commits or YouTube API data.
- Visual hierarchy uses dark monochrome tones from black to white.

### Level Thresholds & Tokens

| Level | Daily Tracked Time | Design Token / Hex | Semantic Meaning |
|---|---|---|---|
| **Level 0** | 0 minutes | `var(--level-0)` / `#1A1A1A` | Inactive / Rest Day |
| **Level 1** | 1 – 29 minutes | `var(--level-1)` / `#303030` | Light study session |
| **Level 2** | 30 – 59 minutes | `var(--level-2)` / `#555555` | Moderate focus session |
| **Level 3** | 60 – 119 minutes | `var(--level-3)` / `#858585` | Solid target achieved |
| **Level 4** | 120+ minutes | `var(--level-4)` / `#FFFFFF` | Deep focus day |

---

## 2. Streak Calculation Engine

### Active Day Rule
A calendar day (in the user's configured timezone) is classified as an **Active Learning Day** if and only if:
$$\text{Total Learning Minutes} \ge 1$$

### Streak Computation Algorithm
1. Query all `ContributionDay` records for `userId` where `totalMinutes > 0`, ordered by `date` ascending.
2. Determine user's `today` and `yesterday` formatted as `YYYY-MM-DD`.
3. **Current Streak**:
   - Count consecutive preceding days without a gap.
   - If the user logged time today, count ends today.
   - If the user has not yet logged time today, but logged time yesterday, the streak remains active (grace period until end of day).
   - If neither today nor yesterday has activity, `currentStreak = 0`.
4. **Longest (Best) Streak**:
   - Iterate through sorted active dates and track maximum continuous consecutive day sequence historically.

---

## 3. Analytics & Summary Engine

### Aggregated Metrics
- **Total Tracked Time**: Sum of all `durationMinutes` converted to formatted hours and minutes.
- **Total Sessions**: Count of all logged `LearningSession` records.
- **Average Session Duration**: $\frac{\text{Total Minutes}}{\text{Total Sessions}}$.
- **Current Streak & Longest Streak**: Calculated from the streak engine.
- **Subject Time Distribution**: Breakdown of total minutes and percentage per Subject.
- **30-Day Activity Trend**: Array of daily minutes for the preceding 30 days.

---

## 4. Backend API Module (`apps/api/src/modules/contributions` & `analytics`)

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/contributions/calendar` | Returns 365-day grid with `date`, `totalMinutes`, `sessionCount`, and `level` |
| `GET` | `/api/analytics/summary` | Returns comprehensive analytics payload (streaks, totals, subject breakdown, trends) |

### Analytics Response Contract

```typescript
export interface AnalyticsSummaryResponse {
  totalMinutes: number;
  totalHours: number;
  totalSessions: number;
  avgSessionMinutes: number;
  currentStreak: number;
  longestStreak: number;
  subjectDistribution: {
    subjectId: string;
    subjectName: string;
    colorToken: string | null;
    totalMinutes: number;
    totalHours: number;
    percentage: number;
  }[];
  recentActivityTrend: {
    date: string;
    minutes: number;
  }[];
}
```

---

## 5. Frontend Architecture (`apps/web`)

### Visual Components (`apps/web/components/analytics` & `contributions`)
1. **`ContributionHeatmap`**:
   - 52-week horizontal grid layout (7 rows $\times$ 52 columns).
   - Month labels along top axis, day-of-week labels along left axis.
   - Custom hover tooltip showing date, total minutes/hours, and session count.
   - Quick filter toggle (Last 12 Months, Current Year).
2. **`SubjectDistributionChart`**:
   - Recharts horizontal bar chart showing hours per user-defined subject.
   - Clean monochrome styling with percentage callouts.
3. **`ActivityTrendChart`**:
   - Recharts smoothed Area Chart illustrating daily study minutes over the last 30 days.

### Portal Views
- **`/dashboard`**: Embeds compact 52-week `ContributionHeatmap`, streak metric badges, and "Today's Learning" card.
- **`/analytics`**: Dedicated comprehensive analytics view with high-level KPI cards, subject breakdowns, and trend charts.

---

## 6. Verification & Testing Plan

### Automated Integration Tests (`apps/api/tests/analytics.test.ts`)
1. Test level boundary assignments (0m $\rightarrow$ 0, 15m $\rightarrow$ 1, 45m $\rightarrow$ 2, 90m $\rightarrow$ 3, 150m $\rightarrow$ 4).
2. Test streak calculation with consecutive days.
3. Test streak grace period when yesterday is active but today is pending.
4. Test streak reset when a 2-day gap occurs.
5. Verify `/api/contributions/calendar` returns exactly 365 days of data.
6. Verify `/api/analytics/summary` computes accurate subject percentages summing to 100%.
