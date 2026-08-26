# Progress Tracker

## Current Phase

- **Phase 01 — Design System & Project Foundation** (Specification ready; moving to project foundation initialization)

## Current Goal

- Initialize the production-ready repository structure, set up Docker local infrastructure (PostgreSQL & Redis), configure the Next.js frontend with the monochrome design system / shadcn/ui tokens, and set up the Express.js API backend foundation according to `01-system-design.md`.

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
- Defined monorepo layout (`apps/web`, `apps/api`, `packages/ui`, `packages/config`, `packages/types`, `infrastructure/docker`).
- Defined design system tokens (`--bg-base`, `--bg-surface`, `--bg-elevated`, `--text-*`, `--border-*`, contribution levels 0–4).

## In Progress

- Phase 01 implementation & verification (Repository setup, Docker Compose, Next.js web shell, Express API skeleton, design system foundation).
- Specification for Phase 02 (Product Data Model & Authentication).

## Next Up

1. **Phase 01 Execution**:
   - Initialize monorepo structure (`apps/web`, `apps/api`, packages, infrastructure).
   - Configure Docker Compose for local PostgreSQL and Redis.
   - Configure Express.js API with security middleware (Helmet, CORS, cookie-parser), logging (Pino), and health endpoint.
   - Configure Next.js frontend with Tailwind CSS, design tokens, and base shadcn/ui setup.
   - Verify Phase 01 completion criteria and checklist.
2. **Phase 02 Specification & Execution**:
   - Finalize domain and data model (User, Session, Subject, Task, Goal, Resource, Course, Contribution).
   - Define PostgreSQL Prisma schema and migrations.
   - Define authentication and session management (Argon2id/Scrypt, HTTP-only cookies, verification, password reset).
   - Define API contracts and validation schemas.
3. **Subsequent Phases**:
   - Phase 03: Core Learning & Task Tracking (Subjects, Sessions, Timer, Tasks).
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

