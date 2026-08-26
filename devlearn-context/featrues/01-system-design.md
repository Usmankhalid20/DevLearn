DevLearn — 01 Design System & Project Foundation

Context Files Read Before This Specification

This implementation unit was prepared after reading the existing DevLearn context set:

ai-workflow-rules.md — development workflow, scope control, missing-requirement handling, documentation sync, and verification expectations.

architecture.md — technology stack, system boundaries, storage, authentication/access, and architecture invariants.

code-standards.md — TypeScript, framework, styling, API, storage, and file-organization rules.

progress-tracker.md — current implementation state, open questions, architecture decisions, and next work.

project-overview.md — product purpose, goals, user flow, feature scope, and success criteria.

ui-context.md — visual language, color tokens, typography, component library, layout patterns, and icon conventions.

How This File Uses Those Contexts

This file is an implementation-unit specification, not a replacement for the context files.

It uses the context files above as the source of truth and turns their current decisions into the concrete setup required for Phase 01.

Responsibility Boundary

Keep information in the document that owns it:

Information

Source of truth

Product purpose, goals, core flow, scope

project-overview.md

System architecture, boundaries, storage, auth invariants

architecture.md

Coding rules and conventions

code-standards.md

AI implementation workflow and verification process

ai-workflow-rules.md

Current status and unresolved decisions

progress-tracker.md

Visual system and UI rules

ui-context.md

Exact work to perform in Phase 01

01-design-system.md

Do not duplicate complete product requirements, architecture rules, or coding standards here when they already belong to another context file.

What This File Owns

01-design-system.md defines only the first implementation unit:

project initialization

production-ready repository structure

frontend/backend application boundaries

initial dependency installation

local infrastructure setup

environment configuration

design-system implementation foundation

initial security/performance foundations

phase-specific verification

explicit exclusions for this phase

It does not redefine the complete product, database model, authentication behavior, or future integrations.

Implementation Rule

Before changing code for this phase:

Read the context files listed above.

Use the relevant context file as the source of truth for that concern.

Use this file only for Phase 01 implementation details.

Do not invent requirements that are not supported by the context files.

When a decision changes, update the correct context file and then update this implementation unit if the change affects Phase 01.

When Phase 01 is complete, update progress-tracker.md.

Purpose

This is the first implementation specification for DevLearn.

The goal of this phase is to:

Initialize the project with a production-ready structure.

Establish the frontend and backend boundaries.

Install only the dependencies currently justified by the product.

Establish the design-system tokens and reusable UI foundation.

Configure development, test, build, and production environments.

Avoid feature implementation until the foundation is stable.

Do not implement learning features, dashboards, analytics, authentication flows, YouTube integration, GitHub integration, or billing in this phase.

1. Product Identity

Product Name

DevLearn

Product Positioning

DevLearn is a personal learning progress platform for students, developers, and self-learners.

Core promise:

Track what you learn. Measure your time. See your progress.

The product is not a traditional Todo app.

Core concepts are:

Subjects

Goals

Tasks

Learning Sessions

Resources

Courses

Contributions

Analytics

All learning categories are user-defined and must remain dynamic.

Do not hard-code examples such as DSA, Redis, SQL, Prisma, or DevOps into application logic.

2. Technology Stack

Frontend

Next.js

TypeScript

Tailwind CSS

shadcn/ui

Motion

TanStack Query

React Hook Form

Zod

Recharts

Backend

Node.js

Express.js

TypeScript

REST API

Data

PostgreSQL

Prisma

Redis

Background Jobs

BullMQ only when an actual asynchronous job is required.

Authentication

Custom authentication:

Email/password

Password hashing

Email verification

Password reset

Secure HTTP-only cookies

Server-side session management

Do not install Clerk.

Do not add Google authentication in this phase.

Email

Nodemailer

SMTP provider configured through environment variables

Nodemailer is the mail client/library; SMTP delivery is an infrastructure concern.

Development

Docker

Docker Compose

3. Architecture Style

Use a modular monolith.

Do not create microservices.

The system has two primary applications:

DevLearn
├── apps/
│ ├── web/
│ └── api/
│
├── packages/
│ ├── ui/
│ ├── config/
│ └── types/
│
├── infrastructure/
│ ├── docker/
│ └── scripts/
│
└── docs/

The frontend and backend have clear boundaries.

Browser
↓
Next.js Web
↓
Express API
↓
Application Modules
↓
Prisma
↓
PostgreSQL

Redis is an optional fast path/cache layer:

Express API
↓
Redis
├── HIT → return cached data
└── MISS → PostgreSQL → cache result → return

PostgreSQL remains the source of truth.

Redis must never become the authoritative store for permanent learning data.

4. Production-Ready Repository Structure

Use this structure as the target foundation:

