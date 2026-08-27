# DevLearn — 02 Product Data Model & Authentication Specification

## Context Files Read Before This Specification

This implementation unit was prepared in accordance with the DevLearn context set:
- [ai-workflow-rules.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/ai-workflow-rules.md) — development workflow, scope control, missing-requirement handling, and verification expectations.
- [architecture.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/architecture.md) — technology stack, system boundaries, storage invariants, and custom authentication architecture.
- [code-standards.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/code-standards.md) — TypeScript, framework, styling, API, storage, and file-organization rules.
- [ui-context.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/ui-context.md) — visual language, color tokens, typography, component library, layout patterns, and form conventions.
- [01-system-design.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/featrues/01-system-design.md) — project foundation, monorepo setup, Express modular architecture, and Next.js App Router layout shell.

---

## Responsibility Boundary

| Information | Source of Truth |
|---|---|
| Product purpose, core loop, and scope | `project-overview.md` |
| System architecture, boundaries, storage, auth invariants | `architecture.md` |
| Coding rules and conventions | `code-standards.md` |
| Complete Prisma Schema & Custom Authentication Details | `02-data-model-and-auth.md` |

---

## 1. Domain Relational Data Model (PostgreSQL + Prisma)

PostgreSQL is the single source of truth for all user records and learning history. All entities are user-scoped to enforce strict data isolation.

### Entity Relationship Diagram

```text
User (1)
 ├── (1:N) UserSession
 ├── (1:N) VerificationToken
 ├── (1:N) PasswordResetToken
 ├── (1:1) UserSettings
 ├── (1:N) Subject
 │          ├── (1:N) Task
 │          ├── (1:N) LearningSession
 │          ├── (1:N) Goal
 │          └── (1:N) Course
 ├── (1:N) Task
 │          └── (0:N) LearningSession
 ├── (1:N) Goal
 ├── (1:N) Resource
 │          └── (0:N) LearningSession
 ├── (1:N) Course
 │          └── (0:N) LearningSession
 ├── (1:N) LearningSession
 └── (1:N) ContributionDay
```

### Complete Prisma Schema (`apps/api/prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ----------------------------------------------------
// User & Authentication Models
// ----------------------------------------------------

model User {
  id              String    @id @default(uuid())
  email           String    @unique
  passwordHash    String
  name            String?
  isEmailVerified Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Auth Relations
  sessions            UserSession[]
  verificationTokens  VerificationToken[]
  passwordResetTokens PasswordResetToken[]
  settings            UserSettings?

  // Domain Relations
  subjects         Subject[]
  tasks            Task[]
  goals            Goal[]
  resources        Resource[]
  courses          Course[]
  learningSessions LearningSession[]
  contributionDays ContributionDay[]

  @@map("users")
}

model UserSession {
  id               String   @id @default(uuid())
  userId           String
  sessionTokenHash String   @unique
  expiresAt        DateTime
  userAgent        String?
  ipAddress        String?
  createdAt        DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("user_sessions")
}

model VerificationToken {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("verification_tokens")
}

model PasswordResetToken {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("password_reset_tokens")
}

model UserSettings {
  id               String   @id @default(uuid())
  userId           String   @unique
  timezone         String   @default("UTC")
  dailyGoalMinutes Int      @default(60)
  theme            String   @default("dark")
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_settings")
}

// ----------------------------------------------------
// Core Domain Models (Dynamic & User-Scoped)
// ----------------------------------------------------

model Subject {
  id          String   @id @default(uuid())
  userId      String
  name        String
  description String?
  colorToken  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user             User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  tasks            Task[]
  learningSessions LearningSession[]
  goals            Goal[]
  courses          Course[]

  @@unique([userId, name])
  @@index([userId])
  @@map("subjects")
}

