# DevLearn — 02 Product Data Model & Authentication Specification

## Purpose

This specification defines the complete domain data model, Prisma database schema, and custom authentication system for DevLearn.

---

## 1. Domain Data Model & Relational Schema

PostgreSQL is the source of truth. All domain entities belong to an authenticated `User` and enforce strict data isolation.

### Entity Relationships

```text
User
 ├── UserSession (1:N)
 ├── VerificationToken (1:N)
 ├── PasswordResetToken (1:N)
 ├── UserSettings (1:1)
 ├── Subject (1:N)
 │    └── LearningSession (1:N)
 ├── Task (1:N)
 │    └── LearningSession (0:N) [Optional task reference]
 ├── Goal (1:N)
 ├── Resource (1:N)
 ├── Course (1:N)
 └── ContributionDay (1:N)
```

### Models Detailed

1. **User**: `id`, `email`, `passwordHash`, `name`, `isEmailVerified`, `createdAt`, `updatedAt`
2. **UserSession**: `id`, `userId`, `sessionTokenHash`, `expiresAt`, `createdAt`, `userAgent`, `ipAddress`
3. **VerificationToken**: `id`, `userId`, `token`, `expiresAt`, `createdAt`
4. **PasswordResetToken**: `id`, `userId`, `token`, `expiresAt`, `createdAt`
5. **UserSettings**: `id`, `userId`, `timezone`, `dailyGoalMinutes`, `theme`, `createdAt`, `updatedAt`
6. **Subject**: `id`, `userId`, `name`, `description`, `colorToken`, `createdAt`, `updatedAt`
7. **Task**: `id`, `userId`, `subjectId` (opt), `title`, `description`, `isCompleted`, `completedAt`, `dueDate`, `createdAt`, `updatedAt`
8. **Goal**: `id`, `userId`, `title`, `targetMinutes`, `startDate`, `endDate`, `isAchieved`, `createdAt`, `updatedAt`
9. **Resource**: `id`, `userId`, `title`, `url`, `type`, `createdAt`, `updatedAt`
10. **Course**: `id`, `userId`, `title`, `description`, `createdAt`, `updatedAt`
11. **LearningSession**: `id`, `userId`, `subjectId`, `taskId` (opt), `resourceId` (opt), `courseId` (opt), `durationMinutes`, `date`, `topic`, `learnedNotes`, `generalNotes`, `createdAt`, `updatedAt`
12. **ContributionDay**: `id`, `userId`, `date`, `totalMinutes`, `sessionCount`, `level`, `updatedAt`

---

## 2. Authentication System & Security Architecture

### Authentication Principles
- **No external auth vendors** (No Clerk, No Firebase).
- **Password Hashing**: Argon2id (`argon2` package) with salt and high memory cost parameter.
- **Session Management**: Server-side `UserSession` persistence with a secure 256-bit cryptographically random token stored in an `HttpOnly`, `SameSite=Lax`, `Secure` (in prod) cookie named `devlearn_session`.
- **Ownership Invariant**: All data queries enforce `where: { userId: req.user.id }`.

### Auth Endpoints

| Method | Route | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new account, hash password, create session cookie & verification token | No |
| `POST` | `/api/auth/login` | Validate credentials, issue session cookie | No |
| `POST` | `/api/auth/logout` | Invalidate active session in DB & clear cookie | Yes |
| `GET` | `/api/auth/me` | Return active user profile and verification status | Yes |
| `POST` | `/api/auth/verify-email` | Verify email with token | No |
| `POST` | `/api/auth/forgot-password` | Request password reset token | No |
| `POST` | `/api/auth/reset-password` | Reset password using valid reset token | No |

---

## 3. Frontend Authentication UX

- **`/register`**: Clean monochrome signup form (Email, Password, Name) with real-time validation via React Hook Form + Zod.
- **`/login`**: Clean monochrome login form with error states and "Forgot Password" link.
- **`/forgot-password` & `/reset-password`**: Token-based password recovery flow.
- **Auth Provider & Hook (`useAuth`)**: Client context tracking `user`, `isLoading`, `isAuthenticated`, `login`, `register`, `logout` via TanStack Query.
