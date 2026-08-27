# Progress Tracker

## Current Phase

- **Product definition / architecture planning**

## Current Goal

- Finalize the product model, user flow, UX structure, architecture, and implementation rules before writing application code.

## Completed

- Defined the product as a personal learning-progress tracker that can evolve into a SaaS.
- Defined the primary audience as students, developers, and self-learners.
- Defined the core product problem: learning time and progress are scattered and difficult to measure.
- Defined the core loop: plan → learn → record → complete → contribute → analyze.
- Separated tasks from learning sessions.
- Defined learning sessions as the source for actual learning duration.
- Made subject, topic, resource, course, goal, and notes capabilities dynamic/optional instead of hard-coded.
- Defined the user journey: marketing website → register/login → authenticated portal → learning tracking.
- Defined a dark, monochrome UI direction.
- Selected the core stack: Next.js, TypeScript, Tailwind CSS, shadcn/ui, Motion, TanStack Query, React Hook Form, Recharts, Express.js, PostgreSQL, Prisma, Redis, Docker.
- Decided to use a modular Express.js monolith rather than NestJS or microservices.
- Decided PostgreSQL is the source of truth and Redis is cache/temporary infrastructure.
- Decided authentication is custom email/password with secure HTTP-only sessions.
- Decided Google login and Clerk are not required for MVP.
- Decided Liveblocks is not required because the product is not collaborative.
- Decided YouTube API and GitHub API are not required for MVP.
- Defined the learning contribution graph as the product's own GitHub-style activity visualization based on learning minutes.
- Defined the MVP goal of remaining functional without paid third-party APIs/services.

## In Progress

- Final product specification.
- Final data model and relationship details.
- Final screen-by-screen user flow.
- Final contribution/streak rules.
- Final authentication/security details.

## Next Up

1. Finalize domain/data model.
2. Define PostgreSQL tables and relationships.
3. Define API contracts.
4. Define complete frontend screen map.
5. Define onboarding flow.
6. Define contribution and streak calculation rules.
7. Define authentication/session/email flows.
8. Only then begin implementation.

## Open Questions

These are intentionally unresolved and must be decided before implementing the affected feature:

1. **Product name** — final brand/product name is not yet selected.
2. **Contribution thresholds** — exact daily learning-minute thresholds for levels 0–4 are not finalized.
3. **Streak rule** — exactly what counts as a learning day and whether there is a minimum duration are not finalized.
4. **Timer behavior** — exact behavior for pause, resume, browser close, abandoned timers, and editing completed timer sessions is not finalized.
5. **Timezone** — user timezone storage and the rules for assigning sessions to calendar days need to be finalized.
6. **Contribution persistence** — decide whether contribution levels are calculated entirely from sessions on read or stored/derived for faster history queries.
7. **Authentication algorithm** — choose between Argon2id and Scrypt before implementation.
8. **Email verification policy** — decide whether unverified accounts can enter the portal with limited access or must verify before access.
9. **SMTP provider** — Nodemailer is the library, but an SMTP delivery provider/account still needs to be selected for deployment.
10. **SaaS pricing** — no paid plan or billing is part of MVP; future monetization is undecided.
11. **Public sharing** — private-by-default is the rule, but whether future public profiles/sharing are needed is undecided.
12. **Course depth** — the exact optional course/module/lesson hierarchy needs a final product decision before database design.
13. **Resource metadata** — decide whether MVP stores only URL + user-entered title or also supports future fetched metadata.
14. **Analytics scope** — finalize the first set of dashboard/analytics metrics before implementation.
15. **Deployment target** — production hosting and database deployment strategy are not finalized.

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

- The product is still in planning; no application implementation has been approved yet.
- Context files must be updated whenever a product or architecture decision changes.