model Goal {
  id             String    @id @default(uuid())
  userId         String
  subjectId      String?
  title          String
  description    String?
  targetMinutes  Int
  currentMinutes Int       @default(0)
  startDate      DateTime?
  endDate        DateTime?
  status         String    @default("IN_PROGRESS")
  isAchieved     Boolean   @default(false)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  subject Subject? @relation(fields: [subjectId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([subjectId])
  @@map("goals")
}

model Task {
  id          String    @id @default(uuid())
  userId      String
  subjectId   String?
  title       String
  description String?
  isCompleted Boolean   @default(false)
  completedAt DateTime?
  dueDate     DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  user             User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  subject          Subject?          @relation(fields: [subjectId], references: [id], onDelete: SetNull)
  learningSessions LearningSession[]

  @@index([userId])
  @@index([subjectId])
  @@map("tasks")
}

model Resource {
  id        String   @id @default(uuid())
  userId    String
  title     String
  url       String
  type      String   @default("url")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user             User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  learningSessions LearningSession[]

  @@index([userId])
  @@map("resources")
}

model Course {
  id                       String   @id @default(uuid())
  userId                   String
  subjectId                String?
  title                    String
  platform                 String   @default("Custom")
  url                      String?
  description              String?
  totalDurationMinutes     Int      @default(0)
  completedDurationMinutes Int      @default(0)
  isCompleted              Boolean  @default(false)
  createdAt                DateTime @default(now())
  updatedAt                DateTime @updatedAt

  user             User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  subject          Subject?          @relation(fields: [subjectId], references: [id], onDelete: SetNull)
  learningSessions LearningSession[]

  @@index([userId])
  @@index([subjectId])
  @@map("courses")
}

model LearningSession {
  id              String   @id @default(uuid())
  userId          String
  subjectId       String
  taskId          String?
  resourceId      String?
  courseId        String?
  durationMinutes Int
  date            DateTime
  topic           String?
  learnedNotes    String?
  generalNotes    String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  subject  Subject   @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  task     Task?     @relation(fields: [taskId], references: [id], onDelete: SetNull)
  resource Resource? @relation(fields: [resourceId], references: [id], onDelete: SetNull)
  course   Course?   @relation(fields: [courseId], references: [id], onDelete: SetNull)

  @@index([userId, date])
  @@index([subjectId])
  @@index([taskId])
  @@map("learning_sessions")
}

model ContributionDay {
  id           String   @id @default(uuid())
  userId       String
  date         String   // YYYY-MM-DD (User local calendar date)
  totalMinutes Int      @default(0)
  sessionCount Int      @default(0)
  level        Int      @default(0) // 0 to 4
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
  @@index([userId])
  @@map("contribution_days")
}
```

---

## 2. Authentication System & Security Architecture

### Core Security Rules
1. **No External Auth Vendors**: No Clerk, Supabase Auth, or Firebase.
2. **Argon2id Password Hashing**:
   - Algorithm: `argon2.argon2id`
   - Memory cost: 65,536 KB (64 MB)
   - Time cost: 3 iterations
   - Parallelism: 4 threads
   - Automatic unique salt generation per user.
3. **Session Token Cryptography**:
   - Session tokens generated via `crypto.randomBytes(32).toString('hex')` (256-bit entropy).
   - Stored in the database as SHA-256 hashes (`sessionTokenHash`) to protect sessions against DB exfiltration.
   - Issued to client in an `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` (in production) cookie named `devlearn_session`.
   - Default session TTL: 30 days.
4. **Data Isolation Invariant**:
   - Every protected API route extracts `userId` exclusively from the verified server-side session.
   - Client-provided `userId` parameters in request bodies or query strings are ignored for ownership.

---

## 3. Backend API Module (`apps/api/src/modules/auth`)

### REST Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Creates new User, hashes password, default UserSettings, issues session cookie |
| `POST` | `/api/auth/login` | No | Validates credentials, creates new UserSession, sets cookie |
| `POST` | `/api/auth/logout` | Yes | Deletes active UserSession from DB, clears cookie |
| `GET` | `/api/auth/me` | Yes | Returns authenticated user profile and verification status |
| `POST` | `/api/auth/verify-email` | No | Validates verification token, marks `isEmailVerified: true` |
| `POST` | `/api/auth/resend-verification`| Yes | Generates new verification token and dispatches email |
| `POST` | `/api/auth/forgot-password` | No | Generates short-lived reset token (1 hour) and dispatches reset link |
| `POST` | `/api/auth/reset-password` | No | Validates reset token, updates passwordHash, revokes active sessions |

### Request & Response Schemas (Zod)

```typescript
export const registerSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  name: z.string().min(2).max(50).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
});
```

---

## 4. Frontend Authentication Architecture (`apps/web`)

### App Router Route Organization
```text
app/
 ├── (auth)/
 │    ├── layout.tsx              # Monochrome centered card auth layout
 │    ├── login/page.tsx          # Login form with email/password
 │    ├── register/page.tsx       # Registration form with validation
 │    ├── forgot-password/page.tsx# Password reset request form
 │    ├── reset-password/page.tsx # Password reset submission form
 │    └── verify-email/page.tsx   # Email verification token handler
```

### Client Auth Provider & State Hook (`useAuth`)
- Powered by `@tanstack/react-query` calling `/api/auth/me`.
- Manages `user`, `isLoading`, `isAuthenticated`, `isEmailVerified`, `loginMutation`, `registerMutation`, `logoutMutation`.
- Intercepts 401 Unauthorized responses to clear client query caches and redirect to `/login`.

---

## 5. Verification & Testing Plan

### Automated Integration Tests (`apps/api/tests/auth.test.ts`)
1. User registration creates database record with Argon2id hash and returns session cookie.
2. Duplicate email registration rejected with `409 Conflict`.
3. Valid credentials login returns `200 OK` and updates session token.
4. Invalid password rejected with `401 Unauthorized`.
5. Authenticated `/api/auth/me` returns current user.
6. Logout invalidates session and subsequent `/api/auth/me` returns `401 Unauthorized`.
7. Password reset workflow verifies token validity and prevents reuse.
