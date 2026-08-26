# Architecture Context

## Product Architecture

The product is a multi-user learning-progress SaaS built as a modular monolith.

The core architecture is intentionally simple:

```text
Browser
  ↓
Next.js frontend
  ↓ HTTPS / REST
Express.js API
  ↓
Application modules
  ↓
Prisma
  ↓
PostgreSQL

Express.js ↔ Redis (cache / temporary state / rate limiting)
Express.js → BullMQ/Redis (only when background jobs are justified)
```

PostgreSQL is the authoritative source of application data. Redis is not a primary datastore.

## Stack

| Layer | Technology | Role |
|---|---|---|
| Web framework | Next.js 16 | Marketing website and authenticated user portal |
| Language | TypeScript | Shared type-safe development |
| Styling | Tailwind CSS v4 | Utility styling and design-token implementation |
| UI | shadcn/ui | Reusable accessible UI primitives |
| Motion | Motion | Small, purposeful UI transitions |
| Server state | TanStack Query | API data fetching, caching, mutations, invalidation |
| Forms | React Hook Form | Form state and submission handling |
| Validation | Zod | Frontend/domain validation where appropriate |
| Charts | Recharts | Learning analytics visualizations |
| Backend runtime | Node.js | API runtime |
| Backend framework | Express.js | REST API and application server |
| Database | PostgreSQL | Source of truth for persistent data |
| ORM | Prisma | Type-safe relational data access |
| Cache | Redis | Read caching, rate limiting, temporary state |
| Jobs | BullMQ + Redis | Background jobs only when required |
| Authentication | Custom email/password auth | User identity and sessions |
| Password hashing | Argon2id or Scrypt | Secure password storage; final choice is an open technical decision |
| Email | Nodemailer + SMTP | Verification and password-reset email delivery |
| Containerization | Docker | Consistent local/deployment environments |

## Architecture Principles

1. Use a modular monolith. Do not split into microservices unless a concrete scaling or organizational need appears.
2. Keep the API independent from frontend presentation logic.
3. Keep business rules in backend services/domain modules rather than route handlers.
4. Keep database access behind clear repositories/data-access functions where useful; do not scatter raw Prisma calls across unrelated modules.
5. Use typed DTOs/schemas for API boundaries.
6. Keep external integrations isolated in their own modules.
7. Do not make YouTube or GitHub integrations part of the core learning model.
8. Do not make Redis a required dependency for correctness. The application must remain logically correct if a cache entry is missing.

## Frontend Boundary

The Next.js application owns:

- Public marketing website.
- Login/register screens.
- Authenticated user portal shell.
- Dashboard presentation.
- Learning/task/resource forms.
- Client-side interaction state.
- Server-state fetching through the API.
- Charts and contribution visualization.
- Settings UI.

The frontend does not own authoritative business data.

## Backend Boundary

The Express.js application owns:

- Authentication and session handling.
- Authorization and ownership checks.
- Request validation.
- Learning/session business logic.
- Task and goal logic.
- Resource/course logic.
- Contribution calculations.
- Analytics calculations.
- Cache access and invalidation.
- Background-job dispatch when required.
- Integration adapters when integrations are later enabled.

## Suggested Backend Modules

```text
backend/src/
├── config/
├── middleware/
├── database/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── subjects/
│   ├── goals/
│   ├── tasks/
│   ├── learning/
│   ├── resources/
│   ├── courses/
│   ├── analytics/
│   ├── contributions/
│   └── settings/
├── jobs/
├── utils/
├── app.ts
└── server.ts
```

Module structure should remain simple. A typical module can contain routes/controller, service, validation schema, repository/data access, and types as the feature warrants.

## Storage Model

### PostgreSQL

PostgreSQL stores persistent product state, including:

- Users and authentication/session records.
- User-defined subjects.
- Goals.
- Tasks and completion state.
- Learning sessions and durations.
- Optional topics/notes.
- Resources and optional URLs.
- Courses/modules/lessons when the user uses course structure.
- Derived or stored contribution records when needed for performance/auditability.
- User settings/preferences.

