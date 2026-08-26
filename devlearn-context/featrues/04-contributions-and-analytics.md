# DevLearn — 04 Contributions, Streaks & Analytics Specification

## Purpose

Define the rules for the monochrome contribution heatmap, streak calculation engine, learning distribution metrics, and interactive charts.

---

## 1. Contribution Heatmap Threshold Rules

The contribution calendar represents total daily tracked learning minutes in monochrome levels:

| Level | Daily Minutes Threshold | Token / Color | Visual Meaning |
|---|---|---|---|
| Level 0 | 0 minutes | `#1A1A1A` | Inactive / rest day |
| Level 1 | 1 – 29 minutes | `#303030` | Light learning session |
| Level 2 | 30 – 59 minutes | `#555555` | Moderate learning session |
| Level 3 | 60 – 119 minutes | `#858585` | Solid target achieved |
| Level 4 | 120+ minutes | `#FFFFFF` | Deep focus day |

---

## 2. Streak Engine

- An **active learning day** is defined as any calendar day in the user's timezone with >= 1 minute of tracked learning session.
- **Current Streak**: Consecutive active learning days ending today or yesterday.
- **Longest Streak**: Maximum consecutive active learning days historically.

---

## 3. Analytics & Summary Engine

- **Metrics**: Total learning time (hours/minutes), Total sessions, Average session duration, Current streak, Best streak.
- **Breakdown**: Time distribution by subject (pie/bar chart), daily activity trend (last 30 days / 12 months).
- **Endpoint**: `GET /api/analytics/summary` & `GET /api/contributions/calendar`.
