# DevLearn — System Architecture & Design

This document details the architectural blueprint, data flow, monorepo structure, storage design, authentication model, and security invariants of the DevLearn platform.

---

## 1. Monorepo Organization

DevLearn is organized as an **npm workspaces monorepo** with strict boundary separation between frontend web, mobile client, backend API server, and shared packages.

```text
DevLearn/
├── apps/
│   ├── api/                      # Node.js + Express.js Modular Monolith REST API
│   │   ├── prisma/               # Prisma relational schema, migrations & seed scripts
│   │   ├── src/                  # App server, middleware, config, and 16 domain modules
│   │   └── tests/                # Unit and integration test suites (Vitest + Supertest)
│   ├── web/                      # Next.js 15 App Router Web Application
│   │   ├── app/                  # Route groups: (marketing), (auth), (portal), (admin)
│   │   ├── components/           # UI primitives, analytics charts, forms & layouts
│   │   └── providers/            # React Query, Auth, and Toast notification providers
│   └── mobile/                   # React Native + Expo Companion App
│       ├── src/api/              # Shared Axios client with token auth & retry logic
│       ├── src/navigation/       # React Navigation Root & Bottom Tab navigators
│       ├── src/screens/          # Dashboard, Timer, History, Progress, Settings screens
│       └── src/context/          # Auth & offline cache state context
├── packages/
│   ├── config/                   # Shared TypeScript base configs & linting presets
│   ├── types/                    # Shared TypeScript DTOs, API response types & enums
│   └── ui/                       # Design tokens, palette constants & theme definitions
├── infrastructure/
│   └── docker/                   # Docker Compose manifests for PostgreSQL 16 & Redis 7
├── docs/                         # Comprehensive engineering and product documentation
├── devlearn-context/             # Product specifications & architectural invariants
├── docker-compose.prod.yml       # Production multi-container deployment configuration
├── package.json                  # Root workspace configuration and scripts
└── .env.example                  # Environment configuration template
```

---

## 2. High-Level Architecture Diagram

```text
┌────────────────────────────────┐         ┌────────────────────────────────┐
│       Next.js 15 Web App       │         │    React Native Mobile App     │
│   (Marketing, Portal, Admin)   │         │    (Timer, Quick-Log, View)    │
└────────────────┬───────────────┘         └────────────────┬───────────────┘
                 │ HTTP / REST                              │ HTTP / REST
                 │ (Cookie Auth)                            │ (Bearer / Cookie)
                 ▼                                          ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                        DevLearn Express.js API                            │
│                        (Modular Monolith Server)                          │
├───────────────────────────────────────────────────────────────────────────┤
│ Middleware: Helmet, CORS, Rate-Limiting, RequestId, CookieParser, Pino   │
├───────────────────────────────────────────────────────────────────────────┤
│ Domain Modules:                                                           │
│ ├── Auth & Sessions          ├── Learning Sessions      ├── Export        │
│ ├── Users & Profiles         ├── Tasks & Plans          ├── Settings      │
│ ├── Dynamic Subjects         ├── Courses & Tracks       ├── Admin Portal  │
│ ├── Goals & Milestones       ├── Resources & URLs       ├── Diagnostics   │
│ └── Contributions & Heatmap  ├── Analytics & Streaks    └── Email (SMTP)  │
└─────────────────────┬───────────────────────────────────────┬─────────────┘
                      │                                       │
         Prisma ORM   │                          ioredis      │ Cache-Aside
                      ▼                                       ▼
       ┌──────────────────────────────┐        ┌────────────────────────────┐
       │     PostgreSQL 16 Engine     │        │       Redis 7 Cache        │
       │   (Source of Truth DB)       │        │  (Summaries, Rate Limits,  │
       │                              │        │   Session Invalidations)   │
       └──────────────────────────────┘        └────────────────────────────┘
```

---

## 3. Core Architectural Principles

