# DevLearn — 05 Marketing Website, Product Positioning & Settings Specification

## Context Files Read Before This Specification

This implementation unit was prepared in accordance with the DevLearn context set:
- [website.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/website.md) — complete 32-section website design, messaging, visual direction, and visitor journey specification.
- [ui-context.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/ui-context.md) — monochrome color system, typography, layout rules, and component tokens.
- [architecture.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/architecture.md) — Next.js App Router structure, server rendering, and settings persistence.
- [code-standards.md](file:///c:/Users/usman/Documents/DevLearn/devlearn-context/code-standards.md) — accessibility, performance, and SEO requirements.

---

## Responsibility Boundary

| Information | Source of Truth |
|---|---|
| Public Website Copy, Visual Direction & Section Order | `website.md` |
| UI Tokens, Dark Monochrome Palette & Typography | `ui-context.md` |
| User Settings Module & Marketing Website Implementation | `05-marketing-and-settings.md` |

---

## 1. Marketing Website Architecture & Visual Direction

### Visual Rules
- **Aesthetic**: Dark, monochrome, minimal, technical, calm, developer-oriented.
- **Prohibited**: Gradients, glassmorphism, neon effects, rainbow accents, 3D scroll animations, and giant decorative illustrations.
- **Tokens**:
  - Background: `#0D0D0D`
  - Surface: `#151515`
  - Elevated: `#1C1C1C`
  - Border: `#2A2A2A`
  - Primary Text: `#FFFFFF`
  - Secondary Text: `#BDBDBD`
  - Muted Text: `#808080`

---

## 2. Visitor Journey & Page Section Sequence

The public landing page (`apps/web/app/page.tsx`) implements the exact sequence defined in `website.md`:

```text
Navbar
  ↓
Hero (Positioning & Value Proposition)
  ↓
Hero Product Preview (Interactive Live Focus Timer & Monochrome Activity Bar)
  ↓
Problem Section ("Learning is everywhere. Your progress is not.")
  ↓
Solution Section (Without DevLearn vs. With DevLearn)
  ↓
How It Works (01 Plan → 02 Track → 03 Capture → 04 See Progress)
  ↓
Product Preview (Dashboard, Session Logger, Contribution Heatmap)
  ↓
Learning Contribution Showcase (DevLearn Grayscale Consistency Calendar)
  ↓
Analytics Showcase (Visual Metrics & Subject Breakdown)
  ↓
Audience Pillars (Students, Developers, Self-Learners)
  ↓
Flexibility Guarantee ("Simple by default. Detailed when you need it.")
  ↓
FAQ (Accordion answering real product questions)
  ↓
Final Call to Action ("Start Tracking Your Learning Today")
  ↓
Minimal Footer
```

### Section Breakdown & Copy Directives

1. **Navbar**:
   - Left: Monogram `[DL]` + Brand `DevLearn`.
   - Center/Right Navigation: *How It Works*, *Features*, *FAQ*.
   - Actions: `Log in` (Ghost button) and `Start Tracking` (Solid white button).
2. **Hero**:
   - Primary Headline: *"Track what you learn. See your progress."*
   - Sub-headline: *"DevLearn helps students and developers track their learning time, completed work, resources, and consistency in one focused workspace."*
   - CTAs: Primary *"Start Tracking"* $\rightarrow$ `/register`, Secondary *"See How It Works"*.
3. **Hero Interactive Live Preview**:
   - Functional interactive stopwatch/timer widget allowing visitors to click *Start*, *Pause*, and *Reset* live on the landing page.
   - Illustrative monochrome learning activity bar (`░ ░ ▒ ▓ ▓ ▒ ░ ▓ █ ▒`).
4. **Problem Section**:
   - Communicates that learning across YouTube, docs, courses, and articles scatters progress and makes it hard to answer *"What did I learn today?"* and *"How much time did I spend?"*.
5. **Solution Section**:
   - Compares scattered learning with DevLearn's structured loop: *Plan $\rightarrow$ Learn $\rightarrow$ Record $\rightarrow$ Complete $\rightarrow$ Review $\rightarrow$ Improve*.
6. **How It Works**:
   - **01 — Decide What to Learn**: Create dynamic subjects or goals.
   - **02 — Track the Learning**: Record time with timer or manual log.
   - **03 — Capture What You Did**: Add topics, notes, or optional resource URLs.
   - **04 — See Your Progress**: Transform minutes into streaks, heatmaps, and analytics.
7. **FAQ**:
   - Answers: *What is DevLearn?*, *Is DevLearn a generic Todo app?*, *Do I need to add YouTube or GitHub?*, *Can I track any subject?*, *Can I use a timer?*.
8. **Final CTA & Footer**:
   - High-contrast call to action leading into the registration flow.
   - Clean footer with product, account, and legal links.

---

## 3. SEO, Performance & Accessibility

1. **SEO Optimization**:
   - Meta title: `DevLearn — Personal Learning Progress Platform for Developers`
   - Meta description: `Track what you learn, measure your time, and see your progress with DevLearn's developer-focused monochrome workspace.`
   - OpenGraph metadata, twitter cards, canonical URLs, semantic HTML5 structure (`<main>`, `<header>`, `<section>`, `<footer>`).
2. **Performance**:
   - Zero heavy decorative assets or client-side bloat.
   - Server-rendered layout shell with interactive components isolated to client boundaries.
3. **Accessibility**:
   - Full keyboard navigation and visible focus rings (`ring-1 ring-white`).
   - High WCAG AA/AAA contrast ratios against `#0D0D0D` background.

---

## 4. User Settings Module (`apps/api/src/modules/settings` & `/settings`)

### Settings Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/settings` | Retrieve user preferences (`timezone`, `dailyGoalMinutes`, `theme`) |
| `PUT` | `/api/settings` | Update user preferences with validation |

### Settings Schema

```typescript
export const updateSettingsSchema = z.object({
  timezone: z.string().min(1).max(100).optional(),
  dailyGoalMinutes: z.number().int().min(1).max(1440).optional(),
  theme: z.enum(['dark', 'system']).optional(),
});
```

### Frontend Settings Portal (`apps/web/app/(portal)/settings/page.tsx`)
- **Daily Target Card**: Configure daily learning goal (minutes) with live visual target indicator.
- **Timezone Preference**: Select IANA timezone for accurate midnight rollover and streak calculations.
- **Account Security**: Password change dialog and active session review.

---

## 5. Verification & Testing Plan

### Automated Tests
1. API Settings integration test: updating daily goal minutes and timezone persists to PostgreSQL.
2. Unauthenticated requests to `/api/settings` receive `401 Unauthorized`.
3. Marketing page static generation passes during `next build`.
4. Responsive viewport tests verify navbar and hero layout integrity across mobile ($<640\text{px}$) and desktop ($>1024\text{px}$).
