# Code Standards

## General

- Prefer simple, explicit code over clever abstractions.
- Keep modules small and single-purpose.
- Fix root causes; do not layer workarounds.
- Do not mix unrelated concerns in one component, route, or service.
- Reuse existing components, hooks, services, validation schemas, and utilities before creating new ones.
- Do not create duplicate components for individual subjects, courses, or resource types when a generic component can handle them.
- Remove dead, dump, unreachable, and obsolete code after refactors.
- Do not add libraries merely because they are popular. Every dependency must solve a defined project problem.
- Prefer platform features and existing dependencies when they are sufficient.

## TypeScript

- Strict TypeScript is required.
- Avoid `any`. Use explicit types, interfaces, discriminated unions, or narrowly scoped generics.
- Do not silence type errors with `as any`, `@ts-ignore`, or `@ts-expect-error` unless there is a documented, unavoidable reason.
- Validate unknown external input at system boundaries before trusting it.
- Keep API request/response types explicit.
- Avoid duplicated type definitions across frontend and backend when a shared contract strategy is appropriate.

## Next.js Frontend

- Use the App Router.
- Prefer server rendering where it provides a clear benefit.
- Use client components only when browser interactivity, local state, effects, timers, or event handlers require them.
- Do not move entire pages to the client just because one child component is interactive.
- Keep page-level data requirements clear and avoid unnecessary duplicate requests.
- Use TanStack Query for client-side server-state workflows that need caching, mutations, refetching, or invalidation.
- Keep reusable feature components independent from specific user data.

## Express.js Backend

- Routes should remain thin.
- Controllers/handlers translate HTTP input/output and delegate business logic to services.
- Services contain business rules and orchestration.
- Database access should remain organized and testable.
- Do not place large Prisma queries, business rules, and response formatting in one route handler.
- Keep middleware focused on one responsibility.
- Use centralized error handling.
- Never leak internal stack traces or database errors to clients in production responses.

## API Rules

- Validate and parse request input before business logic.
- Enforce authentication before protected operations.
- Enforce ownership before reading or mutating user-owned records.
- Use consistent success and error response shapes.
- Use correct HTTP status codes.
- Avoid returning unnecessary database fields.
- Do not expose password hashes, session secrets, reset tokens, or internal identifiers that are not required by the client.
- Support pagination for history/list endpoints once large datasets are possible.

## Authentication and Security

- Passwords must be hashed with a modern password-hashing algorithm; do not store plaintext passwords.
- Session identifiers must use secure randomness and be stored safely.
- Authentication cookies must use `HttpOnly`, `Secure` in production, and an appropriate `SameSite` policy.
- Password reset and email verification tokens must be short-lived, single-use, and stored safely.
- Rate-limit authentication endpoints and other abuse-prone endpoints.
- Validate redirect URLs and external URLs to reduce abuse and open-redirect risks.
- Never trust client-provided user IDs for ownership decisions.
- Use server-side authorization as the final authority.

## Styling

- Use design tokens from `ui-context.md` through CSS variables.
- Do not scatter hardcoded hex colors throughout components.
- Do not introduce arbitrary colors without updating the design system.
- Follow the approved monochrome visual language.
- Avoid gradients, glassmorphism, noisy shadows, and excessive decorative effects.
- Keep borders, spacing, typography, and radii consistent.

## UI Components

- Use shadcn/ui primitives where appropriate.
- Add primitives through the approved component workflow.
- Build product-specific components on top of shared primitives.
- Do not modify third-party internals.
- Components must have meaningful empty, loading, error, and success states when applicable.
- Interactive controls must have accessible labels and keyboard behavior.

## Forms

- Use React Hook Form for non-trivial forms.
- Validate at the client for user feedback and again at the backend for security/correctness.
- Required fields must remain minimal: subject, duration, and date/time for a basic learning session.
- Optional fields must not block submission when empty.

## Data and Storage

- PostgreSQL is the source of truth.
- Use Prisma for relational data access.
- Keep transactions around related writes when atomicity matters.
- Do not store passwords in plaintext.
- Do not store large files in PostgreSQL when file/blob storage is more appropriate.
- Do not treat Redis cache values as permanent records.

## Redis

- Use cache-aside only for data that benefits from caching.
- Set explicit TTLs where appropriate.
- Use clear, namespaced cache keys such as `dashboard:user:{userId}`.
- Invalidate affected keys after successful writes.
- Never make critical correctness depend solely on cached data.

## Background Jobs

- Use BullMQ only when a task is genuinely asynchronous or long-running.
- Never perform long-running third-party synchronization directly inside a request handler.
- Jobs must be idempotent where possible.
- Record enough metadata to retry and diagnose failed jobs.

## Testing

- Unit-test business rules such as contribution calculation and duration handling.
- Integration-test protected API flows and ownership boundaries.
- Test authentication, password reset, and verification edge cases.
- Use end-to-end tests for critical user journeys such as registration → login → create learning session → view dashboard.
- Do not test implementation details when behavior is what matters.

## Error Handling

- Fail predictably.
- Use typed/structured application errors.
- Show user-friendly messages in the UI.
- Log diagnostic information server-side without exposing secrets.
- Do not swallow errors silently.

## File Organization

### Frontend

- `app/` — routes/pages/layouts.
- `components/ui/` — shared UI primitives.
- `components/` — reusable product components.
- `features/` — feature-specific UI and client logic grouped by domain.
- `lib/` — frontend utilities, API client, configuration, shared helpers.
- `hooks/` — reusable React hooks.
- `types/` — frontend/shared type definitions where appropriate.

### Backend

- `src/config/` — environment and application configuration.
- `src/middleware/` — authentication, validation, logging, rate limiting, etc.
- `src/modules/` — domain modules.
- `src/database/` — Prisma/database setup and helpers.
- `src/jobs/` — BullMQ workers/jobs if introduced.
- `src/utils/` — truly generic server utilities.

## Naming

- Use descriptive names that communicate intent.
- Avoid vague names such as `data`, `item`, `thing`, or `helper` when a precise name is possible.
- Keep naming consistent between domain, API, and database layers.

## Performance

- Do not optimize prematurely.
- Measure before introducing caching or memoization that complicates code.
- Avoid unnecessary API calls and duplicate data fetching.
- Paginate potentially large history/resource lists.
- Use Redis where repeated expensive reads justify it.

## Definition of Done for Code

A change is not complete until:

- It follows these standards.
- It uses reusable/dynamic code.
- Validation and authorization are present where required.
- Relevant tests pass.
- No unnecessary duplicate code remains.
- Documentation is updated when architecture or scope changes.
