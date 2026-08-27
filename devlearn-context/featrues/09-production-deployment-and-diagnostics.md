# DevLearn — 09 Production Deployment, Diagnostics & Health Telemetry Specification

## Context Files Read Before This Specification

This implementation unit was prepared in accordance with the DevLearn context set:
- [ai-workflow-rules.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/ai-workflow-rules.md) — production readiness, reproducible infrastructure, verification.
- [architecture.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/architecture.md) — Docker containerization, PostgreSQL/Redis connections, modular boundaries.
- [code-standards.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/code-standards.md) — security headers, production error redaction, telemetry logging.
- [01-system-design.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/featrues/01-system-design.md) — monorepo structure and local docker infrastructure.

---

## Responsibility Boundary

| Information | Source of Truth |
|---|---|
| Product purpose, core loop, and scope | `project-overview.md` |
| System architecture, boundaries, storage, auth invariants | `architecture.md` |
| Coding rules and conventions | `code-standards.md` |
| Containerization, Production Docker Compose & System Telemetry | `09-production-deployment-and-diagnostics.md` |

---

## 1. Production Containerization Architecture

### A. Backend API Container (`apps/api/Dockerfile`)
- **Base Image**: `node:20-alpine` (minimal attack surface).
- **Multi-Stage Build**:
  - `builder` stage: Installs dependencies, generates Prisma Client, and compiles TypeScript into `/dist`.
  - `runner` stage: Copies production `node_modules` and compiled `/dist`, sets `NODE_ENV=production`.
- **Security**: Executes as non-root `node` user (`USER node`).
- **Health Check**: Native HTTP probe checking `http://localhost:4000/api/health`.

### B. Frontend Web Container (`apps/web/Dockerfile`)
- **Multi-Stage Build**:
  - Leverages Next.js `output: 'standalone'` mode.
  - Copies minimal static and server bundles.
- **Port**: Exposes port `3000`.

### C. Production Docker Compose (`docker-compose.prod.yml`)
- Orchestrates 4 isolated services:
  1. `postgres`: PostgreSQL 16 Alpine with persisted data volume.
  2. `redis`: Redis 7 Alpine with healthcheck.
  3. `api`: DevLearn Express backend on port `4000`.
  4. `web`: DevLearn Next.js frontend on port `3000`.
- Automatic restart policy (`restart: unless-stopped`).
- Bridge network isolating internal database and cache ports.

---

## 2. Health Monitoring & System Diagnostics Engine

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Standard lightweight liveness probe returning `200 OK` |
| `GET` | `/api/system/diagnostics` | In-depth system telemetry measuring live DB/Redis pings, memory, and uptime |

### Diagnostics Response Contract

```typescript
export interface SystemDiagnosticsResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  database: {
    connected: boolean;
    pingMs: number;
  };
  redis: {
    connected: boolean;
    pingMs: number;
  };
  process: {
    memoryRssMb: number;
    heapUsedMb: number;
    nodeVersion: string;
  };
}
```

### Measurement Algorithm
1. **PostgreSQL Ping**: Executes `await prisma.$queryRaw\`SELECT 1\`` and records round-trip latency in milliseconds.
2. **Redis Ping**: Executes `await redis.ping()` and records round-trip latency.
3. **Memory Metrics**: Converts `process.memoryUsage()` to MB.
4. **Status Determination**: If both PostgreSQL and Redis pings succeed, status is `healthy`; if either fails, returns `degraded` with status code `503`.

---

## 3. Production Hardening & Security Invariants

1. **HTTP Security Headers**:
   - Helmet middleware configured with strict Content Security Policy (CSP), HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.
2. **CORS Restrictions**:
   - `origin` restricted strictly to configured `WEB_ORIGIN` environment variable.
   - `credentials: true` for secure cookies.
3. **Production Error Masking**:
   - In `NODE_ENV=production`, internal database errors or unhandled exceptions return generic message `Internal server error` while logging full diagnostic traces server-side via Pino.

---

## 4. Verification & Testing Plan

### Automated Integration Tests (`apps/api/tests/health.test.ts`)
1. Verify `/api/health` returns `status: "ok"`.
2. Verify `/api/system/diagnostics` returns PostgreSQL latency $> 0\text{ms}$ and memory metrics.
3. Verify Dockerfiles build without errors.
4. Verify Next.js static build produces valid production output.
