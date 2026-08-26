# Progress Tracker

## Current Phase

- **Phase 03 — Core Learning & Task Tracking** (Planning & Specification)

## Current Goal

- Finalize specification and implementation for Subject management, Manual learning session logging, Interactive live timer (start/pause/resume/save), Task management, and learning session association.

## Completed

- Defined the product as **DevLearn**, a personal learning-progress SaaS application.
- Defined the primary audience as students, junior/mid developers, and self-learners.
- Defined the core product problem: learning time and progress are scattered and difficult to measure.
- Defined the core loop: plan → learn → record → complete → contribute → analyze.
- Separated tasks from learning sessions (tasks = plans, sessions = actual learning activity).
- Defined learning sessions as the source for actual learning duration and contribution graph activity.
- Made subject, topic, resource, course, goal, and notes dynamic/optional instead of hard-coded.
- Defined the user journey: marketing website → register/login → authenticated portal → learning tracking.
- Defined a dark, monochrome UI direction (no gradients, no glassmorphism, black/gray/white tonal hierarchy).
- Selected the core stack: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Motion, TanStack Query, React Hook Form, Zod, Recharts, Lucide React, Express.js, PostgreSQL, Prisma, Redis, Docker, Nodemailer.
- Decided to use a modular Express.js monolith (`apps/api`) rather than NestJS or microservices.
- Decided PostgreSQL is the source of truth and Redis is cache/temporary infrastructure.
- Decided authentication is custom email/password with secure HTTP-only sessions.
- Decided Google login, Clerk, Liveblocks, YouTube API, and GitHub API are out of scope for MVP.
- Defined the learning contribution graph as the product's own GitHub-style activity visualization based on learning minutes.
- Defined the MVP goal of remaining functional without paid third-party APIs/services.
- Completed specification for **Phase 01 — Design System & Project Foundation** (`featrues/01-system-design.md`).
- **Executed & Verified Phase 01**:
  - Initialized monorepo workspace (`apps/web`, `apps/api`, `packages/ui`, `packages/config`, `packages/types`, `infrastructure/docker`).
  - Implemented Docker Compose setup with PostgreSQL 16 and Redis 7.
  - Implemented Express.js API foundation with Helmet, CORS, cookie-parser, structured Pino logging, centralized error handler, and `/health` monitoring endpoint.
  - Implemented Next.js 15 App Router web foundation with custom monochrome CSS variables (`--bg-base: #0D0D0D`, `--bg-surface: #151515`, `--border-default: #2A2A2A`, grayscale contribution levels 0–4).
  - Built reusable shadcn/ui primitives (`Button`, `Card`, `Badge`) and layout shell (`Sidebar`, `Header`, `MarketingLayout`, `PortalLayout`, `AuthLayout`).
  - Synchronized Prisma client with PostgreSQL and pushed repository to GitHub.
- Completed specification for **Phase 02 — Product Data Model & Authentication** (`featrues/02-data-model-and-auth.md`).
- **Executed & Verified Phase 02**:
  - Defined full Prisma relational database schema (12 models: `User`, `UserSession`, `VerificationToken`, `PasswordResetToken`, `UserSettings`, `Subject`, `Task`, `Goal`, `Resource`, `Course`, `LearningSession`, `ContributionDay`).
  - Implemented custom authentication backend with **Argon2id** password hashing and secure HTTP-only server-side session management.
  - Implemented authentication endpoints (`/api/auth/register`, `/login`, `/logout`, `/me`, `/verify-email`, `/forgot-password`, `/reset-password`).
  - Implemented authentication middleware (`requireAuth`) enforcing session validation.
  - Implemented frontend Auth Provider, React Query integration, and full auth pages (`/login`, `/register`, `/forgot-password`, `/reset-password`).
  - Built initial authenticated dashboard shell at `/dashboard`.
  - Passed all backend unit and integration tests with Vitest (9/9 passed).
  - Passed Next.js production build with static route generation.

## In Progress

- Specification for **Phase 03 (Core Learning & Task Tracking)**.

## Next Up

1. **Phase 03 Specification & Execution**:
   - Subjects Module (CRUD, user-scoped, dynamic categories).
   - Learning Sessions Module (Manual entry, validation, topic, notes, resource URL).
   - Timer Feature (Client/server timer flow: start, pause, resume, finish).
   - Tasks Module (Create, mark complete, associate with sessions).
2. **Subsequent Phases**:
   - Phase 04: Contributions, Streaks & Analytics (Grayscale contribution graph, stats, charts).
   - Phase 05: Marketing Website & Portal Polish.


## Open Questions

These are intentionally tracked and to be finalized in their respective implementation phase specifications:

1. **Contribution thresholds** — exact daily learning-minute thresholds for levels 0–4 (Phase 04).
2. **Streak rule** — exact criteria for what qualifies as an active learning day (Phase 04).
3. **Timer behavior** — exact client/server rules for pause, resume, tab/browser close, and session editing (Phase 03).
4. **Timezone handling** — user timezone storage and rules for assigning sessions to local calendar days (Phase 02/03).
5. **Contribution persistence** — whether daily contribution levels are computed dynamically on read or materialized in PostgreSQL (Phase 02/04).
6. **Password hashing algorithm** — final selection between Argon2id and Scrypt (Phase 02).
7. **Email verification access policy** — whether unverified users can enter the portal with limited access or must verify first (Phase 02).
8. **SMTP delivery provider** — service/account selection for production deployment (Phase 02).
9. **Course hierarchy depth** — exact depth of optional course / module / lesson nesting (Phase 02/03).
10. **Resource metadata fetching** — whether MVP stores URL + user title only or adds auto-fetch in future iterations (Phase 03).
11. **Deployment target** — production hosting, database hosting, and CI/CD strategy (Phase 05/Deployment).

## Architecture Decisions

### Modular monolith

Use one Express.js backend organized by domain modules. Microservices are unnecessary for the current product size and would add operational complexity.

### PostgreSQL as source of truth

Learning sessions, tasks, subjects, resources, goals, and user data must persist in PostgreSQL.

### Redis as cache, not primary storage

Redis is used selectively for cacheable read results, rate limiting, temporary state, and BullMQ queues if jobs are introduced.

### Custom authentication

Use email/password auth, secure HTTP-only sessions, email verification, and password reset. Avoid Clerk and Google OAuth for MVP to keep the project controlled and to demonstrate backend security work.

### No required external API

The core product must work without YouTube or GitHub APIs. A YouTube link can simply be stored as an optional resource. The contribution calendar is generated from internal learning activity.

### Dynamic domain model

Do not hard-code learning categories such as DSA, Redis, SQL, or DevOps. Users create their own subjects and learning structure.

### Minimal design system

Use a dark monochrome visual language with black/gray/white tonal hierarchy instead of multiple bright accent colors.

## Session Notes

- Completed specification for Phase 01 (`featrues/01-system-design.md`).
- Confirmed product brand name as DevLearn.
- Ready to initialize project foundation according to Phase 01 specification.
- Context files must remain synchronized as decisions evolve.