devlearn/
│
├── apps/
│ │
│ ├── web/
│ │ ├── app/
│ │ │ ├── (marketing)/
│ │ │ ├── (auth)/
│ │ │ └── (portal)/
│ │ │
│ │ ├── components/
│ │ │ ├── ui/
│ │ │ ├── layout/
│ │ │ └── shared/
│ │ │
│ │ ├── features/
│ │ ├── hooks/
│ │ ├── lib/
│ │ ├── providers/
│ │ ├── styles/
│ │ ├── types/
│ │ ├── public/
│ │ ├── next.config.ts
│ │ ├── tsconfig.json
│ │ └── package.json
│ │
│ └── api/
│ ├── src/
│ │ ├── config/
│ │ ├── database/
│ │ ├── middleware/
│ │ ├── modules/
│ │ │ ├── auth/
│ │ │ ├── users/
│ │ │ ├── subjects/
│ │ │ ├── goals/
│ │ │ ├── tasks/
│ │ │ ├── learning/
│ │ │ ├── resources/
│ │ │ ├── courses/
│ │ │ ├── analytics/
│ │ │ ├── contributions/
│ │ │ └── settings/
│ │ │
│ │ ├── routes/
│ │ ├── services/
│ │ ├── utils/
│ │ ├── app.ts
│ │ └── server.ts
│ │
│ ├── prisma/
│ │ ├── migrations/
│ │ └── schema.prisma
│ │
│ ├── tests/
│ ├── tsconfig.json
│ └── package.json
│
├── packages/
│ ├── ui/
│ ├── config/
│ └── types/
│
├── infrastructure/
│ ├── docker/
│ └── scripts/
│
├── docs/
│ └── context/
│
├── .env.example
├── .gitignore
├── .editorconfig
├── package.json
├── README.md
├── docker-compose.yml
└── package-lock.json

Important structure rules

Do not create empty folders solely for appearance.

Create a folder when the first real responsibility belongs there.

Do not place reusable frontend components inside feature-specific directories when they are clearly shared.

Do not create a generic utils dumping ground for unrelated code.

Keep backend business logic out of Express route handlers.

5. Frontend Structure

Use Next.js App Router.

Recommended route groups:

app/
├── (marketing)/
├── (auth)/
└── (portal)/

The marketing website and authenticated product should have different layouts while sharing the same design system.

Marketing

Examples:

/
/about
/how-it-works

Keep the exact page list driven by the product specification.

Authentication

Examples:

/login
/register
/verify-email
/forgot-password
/reset-password

Portal

Examples:

/dashboard
/learning
/tasks
/resources
/history
/analytics
/settings

Do not create pages until their product requirement is defined.

6. Backend Structure

Use Express.js with a modular architecture.

Each module owns its business area.

Example:

modules/
└── learning/
├── learning.routes.ts
├── learning.controller.ts
├── learning.service.ts
├── learning.repository.ts
├── learning.schema.ts
└── learning.types.ts

Request flow

Request
↓
Middleware
↓
Route
↓
Controller
↓
Service
↓
Repository / Prisma
↓
PostgreSQL

Controllers should remain thin.

Services contain application/business logic.

Repository/database code handles persistence concerns.

Validation happens at the request boundary.

7. Initial Dependencies

Install only dependencies justified by the foundation.

Frontend

Required:

next

react

react-dom

typescript

tailwindcss

shadcn/ui dependencies as generated

motion

@tanstack/react-query

react-hook-form

zod

recharts

lucide-react

Backend

Required:

express

typescript

prisma

@prisma/client

zod

cookie-parser

cors

helmet

pino

pino-http

Authentication dependencies should be added during the authentication phase rather than this foundation phase unless required by the initial setup.

Development tooling

Recommended:

eslint

prettier

typescript-eslint

vitest

supertest

playwright

Do not add packages merely because they are popular.

Every dependency must have a clear responsibility.

8. Database Foundation

Initialize PostgreSQL with Prisma.

At this stage:

establish the Prisma client

establish database connection configuration

establish migration workflow

verify development database connectivity

Do not create the complete product schema yet.

The schema must be designed after the product/data model is finalized.

9. Redis Foundation

Redis is not the primary database.

Initial setup should only verify:

connection configuration

development connectivity

health check

Do not implement broad caching in this phase.

Cache strategy comes after the first read-heavy features exist.

10. Environment Configuration

Use environment variables.

Never hard-code credentials, URLs, secrets, or tokens.

Example categories:

NODE_ENV
PORT
WEB_ORIGIN

DATABASE_URL

REDIS_URL

SESSION_SECRET

SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASSWORD
SMTP_FROM

Use:

.env.local
.env.development
.env.test
.env.production

as appropriate for the local/project setup.

Commit only:

.env.example

Never commit real secrets.

11. Docker Foundation

Development services should be reproducible.

Initial Docker services:

postgres
redis

The application may run directly on the host during development or inside containers depending on the final workflow.

Do not add unnecessary infrastructure services.

The first goal is:

docker compose up -d

and then verify:

PostgreSQL is reachable

Redis is reachable

12. Design System Foundation

DevLearn uses a minimal monochrome design.

No gradients.

No glassmorphism.

No neon color system.

No excessive shadows.

No colorful subject cards.

No hard-coded hex values inside components.

All colors must come from design tokens.

Color Tokens

Base

