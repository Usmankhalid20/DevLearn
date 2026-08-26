# DevLearn

> **Track what you learn. Measure your time. See your progress.**

DevLearn is a personal learning-progress SaaS application for students, developers, and self-learners. It transforms scattered learning activity across documentation, videos, courses, and projects into a structured, verifiable learning history with custom monochrome activity heatmaps.

---

## 🛠️ Tech Stack

### Frontend (`apps/web`)
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom monochrome design tokens
- **Components**: shadcn/ui primitives + Lucide React
- **Motion & Charts**: Motion, Recharts
- **State Management**: TanStack Query, React Hook Form, Zod

### Backend (`apps/api`)
- **Runtime & Framework**: Node.js, Express.js (Modular Monolith)
- **Database & ORM**: PostgreSQL, Prisma ORM
- **In-Memory Cache**: Redis (ioredis)
- **Security & Middleware**: Helmet, CORS, Cookie-parser, Pino (structured logging)

### Infrastructure & Tooling
- **Monorepo**: npm workspaces
- **Local Dev Containers**: Docker Compose (PostgreSQL 16 + Redis 7)
- **Shared Packages**: `@devlearn/types`, `@devlearn/ui`, `@devlearn/config`

---

## 📁 Repository Structure

```text
DevLearn/
├── apps/
│   ├── api/                 # Express.js REST API
│   │   ├── prisma/          # Prisma schema & migrations
│   │   ├── src/             # Config, database singletons, middleware, modules, routes
│   │   └── tests/           # Integration and unit tests
│   └── web/                 # Next.js App Router frontend
│       ├── app/             # (marketing), (auth), (portal) route groups
│       ├── components/      # UI primitives & layouts (Sidebar, Header)
│       └── styles/          # Monochrome CSS custom properties
├── packages/
│   ├── config/              # Shared TypeScript base configs
│   ├── types/               # Shared domain DTOs & API response types
│   └── ui/                  # Design token constants
├── infrastructure/
│   └── docker/              # Docker Compose for PostgreSQL & Redis
├── devlearn-context/        # Spec-driven architecture and product context
├── .env.example             # Environment variables template
└── package.json             # Root monorepo workspace scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [Docker Desktop](https://www.docker.com/)

### 2. Setup Local Infrastructure
Start PostgreSQL and Redis:
```bash
npm run docker:up
```

### 3. Install Dependencies & Build Packages
```bash
npm install
npm run build
```

### 4. Database Setup
Push Prisma schema to local PostgreSQL:
```bash
npm run prisma:generate
npx prisma db push --schema=apps/api/prisma/schema.prisma
```

### 5. Run Development Servers
- Run all apps:
  ```bash
  npm run dev
  ```
- Run Frontend only (http://localhost:3000):
  ```bash
  npm run dev:web
  ```
- Run Backend only (http://localhost:5000):
  ```bash
  npm run dev:api
  ```

---

## 🎨 Monochrome Design System

DevLearn uses a dark, minimal, developer-tool aesthetic:
- **Base Background**: `#0D0D0D`
- **Surface**: `#151515`
- **Elevated Surface**: `#1C1C1C`
- **Borders**: `#2A2A2A` / `#202020`
- **Text Hierarchy**: `#FFFFFF` (primary), `#BDBDBD` (secondary), `#808080` (muted)
- **Contribution Heatmap**: Grayscale Level 0 (`#1A1A1A`) to Level 4 (`#FFFFFF`)

---

## 📄 License
UNLICENSED — DevLearn Team
