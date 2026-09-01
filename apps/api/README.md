# @devlearn/api — Express.js Modular Monolith REST API

> **The central application server, business logic engine, and data persistence layer for DevLearn.**

`@devlearn/api` is a robust, type-safe REST API built with **Node.js**, **Express.js**, **PostgreSQL 16**, **Prisma ORM**, and **Redis 7**. It powers all client interactions (Web, Mobile, System Admin) with a clean modular monolith architecture, signed cookie session management, cryptographic hashing, and automated cache-aside invalidations.

---

## 🛠️ Technology Stack

* **Runtime & Language**: Node.js (`v20+` LTS), TypeScript 5, `tsx` for high-speed local dev
* **Web Framework**: [Express.js](https://expressjs.com/)
* **Database & ORM**: [PostgreSQL 16](https://www.postgresql.org/), [Prisma ORM](https://www.prisma.io/)
* **Cache & Memory Store**: [Redis 7](https://redis.io/) via `ioredis`
* **Security & Auth**:
  * Password Hashing: `argon2` (Argon2id algorithm)
  * Session Handling: Signed HTTP-only cookies with `cookie-parser`
  * Security Headers: `helmet`
  * Cross-Origin: Dynamic `cors` middleware supporting web and native mobile dev
  * Rate Limiting: `express-rate-limit`
* **Validation**: [Zod](https://zod.dev/)
* **Logging & Observability**: [Pino](https://getpino.io/) structured JSON logger + `pino-http`
* **Email Delivery**: [Nodemailer](https://nodemailer.com/) via standard SMTP
* **Test Runner**: [Vitest](https://vitest.dev/) + [Supertest](https://github.com/ladjs/supertest)

---

## 📁 Modular Monolith Architecture

The backend is partitioned into discrete domain modules under `src/modules/`:

```text
apps/api/src/
├── common/                       # Shared utilities, structured loggers, error classes
├── config/                       # Type-safe environment validation via Zod (env.ts)
├── database/                     # Singleton Prisma client & Redis client instances
├── health/                       # Container liveness & readiness check routes
├── middleware/                   # Request ID, Auth guards, Role guards, Error handler
├── modules/                      # Self-contained domain modules:
│   ├── achievements/             # Milestone badge dynamic evaluation engine
│   ├── admin/                    # Platform administration, telemetry, user moderation
│   ├── analytics/                # Study duration aggregations, trends, streak calculations
│   ├── auth/                     # Register, login, logout, verification, password reset
│   ├── contributions/            # 52-week grayscale activity calendar calculations
│   ├── courses/                  # Multi-part curriculum tracks and progress percentages
│   ├── diagnostics/              # Node process, DB latency, and Redis health telemetry
│   ├── email/                    # Transactional email service (Nodemailer)
│   ├── export/                   # Full data bundle export in JSON and CSV
│   ├── goals/                    # Hourly target setting and milestone tracking
│   ├── learning/                 # Core learning sessions, timer tracking, notes
│   ├── resources/                # Bookmarked documentation, repositories, and URLs
│   ├── settings/                 # User preferences (timezone, daily goals, theme)
│   ├── subjects/                 # Dynamic, user-defined taxonomy & color tokens
│   ├── tasks/                    # Intended learning tasks & completion state
│   └── users/                    # User profile data and account operations
├── app.ts                        # Express app factory, middleware & route mounting
└── server.ts                     # HTTP server startup & graceful shutdown handlers
```

---

## 🔑 Key Features & Subsystems

1. **Clean Route Versioning**:
   - Primary: `/api/v1/*`
   - Compatibility fallback: `/api/*` and `/*`

2. **Streak Engine with Grace Period**:
   - Evaluates consecutive active learning days ($\ge 1$ minute).
   - Timezone-aware midnight rollover calculations.
   - Built-in grace period: If active yesterday, streak remains valid today until end of day.

3. **Cache-Aside Invalidation**:
   - Heavy read endpoints (`/analytics/summary`, `/contributions/calendar`) are cached in Redis.
   - Any learning session mutation (`POST`, `PATCH`, `DELETE`) automatically evicts and refreshes affected user caches.

4. **Role-Based Access Control (RBAC)**:
   - Three tiers: `USER`, `ADMIN`, `SUPERADMIN`.
   - Administrative endpoints under `/admin/*` protected by `requireAuth` + `requireRole`.
   - Every administrative modification generates an immutable `AuditLog` entry.

---

## ⚙️ Environment Variables

Create `.env` in `apps/api/` or at the repository root:

```env
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000
WEB_ORIGIN=http://localhost:3000

DATABASE_URL=postgresql://devlearn:devlearn_dev_password@127.0.0.1:5433/devlearn_db?schema=public
REDIS_URL=redis://127.0.0.1:6379

SESSION_SECRET=devlearn_super_secure_session_secret_min_32_chars_long

# SMTP Configuration (Optional for local testing)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASSWORD=password
SMTP_FROM="DevLearn <notifications@devlearn.io>"
```

---

## 🚀 Available Scripts

From the repository root:
```bash
# Start backend API in watch mode
npm run dev:api

# Run database schema migrations
npm run prisma:push --workspace=apps/api

# Generate Prisma Client
npm run prisma:generate

# Seed database with initial test data & admin account
npm run seed

# Run automated tests
npm run test --workspace=apps/api

# Compile TypeScript to dist/
npm run build --workspace=apps/api

# Run production server
npm run start --workspace=apps/api
```

---

## 🧪 Testing

Run all unit and integration test suites:
```bash
npm run test --workspace=apps/api
```
Includes comprehensive test coverage for auth flows, streak algorithms, session logging, contribution calculations, and administrative access control.
