# DevLearn — Complete Features & Modules Guide

This guide provides an exhaustive walkthrough of all features, capabilities, and workflows across the DevLearn ecosystem.

---

## Table of Features

1. [Authentication & Identity Management](#1-authentication--identity-management)
2. [Dynamic Subjects & Taxonomy](#2-dynamic-subjects--taxonomy)
3. [Learning Sessions & Time Tracking (Manual & Live Timer)](#3-learning-sessions--time-tracking)
4. [Task Planning & Checklists](#4-task-planning--checklists)
5. [Courses & Learning Tracks](#5-courses--learning-tracks)
6. [Goal Tracking & Hourly Targets](#6-goal-tracking--hourly-targets)
7. [Resource Library & Bookmarks](#7-resource-library--bookmarks)
8. [52-Week Monochrome Contribution Heatmap](#8-52-week-monochrome-contribution-heatmap)
9. [Learning Analytics & Focus Trends](#9-learning-analytics--focus-trends)
10. [Milestone Badges & Streak Engine](#10-milestone-badges--streak-engine)
11. [Data Portability & 1-Click Export](#11-data-portability--1-click-export)
12. [User Preferences & Timezone Settings](#12-user-preferences--timezone-settings)
13. [System Administration & RBAC Portal](#13-system-administration--rbac-portal)
14. [Infrastructure Diagnostics & Telemetry](#14-infrastructure-diagnostics--telemetry)
15. [Security Audit Logging](#15-security-audit-logging)
16. [Mobile Companion Application](#16-mobile-companion-application)

---

## 1. Authentication & Identity Management

DevLearn provides a robust, standalone authentication system without relying on third-party SaaS identity providers:

* **Email & Password Registration**: Clean registration with email verification workflows.
* **Cryptographic Security**: Passwords hashed with `argon2id` incorporating random salt per user.
* **Session Management**: Server-backed `UserSession` records mapped to secure, signed HTTP-only cookies.
* **Instant Session Revocation**: Ability to invalidate individual or all active sessions upon password changes or administrative action.
* **Password Recovery**: Secure token-based password reset via automated transactional emails (Nodemailer + SMTP).

---

## 2. Dynamic Subjects & Taxonomy

DevLearn rejects hardcoded categories. Users define their own technical learning taxonomy:

* **Custom Subject Creation**: Create subjects such as *PostgreSQL Internals, Distributed Systems, Rust, LeetCode Hard, Linux Kernel, WebAssembly*.
* **Color Tokens & Styling**: Assign distinct monochrome/grayscale tokens for visual tagging across dashboards and charts.
* **Subject Statistics**: Automatic counts of attached learning sessions, tasks, and courses.

---

## 3. Learning Sessions & Time Tracking

The core engine of DevLearn. Enables precise recording of focus time:

* **Two Tracking Modes**:
  1. **Live Stopwatch Timer**: Real-time `HH:MM:SS` timer with Start, Pause, Resume, and Auto-Save on completion.
  2. **Manual Quick Log**: Input duration in minutes for past study sessions in 3–5 seconds.
* **Session Metadata (All Optional)**:
  * **Topic**: Brief concept studied (e.g., *"B-Tree indexing vs LSM Trees"*).
  * **What I Learned (Learned Notes)**: Key takeaway summary for future recall.
  * **General Notes / Code Snippets**: Markdown notes taken during the session.
  * **Linked Task**: Link to an existing task to show what task prompted this study.
  * **Linked Course**: Associate study minutes with a structured curriculum.
  * **Linked Resource**: Bookmark the exact URL or documentation page referenced.

---

## 4. Task Planning & Checklists

Tasks in DevLearn capture **intent**, cleanly decoupled from actual focus time:

* **Task Creation**: Title, description, subject classification, and optional due date.
* **Completion Tracking**: Check off tasks as you finish projects, exercises, or tutorials.
* **Separation Principle**: Checking off a task does *not* fabricate learning time. Actual minutes must be logged through a Learning Session.

---

## 5. Courses & Learning Tracks

Organize multi-part technical courses and tutorials:

* **Course Cataloging**: Track courses by title, provider/platform (e.g., *Coursera, Udemy, YouTube, Internal Docs, Custom*), and URL.
* **Progress Engine**: Automatically computes completion percentage based on `completedDurationMinutes` vs `totalDurationMinutes`.
* **Session Linkage**: Log learning sessions directly against a course to automatically accrue completed duration.

---

## 6. Goal Tracking & Hourly Targets

Set quantifiable study objectives to stay motivated:

* **Target Definition**: Set target hours (e.g., *"Dedicate 50 hours to System Design this quarter"*).
* **Automatic Progress Calculation**: Calculates `currentHours` and `progressPercentage` against logged study sessions for that subject.
* **Goal Statuses**: `IN_PROGRESS`, `COMPLETED`, `ARCHIVED`.

---

## 7. Resource Library & Bookmarks

Centralized bookmark repository for study references:

* **Resource Types**: URLs for official documentation, GitHub repositories, research papers, video lectures, and technical articles.
* **Session Association**: Attach resources directly to study sessions so you can revisit references with a single click.

---

## 8. 52-Week Monochrome Contribution Heatmap

A signature feature inspired by developer commit graphs, powered purely by **verified learning minutes**:

* **Grayscale Palette**:
  * **Level 0 (`#1A1A1A`)**: Inactive day (0 minutes).
  * **Level 1 (`#303030`)**: Light study (1 – 29 minutes).
  * **Level 2 (`#555555`)**: Moderate focus (30 – 59 minutes).
  * **Level 3 (`#858585`)**: Solid target achieved (60 – 119 minutes).
  * **Level 4 (`#FFFFFF`)**: Deep focus master day (120+ minutes).
* **Zero External Dependencies**: Generated entirely from internal `ContributionDay` records in PostgreSQL.
* **Interactive Tooltips**: Hover over any square to view exact date, total hours/minutes, and session counts.

---

## 9. Learning Analytics & Focus Trends

Comprehensive visual analytics powered by Recharts:

* **Key Performance Indicators (KPIs)**:
  * Total Tracked Learning Time (formatted in hours and minutes).
  * Total Sessions Logged.
  * Average Session Duration.
  * Current Active Streak & All-Time Longest Streak.
* **Subject Time Distribution**: Grayscale horizontal bar charts showing relative time percentages across subjects.
* **30-Day Activity Trend**: Smoothed area chart displaying daily focus minutes over the previous month.

---

## 10. Milestone Badges & Streak Engine

### The Streak Algorithm (With Grace Period)
* An active day is defined as $\ge 1$ minute of tracked learning.
* **Grace Period**: If you studied yesterday but haven't logged today yet, your streak remains unbroken until midnight in your configured timezone.

### Automated Milestone Badges
DevLearn dynamically evaluates and awards achievements based on verifiable progress:

| Badge ID | Badge Title | Criteria | Description |
|---|---|---|---|
| `first_session` | **First Light** | $\ge 1$ session | First logged study session |
| `focus_10h` | **10 Hours of Focus** | $\ge 600$ minutes | 10 accumulated focus hours |
| `focus_50h` | **Deep Craft** | $\ge 3,000$ minutes | 50 accumulated focus hours |
| `streak_7` | **7-Day Momentum** | $\ge 7$ consecutive days | 1 unbroken week of daily study |
| `streak_30` | **Consistency Titan** | $\ge 30$ consecutive days | 1 full month of unbroken focus |
| `deep_diver` | **Deep Focus Master** | Any single session $\ge 120$ min | High-stamina deep work session |
| `polymath` | **Multi-Subject Polymath** | $\ge 3$ active subjects | Broad cross-disciplinary study |

---

## 11. Data Portability & 1-Click Export

DevLearn guarantees complete data ownership:

* **JSON Export (`/api/v1/export/json`)**: Full nested data bundle including user profile, subjects, tasks, courses, goals, and complete learning session history.
* **CSV Export (`/api/v1/export/csv`)**: Flattened spreadsheet format ready for import into Excel, Google Sheets, or custom data pipelines.

---

## 12. User Preferences & Timezone Settings

* **Timezone Configuration**: Select your local IANA timezone (e.g., `America/New_York`, `Asia/Tokyo`, `Europe/London`) to ensure midnight streak boundaries calculate accurately.
* **Daily Focus Goal**: Set your target daily study minutes (default: 60 mins) to customize progress rings.
* **Theme Controls**: Custom dark monochrome theme tokens.

---

## 13. System Administration & RBAC Portal

Dedicated administrative portal under `/admin` accessible to users with `ADMIN` or `SUPERADMIN` roles:

* **Overview & Platform KPIs**: Total registered learners, 30-day active learners, platform-wide study volume, and popular subject trends.
* **User Management Table**: Full search, filtering, status modification (`ACTIVE`, `SUSPENDED`, `BANNED`), role updates, and instant session terminations.
* **Administrator Directory**: Superadmin management of admin privileges and role delegations.

---

## 14. Infrastructure Diagnostics & Telemetry

Real-time system telemetry accessible via `/admin/telemetry` and `/system/diagnostics`:

* **PostgreSQL Health**: Real-time connection status and query latency in milliseconds.
* **Redis Health**: Connection status, ping latency, and memory consumption.
* **Node.js Process Metrics**: Process uptime, RSS memory, Total Heap, and Used Heap in MB.

---

## 15. Security Audit Logging

Immutable log of all administrative actions:

* Captures actor ID, target user ID, IP address, user agent, action timestamp, and JSON diff metadata.
* Comprehensive audit trail for role modifications, user suspensions, session revocations, and configuration changes.

---

## 16. Mobile Companion Application

React Native / Expo mobile app designed for fast capture:

* **Home Dashboard**: View today's total focus time, active streak, and 1-tap "+ Log Learning" action.
* **Stopwatch Timer**: Full-screen focus timer with haptic feedback and auto-logging.
* **Offline Readiness**: Local caching via AsyncStorage ensures fast load times even on slow connections.
