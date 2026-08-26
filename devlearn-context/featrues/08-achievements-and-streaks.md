# DevLearn — 08 Milestone Badges & Learning Achievements Specification

## Purpose

Define the specification for gamified developer milestone badges, consistency recognition, and streak shields.

---

## 1. Achievement Rules

DevLearn automatically awards monochrome milestone badges based on verifiable learning activity:

| Badge ID | Badge Title | Criteria | Description |
|---|---|---|---|
| `first_session` | First Light | 1 completed learning session | First recorded learning activity |
| `focus_10h` | 10 Hours of Focus | >= 600 total learning minutes | 10 accumulated hours of dedicated study |
| `focus_50h` | Deep Craft | >= 3000 total learning minutes | 50 accumulated hours of study |
| `streak_7` | 7-Day Momentum | >= 7 active streak days | 1 full week of daily learning consistency |
| `streak_30` | Consistency Titan | >= 30 active streak days | 1 full month of unbroken focus |
| `deep_diver` | Deep Focus Master | Any single session >= 120m | High stamina learning block |
| `polymath` | Multi-Subject Polymath | >= 3 distinct subjects with logged sessions | Broadened developer knowledge |

---

## 2. API Endpoints (`/api/achievements`)

- `GET /api/achievements` — Evaluates user's learning data and returns unlocked badges with unlock timestamps.

---

## 3. Frontend Views (`apps/web`)

- `/achievements` portal page showcasing unlocked badges with glowing dark-monochrome cards and progress meters toward locked milestones.
