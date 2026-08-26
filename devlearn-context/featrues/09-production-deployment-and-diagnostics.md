# DevLearn — 09 Production Deployment, Diagnostics & Health Telemetry

## Purpose

Define the specification for production containerization, system diagnostics, and docker-compose deployment orchestration.

---

## 1. Production Containerization

- **API Dockerfile (`apps/api/Dockerfile`)**:
  - Multi-stage Node.js Alpine build.
  - Generates Prisma client, compiles TypeScript to `/dist`, and runs as non-root `node` user.
- **Web Dockerfile (`apps/web/Dockerfile`)**:
  - Multi-stage Next.js build with standalone output.
- **Root Docker Compose (`docker-compose.prod.yml`)**:
  - Orchestrates API, Web, PostgreSQL, and Redis with health check policies and automatic restart rules.

---

## 2. Telemetry & Diagnostics Endpoint (`/api/health/diagnostics`)

- System CPU/Memory load.
- Real PostgreSQL query ping latency (ms).
- Real Redis ping latency (ms).
- Process uptime, Node environment, and platform memory stats.
