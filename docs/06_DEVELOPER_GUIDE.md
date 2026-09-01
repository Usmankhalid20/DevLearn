# DevLearn — Local Development & Deployment Guide

This guide provides step-by-step instructions for onboarding, local setup, database provisioning, automated testing, and production deployment across the DevLearn monorepo.

---

## 1. Prerequisites

Before getting started, ensure you have the following installed on your development machine:

* **Node.js**: `v20.x` or `v22.x` (LTS recommended)
* **npm**: `v10.x+` (comes bundled with Node.js)
* **Docker Desktop**: For running PostgreSQL 16 and Redis 7 in containers
* **Expo CLI / Expo Go App** (Optional for mobile testing): Available on iOS App Store & Google Play

---

## 2. Environment Configuration

1. Clone the repository and navigate to the project root:
   ```bash
   git clone https://github.com/Usmankhalid20/DevLearn.git
   cd DevLearn
   ```

2. Create your local `.env` configuration file from the template:
   ```bash
   cp .env.example .env
   ```

3. Review the environment parameters:

| Variable | Default Value | Description |
|---|---|---|
| `NODE_ENV` | `development` | Environment mode (`development`, `production`, `test`) |
| `PORT` | `5000` | Express API listening port |
| `API_URL` | `http://localhost:5000` | Fully qualified backend URL |
| `WEB_ORIGIN` | `http://localhost:3000` | Allowed CORS origin for Next.js web application |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000` | Client-side API URL consumed by Next.js & Mobile |
| `DATABASE_URL` | `postgresql://devlearn:devlearn_dev_password@127.0.0.1:5433/devlearn_db?schema=public` | PostgreSQL connection string (maps to container port `5433`) |
| `REDIS_URL` | `redis://127.0.0.1:6379` | Redis connection URL |
| `SESSION_SECRET` | `devlearn_super_secure_session_secret_min_32_chars_long` | Cryptographic secret for signing session cookies |
| `SMTP_HOST` | `smtp.example.com` | SMTP host for verification and reset emails |

---

## 3. Local Infrastructure (Docker Compose)

Start the local PostgreSQL 16 and Redis 7 service containers:

```bash
# Start containers in background
npm run docker:up

# Verify containers are healthy
docker ps
```

* **PostgreSQL** runs on `localhost:5433` (avoiding default port `5432` collisions).
* **Redis** runs on `localhost:6379`.

To stop local infrastructure containers:
```bash
npm run docker:down
```

---

## 4. Installing Dependencies & Building Packages

Install all workspace dependencies and compile shared TypeScript packages (`@devlearn/types`, `@devlearn/ui`, `@devlearn/config`):

```bash
npm install
npm run build
```

---

## 5. Database Schema & Seeding

1. Generate Prisma Client bindings:
   ```bash
   npm run prisma:generate
   ```

2. Push the schema to your local PostgreSQL instance:
   ```bash
   npx prisma db push --schema=apps/api/prisma/schema.prisma
   ```

3. Seed the database with sample subjects, tasks, and initial administrative accounts:
   ```bash
   npm run seed
   ```

---

## 6. Running Development Servers

### Option A: Run All Services Concurrently
```bash
npm run dev
```

### Option B: Run Services Individually

1. **Frontend Web App** (`Next.js 15`):
   ```bash
   npm run dev:web
   ```
   * Accessible at: **`http://localhost:3000`**

2. **Backend API Server** (`Express.js`):
   ```bash
   npm run dev:api
   ```
   * Accessible at: **`http://localhost:5000`**
   * Health Check: **`http://localhost:5000/health`**

3. **Mobile Companion App** (`Expo / React Native`):
   ```bash
   npm run dev:mobile
   ```
   * Press `w` in terminal to run in Web browser.
   * Scan QR code with Expo Go on iOS or Android.

---

## 7. Quality Assurance & Testing

Run all unit and integration test suites:
```bash
npm run test
```

Run TypeScript static type checks across the entire monorepo:
```bash
npm run typecheck
```

Run ESLint code style verification:
```bash
npm run lint
```

---

## 8. Production Deployment

### Multi-Container Production Build (`docker-compose.prod.yml`)

The repository includes a production multi-container setup running optimized multi-stage Docker builds for the Next.js frontend, Express.js API, PostgreSQL database, and Redis cache:

```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### Production Checklist
1. Replace `SESSION_SECRET` with a cryptographically random 64-character string.
2. Configure a production PostgreSQL database with automated daily backups.
3. Configure production SMTP credentials for reliable email delivery.
4. Ensure `NODE_ENV=production` is set across all services.
