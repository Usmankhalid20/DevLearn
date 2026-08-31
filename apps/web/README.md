# @devlearn/web — Next.js 15 Web Application

> **The primary web interface for the DevLearn personal learning-progress SaaS platform.**

`@devlearn/web` is a modern, high-performance web application built with **Next.js 15 (App Router)**, **React 19**, and **TypeScript**. It delivers a high-density, developer-focused dark monochrome user experience featuring marketing showcases, comprehensive learning analytics, real-time timers, course curriculums, and full system administration.

---

## 🛠️ Technology Stack

* **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server & Client Components)
* **Runtime / Core**: React 19, TypeScript 5
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom monochrome tokens & CSS custom properties
* **Component Primitives**: [shadcn/ui](https://ui.shadcn.com/) + [Lucide React](https://lucide.dev/)
* **Animations**: [Motion](https://motion.dev/) for smooth micro-interactions
* **Visualizations & Charts**: [Recharts](https://recharts.org/) (Custom grayscale area & bar charts)
* **Data Fetching & Caching**: [TanStack Query v5](https://tanstack.com/query) (React Query)
* **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
* **Notifications**: [React Toastify](https://fkhadra.github.io/react-toastify/)

---

## 📁 Route & Application Architecture

The application is structured under the Next.js App Router using route groups to isolate layouts, security guards, and navigation patterns:

```text
apps/web/app/
├── (marketing)/                  # Public showcase & landing pages
│   ├── layout.tsx                # Marketing header, navigation & footer
│   └── page.tsx                  # Hero, interactive heatmap preview, features, FAQ
│
├── (auth)/                       # Standalone authentication flows
│   ├── layout.tsx                # Centered auth card container with brand branding
│   ├── login/page.tsx            # Email/password authentication
│   ├── register/page.tsx         # Account registration
│   ├── forgot-password/page.tsx  # Password recovery request
│   └── reset-password/page.tsx   # Token-based password reset form
│
├── (portal)/                     # Authenticated Learner Portal
│   ├── layout.tsx                # Portal sidebar, header, breadcrumbs, auth guard
│   ├── dashboard/page.tsx        # Daily focus summary, streak meters, 52-week heatmap
│   ├── learning/page.tsx         # Learning tracker (manual log + live stopwatch timer)
│   ├── tasks/page.tsx            # Planned learning tasks & checklists
│   ├── courses/page.tsx          # Structured courses & syllabus tracking
│   ├── goals/page.tsx            # Hourly learning targets & milestone tracking
│   ├── resources/page.tsx        # Bookmarks for docs, GitHub repos, and video tutorials
│   ├── history/page.tsx          # Searchable, filterable chronological session history
│   ├── analytics/page.tsx        # Deep focus metrics, subject distributions, 30-day trends
│   ├── achievements/page.tsx     # 7 milestone badges & achievement progression
│   ├── settings/page.tsx         # Timezone, daily goal targets, and theme preferences
│   └── profile/page.tsx          # User profile details and avatar management
│
└── (admin)/                      # Administrative & Operations Subsystem
    ├── layout.tsx                # Admin layout with elevated role guard (ADMIN/SUPERADMIN)
    └── admin/
        ├── overview/page.tsx     # Platform KPIs, user growth graphs, study volume
        ├── users/page.tsx        # User directory, search, status toggles (SUSPEND/BAN), roles
        ├── telemetry/page.tsx    # Live DB latency, Redis cache stats, Node.js memory
        ├── audit-logs/page.tsx   # Security audit trail with search and action filters
        └── settings/page.tsx     # System maintenance mode and platform settings
```

---

## 🎨 Monochrome Design System

DevLearn adheres to a disciplined dark monochrome palette:

| Token | Hex Value | Semantic Usage |
|---|---|---|
| `--bg-base` | `#0D0D0D` | Application root background |
| `--bg-surface` | `#151515` | Card backgrounds, table headers, sidebar |
| `--bg-surface-elevated`| `#1C1C1C` | Modals, dropdown menus, popovers, active tabs |
| `--border-default` | `#2A2A2A` | Standard component and table borders |
| `--border-subtle` | `#202020` | Subtle divider lines |
| `--text-primary` | `#FFFFFF` | Primary headings, titles, active text |
| `--text-secondary` | `#BDBDBD` | Body copy, secondary labels |
| `--text-muted` | `#808080` | Timestamps, placeholders, inactive states |

### 52-Week Contribution Palette
* **Level 0 (0 min)**: `#1A1A1A`
* **Level 1 (1–29 min)**: `#303030`
* **Level 2 (30–59 min)**: `#555555`
* **Level 3 (60–119 min)**: `#858585`
* **Level 4 (120+ min)**: `#FFFFFF`

---

## ⚙️ Getting Started Locally

### 1. Prerequisites
Ensure the backend API (`@devlearn/api`) is running or accessible.

### 2. Environment Variables
Create `.env.local` in `apps/web/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Available Scripts

From the repository root:
```bash
# Run web development server (Turbopack)
npm run dev:web

# Run production build
npm run build --workspace=apps/web

# Start production server
npm run start --workspace=apps/web

# Static type check
npm run typecheck --workspace=apps/web

# Linting
npm run lint --workspace=apps/web
```

---

## 🧪 Testing & Verification

The web application integrates with TanStack Query and standard API response wrappers, providing automated optimistic updates and robust error boundary handling.
