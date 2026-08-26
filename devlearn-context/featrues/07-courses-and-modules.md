# DevLearn — 07 Interactive Courses & Structured Tracks Specification

## Purpose

Define the specification for structured course tracking, platform catalogs, module completion, and direct session association.

---

## 1. Domain Rules & Responsibilities

1. **Course Model**:
   - Represents external courses, video playlists, textbook roadmaps, or structured tracks (e.g., "MIT 6.824 Distributed Systems", "NeetCode 150", "Crafting Interpreters").
   - Fields: `title`, `platform` (e.g., "YouTube", "Coursera", "Book", "Self-Hosted"), `url`, `totalDurationMinutes`, `completedDurationMinutes`, `isCompleted`, `subjectId`, `userId`.
   - Dynamic progress updates when learning sessions reference the course.

2. **API Endpoints (`/api/courses`)**:
   - `GET /api/courses` — List user courses with progress percentages and subject metadata.
   - `POST /api/courses` — Create a course track.
   - `PUT /api/courses/:id` — Update course details.
   - `DELETE /api/courses/:id` — Delete a course.

3. **Frontend Views (`apps/web`)**:
   - Dedicated `/courses` portal page with course progress cards, platform badges, and direct "Start Focus on this Course" action that pre-selects the course in the timer/session logger.