--bg-base: #0D0D0D
--bg-surface: #151515
--bg-elevated: #1C1C1C

--text-primary: #FFFFFF
--text-secondary: #BDBDBD
--text-muted: #808080

--border-default: #2A2A2A
--border-subtle: #202020

Neutral UI

--neutral-soft: #E0E0E0

Semantic

--state-success: #FFFFFF
--state-warning: #F59E0B
--state-error: #EF4444

Success may use subtle tonal treatment instead of a bright green brand color.

The main visual language remains monochrome.

13. Contribution Graph Colors

The learning contribution graph uses tonal grayscale rather than GitHub green.

Level 0: #1A1A1A
Level 1: #303030
Level 2: #555555
Level 3: #858585
Level 4: #FFFFFF

These values should eventually become design tokens rather than inline literals.

Contribution levels are based on learning activity and will be finalized in a later product decision.

Do not assume final thresholds in this phase.

14. Typography

Use a modern sans-serif UI font.

Preferred direction:

Geist Sans or equivalent system-friendly sans

Geist Mono or equivalent monospace for technical values when useful

Typography must prioritize:

readability

clear hierarchy

compact dashboard density

strong numeric presentation

Do not use decorative fonts.

15. Component Principles

Use shadcn/ui as the base component system.

Add components through the established component workflow.

Prefer reusable primitives such as:

Button
Input
Textarea
Select
Dialog
Dropdown
Tabs
Tooltip
Badge
Card
Table
Sheet
Command
Calendar

Build domain components on top of primitives.

Examples:

LearningSessionCard
ContributionGraph
LearningSummary
AnalyticsCard
ResourceRow
TaskItem

Do not duplicate equivalent components for individual subjects.

16. Layout Principles

Marketing

clean full-width sections

strong typography

restrained spacing

focused calls to action

Portal

persistent sidebar on desktop

responsive navigation on smaller screens

content-first layout

predictable spacing

compact cards

clear data hierarchy

Cards

Cards should be used when grouping information improves scanability.

Do not put every piece of content inside a card.

Borders

Use borders for structure.

Do not depend on large shadows to separate sections.

17. Responsive Rules

The application must be responsive from the beginning.

Required:

desktop

tablet

mobile

Do not design desktop first and "fix mobile later."

The portal must remain usable for:

adding learning

running a timer

checking daily progress

viewing contribution history

reviewing sessions

on small screens.

18. Accessibility Foundation

Required:

semantic HTML

keyboard navigation

visible focus states

accessible labels

sufficient text contrast

reduced-motion support where appropriate

form errors associated with inputs

dialogs and popovers with proper focus handling

Do not rely on color alone to communicate state.

19. Performance Principles

Frontend:

use server rendering where it provides a real benefit

avoid unnecessary client components

lazy-load heavy client-only UI when justified

avoid unnecessary re-renders

keep charts isolated from unrelated page updates

Backend:

avoid N+1 database queries

paginate growing collections

validate input before database work

use Redis only where caching has a measurable benefit

Do not optimize speculative bottlenecks.

20. Initial Verification Checklist

Before leaving Phase 01:

Repository

Project initializes successfully.

Monorepo/folder boundaries are established.

Frontend runs successfully.

Express API runs successfully.

TypeScript passes.

Lint passes.

Formatting passes.

Infrastructure

PostgreSQL starts successfully.

Redis starts successfully.

Prisma connects to PostgreSQL.

Environment variables load correctly.

No secrets are committed.

Frontend

Tailwind works.

shadcn/ui foundation works.

Design tokens are centralized.

Dark monochrome theme is established.

Responsive shell works.

Backend

Express health endpoint works.

Middleware stack is established.

Error handling foundation exists.

CORS is configured for the intended web origin.

Helmet/security headers are configured.

Structured logging is configured.

Quality

No duplicate setup code.

No placeholder business features.

No unnecessary dependencies.

No hard-coded secrets.

No hard-coded learning categories.

Documentation reflects the actual setup.

21. What This Phase Must NOT Build

Do not implement:

dashboard business logic

subjects CRUD

task CRUD

learning sessions

timer persistence

contribution calculations

analytics

YouTube API

GitHub API

billing

public profiles

collaboration

Liveblocks

Google login

Those belong to later implementation units.

22. Completion Criteria

Phase 01 is complete only when:

The repository is initialized with the agreed production-ready boundaries.

Frontend and backend both run successfully.

PostgreSQL and Redis are available locally.

Prisma connects successfully.

The frontend design token system is established.

shadcn/ui is configured.

The Express foundation has security, logging, validation, and error-handling infrastructure.

Environment configuration is clean.

No feature code has been prematurely implemented.

The project can be handed to the next implementation phase without restructuring the foundation.

23. Next Implementation Unit

After this foundation is verified, the next specification should define:

02 — Product Data Model & Authentication

That phase should finalize:

user model

session model

authentication flow

email verification

password reset

ownership rules

initial Prisma schema

API contracts

authorization boundaries

Do not begin feature implementation until this design-system/foundation phase passes its verification checklist.