### Redis

Redis stores temporary or cacheable data such as:

- Dashboard cache.
- Analytics cache.
- Frequently requested lists.
- Rate-limit counters.
- Temporary job state.
- BullMQ queues when background processing is introduced.

Redis must never be the only copy of critical learning data.

### File/blob storage

Not required for the MVP. Do not add file storage until the product actually supports user-uploaded files or other large media.

## Read/Caching Pattern

Use cache-aside selectively for read-heavy endpoints.

```text
GET request
  ↓
Express service
  ↓
Redis
  ├─ HIT → return cached result
  └─ MISS → PostgreSQL → cache result → return
```

Do not route every request through Redis. Normal writes go to PostgreSQL first.

## Write/Cache Invalidation Pattern

```text
POST/PUT/DELETE
  ↓
Validate + authorize
  ↓
PostgreSQL write
  ↓
Invalidate/update affected cache keys
  ↓
Return response
```

Learning-session writes should invalidate or refresh affected dashboard, history, contribution, and analytics caches as appropriate.

## Core Domain Relationships

```text
User
 ├── Subjects
 ├── Goals
 ├── Tasks
 ├── Learning Sessions
 ├── Resources
 ├── Courses
 └── Settings

Subject ──< Learning Sessions
Task ──< Learning Sessions (optional relationship)
Course ──< Resources (optional relationship)
Learning Session ──> Resource (optional relationship)
Learning Sessions ──> Daily Contribution calculation
```

## Domain Rules

### Learning Session

Minimum information required:

- Subject
- Duration
- Date/time

Optional:

- Topic
- What was learned
- Notes
- Resource
- Course
- Tags/metadata if later approved

A learning session can exist without a task.

### Task

A task represents intended work. Task completion must not be treated as equivalent to learning duration.

### Goal

Goals are optional. A user can use the system without setting goals.

### Resource

A resource is optional. Supported resource concepts should remain generic enough for URLs such as YouTube, documentation, articles, books, GitHub repositories, and other links. YouTube API metadata is not required for MVP.

### Contribution

Contribution activity is derived from actual learning activity, primarily total learning minutes for the day. The exact threshold levels are not yet finalized.

## Authentication and Access Model

- Users register with email and password.
- Email verification is required before the account is considered fully verified, subject to the final auth flow decision.
- Password reset is supported.
- Sessions are managed with secure, HTTP-only cookies.
- Authentication state is handled by the custom Express backend.
- No Clerk dependency is required.
- Google OAuth is not required for the MVP.
- Every user-owned resource must be scoped to the authenticated user.
- Users cannot read or mutate another user's private learning data.

## SaaS Boundary

The application is multi-user from the beginning, but billing is not part of the MVP.

The data model must keep user ownership explicit so future plans/entitlements can be introduced without redesigning all core tables.

## External Integrations

### YouTube

Not required for MVP. The user may optionally store a YouTube URL as a resource. A future YouTube API integration can automatically retrieve title/duration/thumbnail if that feature is later approved.

### GitHub

Not required for MVP. The product's contribution calendar is based on learning activity, not GitHub activity. A future GitHub integration may be added as a separate contribution source without replacing learning contributions.

### Liveblocks

Not required. The current product is primarily personal tracking and has no collaborative editing requirement.

## Key Invariants

1. PostgreSQL is the source of truth for persistent learning data.
2. Redis cache misses must never cause incorrect application behavior.
3. Every private record is scoped to a user.
4. Authentication and authorization happen before protected mutations.
5. Request handlers must not perform long-running background work directly.
6. Tasks and learning sessions remain separate concepts.
7. User-defined subjects and resources are dynamic; product examples must not become hard-coded entities.
8. Optional fields must remain optional in both API validation and UI behavior.
9. External integrations must not be required for the core learning workflow.
10. No feature should require a paid third-party service for the MVP to function.