1. **Modular Monolith**:
   - The backend is organized into self-contained domain modules (`src/modules/*`).
   - Each module encapsulates its own routes, controllers, services, validation schemas, and types.
   - Avoids the operational overhead and network latency of premature microservices while maintaining clean domain boundaries.

2. **Authoritative Source of Truth**:
   - **PostgreSQL is the single authoritative source of persistent data.**
   - All relational entities (Users, Sessions, Subjects, Tasks, Courses, Goals, Learning Sessions, Contribution Days, Audit Logs) live in PostgreSQL.

3. **Cache-Aside Redis Layer**:
   - Redis is used strictly for read acceleration (e.g., cached analytics summaries, precomputed 52-week calendar payloads), rate-limiting counters, and session invalidation caches.
   - **Critical Invariant**: A Redis cache miss or temporary Redis downtime *must never* compromise application correctness. The system falls back cleanly to PostgreSQL queries.

4. **Private-by-Default Multi-Tenancy**:
   - Every domain entity (Subject, Task, Session, Goal, Course, Resource) includes a mandatory `userId` foreign key.
   - All service queries explicitly scope database operations with `{ where: { userId, ... } }`. User A can never view or mutate User B's learning data.

5. **Shared Type Contracts**:
   - `@devlearn/types` acts as the single contract package consumed by the Web client, Mobile client, and API server, ensuring end-to-end type safety.

---

## 4. Backend Modular Monolith Design

Each module under `apps/api/src/modules/` follows a standardized structure:

```text
modules/learning/
├── learning.routes.ts       # Express router definition & route guards
├── learning.controller.ts   # HTTP request parsing, status codes & DTO responses
├── learning.service.ts      # Core business logic, transactions & cache eviction
├── learning.schema.ts       # Zod input validation schemas
└── learning.types.ts        # Module-specific interfaces (if not in @devlearn/types)
```

### Module Registry (`apps/api/src/app.ts`)

| Module | Route Prefix | Purpose |
|---|---|---|
| **Health** | `/health` | Liveness & readiness probes for container orchestration |
| **Diagnostics** | `/system`, `/api/v1/system` | Deep system metrics, memory, DB latency, Redis status |
| **Auth** | `/auth`, `/api/v1/auth` | User registration, login, logout, password reset, session verification |
| **Users** | `/users`, `/api/v1/users` | User profile retrieval and account preferences |
| **Subjects** | `/subjects`, `/api/v1/subjects` | Dynamic, user-defined taxonomy & color tokens |
| **Tasks** | `/tasks`, `/api/v1/tasks` | Planned study items and completion state |
| **Courses** | `/courses`, `/api/v1/courses` | Structured curriculums, platforms, and completion metrics |
| **Learning** | `/learning-sessions`, `/api/v1/learning-sessions` | Core focus sessions, timer logs, and note attachments |
| **Resources** | `/resources`, `/api/v1/resources` | Bookmark library for documentation, repos, and video links |
| **Contributions** | `/contributions`, `/api/v1/contributions` | 52-week grayscale activity heatmap calculations |
| **Analytics** | `/analytics`, `/api/v1/analytics` | Study volume, streak engine with grace period, subject breakdown |
| **Achievements** | `/achievements`, `/api/v1/achievements` | Milestone badge evaluation engine |
| **Goals** | `/goals`, `/api/v1/goals` | Hourly study targets and progress tracking |
| **Export** | `/export`, `/api/v1/export` | 1-click JSON and CSV data exports |
| **Settings** | `/settings`, `/api/v1/settings` | Timezone, daily goal targets, and theme preferences |
| **Admin** | `/admin`, `/api/v1/admin` | Platform oversight, user moderation, telemetry, audit logs |

---

## 5. Persistence, Caching & Data Flow

