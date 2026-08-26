# AI Workflow Rules

## Purpose

This repository is developed as a spec-driven DevLearn SaaS project. The context files are the source of truth for product scope, architecture, UI rules, coding standards, and implementation progress.

Do not invent product behavior that is not defined in the context files. When a requirement is missing or ambiguous, record it in `progress-tracker.md` before implementation.

## Core Development Approach

- Build incrementally in small, verifiable feature units.
- Implement one product capability at a time from the approved context.
- Prefer reusable, dynamic components and modules over feature-specific duplicates.
- Fix root causes instead of layering patches or workarounds.
- Keep frontend, backend, database, authentication, caching, and external integrations clearly separated.
- Keep the MVP simple. Do not add services, APIs, libraries, or infrastructure without a concrete product or technical need.
- Avoid premature microservices. The backend is a modular Express.js application.
- PostgreSQL is the source of truth. Redis is a cache/temporary system, not the primary database.

## Product Principles

1. **Simple by default, detailed when needed.** A user must be able to record a basic learning session with only the essential fields.
2. **Dynamic, not hard-coded.** Subjects, topics, goals, courses, resources, and tasks are user-defined. Examples such as DSA, Redis, SQL, and DevOps must never become hard-coded product entities.
3. **Learning is separate from planning.** Tasks describe intended work; learning sessions describe actual learning activity.
4. **Actual learning time is the source for contribution activity.** Completed tasks alone do not determine learning time.
5. **External integrations are optional.** YouTube and GitHub APIs are not required for the MVP.
6. **Private by default.** User learning history is private unless an explicit sharing feature is later approved.
7. **No unnecessary complexity.** Do not introduce Clerk, Liveblocks, Google OAuth, Stripe, YouTube API, GitHub API, or other third-party services unless the product requirements later justify them.

## Scoping Rules

- Work on one feature unit at a time.
- Keep each implementation unit end-to-end and verifiable.
- Do not combine unrelated system boundaries in one implementation step.
- Prefer the smallest implementation that satisfies the defined requirement.

## Split Work When

Split an implementation step when it combines multiple independent concerns such as:

- UI changes and unrelated infrastructure changes.
- Authentication changes and unrelated learning analytics changes.
- Multiple unrelated API modules.
- A foreground request and long-running/background work.
- Behavior that is not yet clearly defined in the context files.

If a change cannot be verified end-to-end within its defined scope, the scope is too broad and must be split.

## Requirements Handling

- If a requirement is already defined in these context files, follow it exactly.
- If a requirement is ambiguous, document the ambiguity in `progress-tracker.md`.
- If a requirement is missing, add it to `Open Questions` instead of guessing.
- If a later product decision changes architecture, update `architecture.md` before implementing the change.
- Keep all context files synchronized with meaningful implementation decisions.

## Reuse and Duplication Rules

- Reuse existing components, services, utilities, schemas, and repository patterns.
- Do not create separate copies of equivalent UI for different subjects, courses, or analytics views.
- Prefer generic components driven by typed data.
- Do not introduce a second abstraction when an existing abstraction can be extended cleanly.
- Do not keep obsolete code after replacing an implementation.
- Do not add placeholder code that is not needed by the current feature.

## Protected Areas

Do not modify third-party library internals.

Do not manually edit generated dependency internals or generated artifacts unless the project explicitly requires it.

For shadcn/ui components, use the approved component workflow and keep reusable primitives centralized.

## Documentation Sync Rules

Update the relevant context file whenever implementation changes affect:

- Product scope.
- User flows.
- System architecture or boundaries.
- Data/storage decisions.
- Authentication or authorization.
- Caching/background jobs.
- UI design tokens or layout rules.
- Code standards.

## Verification Before Moving to the Next Unit

1. The current feature works end-to-end within its defined scope.
2. No invariant in `architecture.md` was violated.
3. `progress-tracker.md` reflects the current state.
4. TypeScript checks successfully.
5. Relevant tests pass.
6. The production build passes.
7. No unnecessary duplicate or dead code was introduced.
8. UI still follows `ui-context.md`.

## Default Feature Sequence

1. Product and data-model decisions.
2. Authentication foundation.
3. Core learning/session tracking.
4. Tasks and completion behavior.
5. Daily contribution calculation and history.
6. Resources and optional links.
7. Analytics and dashboard.
8. Redis caching where justified.
9. Optional background jobs where justified.
10. Optional external integrations only after the core product is stable.

## Definition of Done

A feature is not complete merely because it renders. It must have:

- Defined behavior.
- Correct validation.
- Authentication/ownership enforcement where applicable.
- Correct database persistence.
- Correct error handling.
- Reusable UI.
- Appropriate loading/empty/error states.
- Relevant tests.
- Updated documentation.
