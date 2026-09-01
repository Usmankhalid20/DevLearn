# DevLearn

<div align="center">

<h3>Track what you learn. Measure your time. See your progress.</h3>

<p>
A modern, full-stack personal learning-progress SaaS platform and developer companion that transforms scattered study activity into a verifiable, structured learning ledger with 52-week monochrome activity heatmaps.
</p>

[![Next.js](https://img.shields.io/badge/Next.js-15_(App_Router)-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![React Native](https://img.shields.io/badge/React_Native-Expo_SDK_54-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Express.js](https://img.shields.io/badge/Express.js-Modular_Monolith-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## 📚 Complete Project Documentation

| Document | Description |
|---|---|
| 📖 [**01. Project Overview & Problem Statement**](file:///c:/Users/usman/Documents/DevLearn/docs/01_PROJECT_OVERVIEW.md) | What is DevLearn, why it was created, what problems it solves, target audience, and core principles |
| 🏗️ [**02. System Architecture & Design**](file:///c:/Users/usman/Documents/DevLearn/docs/02_ARCHITECTURE.md) | Monorepo layout, modular monolith backend, PostgreSQL persistence, Redis cache-aside, and RBAC security |
| ⚡ [**03. Complete Features & Modules Guide**](file:///c:/Users/usman/Documents/DevLearn/docs/03_FEATURES_GUIDE.md) | Exhaustive catalog of all 16 modules, focus timer, courses, goals, bookmarks, heatmap, badges, and admin portal |
| 🔌 [**04. Complete REST API Reference**](file:///c:/Users/usman/Documents/DevLearn/docs/04_API_REFERENCE.md) | Full endpoint contracts, request/response JSON schemas, query filters, and error codes |
| 🗄️ [**05. Database Schema & Data Models**](file:///c:/Users/usman/Documents/DevLearn/docs/05_DATABASE_SCHEMA.md) | Relational ER diagrams, Prisma models, indices, enums, and foreign-key cascade rules |
| 🚀 [**06. Developer Setup & Deployment Guide**](file:///c:/Users/usman/Documents/DevLearn/docs/06_DEVELOPER_GUIDE.md) | Local onboarding, Docker containers, Prisma migrations, seeding, testing, and production deployment |

---

## 📱 Sub-Application READMEs

* 🌐 [**Web Application README (`apps/web`)**](file:///c:/Users/usman/Documents/DevLearn/apps/web/README.md): Next.js 15 App Router client, Tailwind CSS, Recharts visualizations, TanStack Query, and Admin Portal.
* ⚙️ [**Backend API README (`apps/api`)**](file:///c:/Users/usman/Documents/DevLearn/apps/api/README.md): Express.js modular monolith, Argon2id auth, signed cookie sessions, Redis caching, and 16 domain modules.
* 📲 [**Mobile Application README (`apps/mobile`)**](file:///c:/Users/usman/Documents/DevLearn/apps/mobile/README.md): React Native + Expo companion app for 3-second quick logging, live stopwatch timers, and offline stats.

---

## 💡 What is DevLearn & What Problems Does it Solve?

Self-directed technical education happens across disjointed platforms: documentation, video lectures, coding challenges, textbooks, and GitHub repositories. At the end of the month, learners cannot easily answer:
* *What did I actually learn?*
* *How many verified hours did I spend on Distributed Systems vs SQL?*
* *Am I learning consistently every day?*

**DevLearn solves this by turning scattered learning into a structured, quantifiable ledger:**
1. **Separates Plans vs. Reality**: Tasks capture *intent*; Learning Sessions record *actual verified focus time*.
2. **52-Week Monochrome Activity Heatmap**: Visualizes study momentum with a custom 5-level grayscale calendar driven purely by focus minutes.
3. **Streak Engine with Grace Period**: Timezone-aware streak tracking with built-in grace periods for consistent daily study habits.
4. **Automated Milestone Recognition**: 7 verifiable achievement badges evaluated dynamically from study volume and subject breadth.
5. **Private & Vendor-Independent**: Works completely without paid third-party APIs or external lock-in. Full 1-click JSON/CSV data export.

---

## 📁 Repository Structure

```text
DevLearn/
├── apps/
│   ├── api/                      # Node.js + Express.js Modular Monolith REST API
│   │   ├── prisma/               # Relational schema, migrations & seed script
│   │   ├── src/                  # 16 domain modules, middleware, config, database singletons
│   │   └── tests/                # Vitest integration and unit tests
│   ├── web/                      # Next.js 15 App Router Frontend
│   │   ├── app/                  # (marketing), (auth), (portal), (admin) route groups
│   │   ├── components/           # UI primitives, Recharts analytics, forms & layouts
│   │   └── providers/            # TanStack Query, AuthContext, Toast notifications
│   └── mobile/                   # React Native + Expo Companion App
│       ├── src/api/              # Unified Axios client with auto token auth
│       ├── src/navigation/       # Native stack and bottom tab navigators
│       ├── src/screens/          # Dashboard, Timer, History, Progress, Settings
│       └── src/context/          # Mobile auth & offline-first cache
├── packages/
│   ├── config/                   # Shared TypeScript base configs & ESLint presets
│   ├── types/                    # Shared domain DTOs, API response contracts & enums
│   └── ui/                       # Design tokens and monochrome theme constants
├── docs/                         # Complete system engineering & product documentation
├── infrastructure/
│   └── docker/                   # Docker Compose setup for PostgreSQL 16 & Redis 7
├── devlearn-context/             # Product specifications & architectural invariants
├── docker-compose.prod.yml       # Production multi-container deployment
├── .env.example                  # Environment variables template
└── package.json                  # Root npm workspace scripts
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (`v20+` LTS recommended)
* [Docker Desktop](https://www.docker.com/)

### 2. Start Infrastructure Containers
Start local PostgreSQL 16 (port `5433`) and Redis 7 (port `6379`):
```bash
npm run docker:up
```

### 3. Install Dependencies & Build Packages
```bash
npm install
npm run build
```

### 4. Database Setup & Seeding
Push the Prisma schema to PostgreSQL and seed initial demo data & admin accounts:
```bash
npm run prisma:generate
npx prisma db push --schema=apps/api/prisma/schema.prisma
npm run seed
```

### 5. Run Development Servers
```bash
# Run all applications concurrently
npm run dev

# Or run individual sub-applications:
npm run dev:web       # Next.js Web:    http://localhost:3000
npm run dev:api       # Express.js API: http://localhost:5000
npm run dev:mobile    # Expo Mobile:    Metro bundler
```

---

## 🎨 Monochrome Design System

DevLearn features a disciplined developer-first dark monochrome aesthetic:
* **Root Background**: `#0D0D0D`
* **Card Surface**: `#151515`
* **Elevated Surface**: `#1C1C1C`
* **Borders**: `#2A2A2A` / `#202020`
* **Text Hierarchy**: `#FFFFFF` (primary), `#BDBDBD` (secondary), `#808080` (muted)
* **52-Week Contribution Heatmap**: Level 0 (`#1A1A1A`) to Level 4 (`#FFFFFF`)

---

## 🧪 Testing & Code Quality

```bash
# Run unit & integration tests
npm run test

# Static typecheck across all workspaces
npm run typecheck

# Lint codebase
npm run lint
```

---

## 📄 License

UNLICENSED — DevLearn Team