### Read Flow (Cache-Aside)
```text
Client Request (GET /api/v1/analytics/summary)
  │
  ▼
API Middleware (Authentication & Rate Limiting)
  │
  ▼
Analytics Service
  │
  ├── 1. Check Redis Cache: `devlearn:analytics:summary:${userId}`
  │      ├── [CACHE HIT] ──> Return cached JSON response
  │      └── [CACHE MISS] ──> Fall through
  │
  ├── 2. Query PostgreSQL via Prisma Client (Aggregations, Durations, Streaks)
  │
  ├── 3. Write computed result to Redis with TTL (e.g., 300 seconds)
  │
  ▼
Return Response to Client
```

### Write Flow & Cache Invalidation
```text
Client Mutation (POST /api/v1/learning-sessions)
  │
  ▼
API Middleware (Authentication & Zod Validation)
  │
  ▼
Learning Service
  │
  ├── 1. Execute DB Transaction in PostgreSQL:
  │      ├── Insert `LearningSession` record
  │      └── Upsert `ContributionDay` record (aggregate minutes & calculate level 0-4)
  │
  ├── 2. Invalidate Affected Redis Caches:
  │      ├── `devlearn:analytics:summary:${userId}`
  │      ├── `devlearn:contributions:calendar:${userId}`
  │      └── `devlearn:dashboard:${userId}`
  │
  ▼
Return 201 Created with Created LearningSession DTO
```

---

## 6. Authentication, RBAC & Security Architecture

### Authentication Mechanism
* **Password Hashing**: Securely hashed with `argon2id` using cryptographic salt.
* **Session Management**:
  * Server-side `UserSession` records in PostgreSQL.
  * Signed, HTTP-only cookies (`devlearn_session`) with `SameSite=Lax` (or `None` in cross-origin setups with `Secure`).
  * Instant session revocation support (terminating user sessions on password reset or administrative suspension).
* **Cross-Origin Configuration**: Dynamic CORS middleware allowing web origins and native mobile clients without leaking permissive wildcards in production.

### Role-Based Access Control (RBAC)

```text
┌────────────────────────────────────────────────────────┐
│                      SUPERADMIN                        │
│  - All platform operations                             │
│  - Administrator role promotion & demotion             │
│  - System settings modification & maintenance broadcast│
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                        ADMIN                           │
│  - User directory & moderation (Suspend, Ban, Restore) │
│  - System telemetry & live diagnostics                 │
│  - Security audit log inspection                       │
│  - Platform-wide analytics                             │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                        USER                            │
│  - Private learner portal                              │
│  - Personal sessions, subjects, tasks, goals, export   │
└────────────────────────────────────────────────────────┘
```

### Security Audit Logging
Every administrative mutation (`PATCH /admin/users/:id`, role upgrades, session revocations) triggers an immutable `AuditLog` record containing:
* `actorId`: Admin who executed the action
* `targetId`: User affected by the action
* `action`: Standardized audit key (`USER_SUSPENDED`, `USER_ROLE_UPDATED`, etc.)
* `ipAddress` & `userAgent`: Client network signature
* `metadata`: JSON diff detailing previous and updated attributes

---

## 7. Frontend & Mobile Architectures

### Next.js 15 Web Architecture
* **App Router Layouts**:
  * `(marketing)`: Public landing pages, feature overviews, live interactive demo components.
  * `(auth)`: Login, registration, password recovery pages.
  * `(portal)`: Authenticated learner dashboard, sidebar navigation, timer, tasks, heatmap, analytics.
  * `(admin)`: Isolated administrative portal with role guards, high-density data tables, and telemetry charts.
* **State & Data Synchronization**:
  * TanStack Query (React Query) handles automated background re-fetching, optimistic updates, and cache invalidation.
  * React Hook Form with Zod schemas ensures client-side validation mirroring API constraints.

### React Native / Expo Mobile Architecture
* **Companion Philosophy**: Designed for low-friction, 3-to-5 second study logging and stopwatch timing while away from the desk.
* **Zero Backend Duplication**: Mobile consumes the identical Express.js REST API endpoints without separate mobile logic.
* **Offline Resilience**: Local persistence with `@react-native-async-storage/async-storage` for credentials and offline cache viewing.
