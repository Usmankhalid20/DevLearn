# UI Context

## Design Direction

The product uses a **dark, minimal, monochrome developer-tool aesthetic**.

The visual goal is:

- Sophisticated.
- Quiet and focused.
- High quality without visual noise.
- Technical but approachable.
- Suitable for long-term daily use.
- Premium without gradients or excessive decoration.

The interface should feel closer to a focused developer/productivity workspace than a colorful student habit tracker.

## Theme

- Dark-first product experience.
- Use near-black backgrounds with tonal surfaces.
- Do not introduce a colorful accent system.
- Use white/gray tonal differences to communicate hierarchy.
- Semantic colors are reserved for meaning such as errors and warnings.

A future light mode must not be introduced casually; it requires an explicit product/design decision.

## Color Tokens

All components must use CSS custom-property tokens. Do not scatter hardcoded hex values through product components.

| Role | CSS Variable | Value | Purpose |
|---|---|---|---|
| Page background | `--bg-base` | `#0D0D0D` | Main application and marketing background |
| Surface | `--bg-surface` | `#151515` | Cards, panels, dialogs, sidebar surfaces |
| Surface elevated | `--bg-surface-elevated` | `#1C1C1C` | Hovered/raised surfaces when needed |
| Border | `--border-default` | `#2A2A2A` | Cards, inputs, separators |
| Primary text | `--text-primary` | `#FFFFFF` | Headings, key values, primary content |
| Secondary text | `--text-secondary` | `#BDBDBD` | Supporting information, metadata |
| Muted UI | `--text-muted` | `#E0E0E0` | Muted controls/icons and subtle UI text where appropriate |
| Interactive emphasis | `--accent-primary` | `#FFFFFF` | Primary buttons, active states, selected controls |
| Error | `--state-error` | `#EF4444` | Error and destructive feedback |
| Warning | `--state-warning` | `#F59E0B` | Warning states |
| Success | `--state-success` | `#22C55E` | Explicit success confirmation when semantic color is needed |

### Usage Rules

- Do not use pure white as a background.
- Do not use `#FFFFFF` for every piece of text. Use hierarchy.
- Do not introduce blue, purple, green, orange, or pink as product-brand accents.
- Semantic green/red/amber are exceptions only for meaning.
- Avoid gradients.
- Avoid neon/glow effects.

## Contribution Graph Colors

The learning contribution graph uses tonal monochrome levels instead of GitHub green.

| Contribution level | Token/value concept |
|---|---|
| Level 0 | `#1A1A1A` |
| Level 1 | `#303030` |
| Level 2 | `#555555` |
| Level 3 | `#858585` |
| Level 4 | `#FFFFFF` |

Exact level thresholds are defined later in product rules and are currently an open question.

These values should ultimately become tokens rather than hardcoded values inside the contribution component.

## Typography

Recommended system:

| Role | Font | Variable |
|---|---|---|
| UI text | Geist Sans or system sans | `--font-sans` |
| Code/numeric technical text | Geist Mono or system mono | `--font-mono` |

Use typography to create hierarchy instead of adding many colors.

Suggested hierarchy:

- Large page title: strong weight, generous spacing.
- Dashboard metrics: high contrast and clear numeric emphasis.
- Body/supporting text: muted gray.
- Metadata: smaller and muted.
- Code/URLs/times when appropriate: mono font.

## Border Radius

Use restrained radii. Avoid excessive pill-shaped UI.

| Context | Guidance |
|---|---|
| Small controls | `rounded-md` |
| Inputs/buttons | `rounded-md` or `rounded-lg` |
| Cards/panels | `rounded-lg` |
| Modals/overlays | `rounded-lg` or `rounded-xl` |
| Pills/tags | Use only when the content model calls for a tag/badge |

Do not use a different radius for every component.

## Component Library

- Use shadcn/ui as the reusable primitive layer.
- Components live in the shared UI component area.
- Product-specific components should compose shared primitives rather than recreate them.
- Do not manually recreate standard dialog, menu, select, tabs, tooltip, button, input, or form primitives unless there is a concrete reason.

## Core Layouts

### Public Website

- Minimal top navigation.
- Strong hero with clear value proposition.
- Generous spacing.
- Product UI previews rather than decorative illustrations.
- Clear CTA to register/login.
- Dark background with tonal sections instead of colorful section backgrounds.

### Authenticated Portal

- Desktop: persistent left navigation/sidebar with a clean main content area.
- Mobile: compact top bar and/or sheet navigation.
- Main content should use a consistent max-width and spacing system.
- Keep important actions visible without overwhelming the dashboard.

### Dashboard

Recommended hierarchy:

1. Greeting/overview.
2. Today's learning metric.
3. Key summary metrics.
4. Today's/Recent learning activity.
5. Contribution graph.
6. Optional goals/analytics widgets.

The dashboard should answer "How am I doing?" quickly.

### Forms

- Keep required fields minimal.
- Optional advanced information can be collapsed or separated so the basic flow stays fast.
- Display validation close to the relevant field.
- Preserve user-entered values after recoverable errors.

### Modals/Sheets

Use for focused actions such as quick add/edit when it improves flow. Avoid turning complex workflows into tiny modal forms.

## Required UI States

Every data-driven view must account for:

- Loading.
- Empty state.
- Error state.
- Success feedback where applicable.
- Disabled/submitting state.
- Mobile/responsive layout.

## Learning Entry UX

Basic learning entry must require only:

- Subject.
- Duration.
- Date/time.

Optional:

- Topic.
- What was learned.
- Notes.
- Resource URL.
- Course.

Support both:

- Manual duration entry.
- Timer-based duration tracking.

The interface must not force users to fill out a long form for a simple session.

## Task vs Learning Visual Language

Tasks and learning sessions must be visually distinguishable.

- **Task** communicates intention/work remaining.
- **Learning session** communicates actual completed learning activity.

Do not use a completed task checkbox as the sole representation of learning progress.

## Contribution Graph

The contribution calendar should visually resemble a familiar activity heatmap while maintaining the product's monochrome identity.

Rules:

- Empty cells remain subtle and dark.
- More learning produces progressively lighter cells.
- Provide accessible text/tooltips with exact date and learning duration.
- Do not rely on color alone; provide text or tooltip information for activity level.

## Motion

Use Motion sparingly for:

- Small transitions.
- Expanding/collapsing UI.
- Progress updates.
- Page/widget transitions when helpful.

Do not use:

- 3D scrolling effects.
- Large parallax scenes.
- Constant decorative movement.
- Motion that delays access to content.

## Accessibility

- Maintain keyboard accessibility.
- Use visible focus states.
- Provide labels for icon-only controls.
- Do not use color alone to communicate important state.
- Maintain readable contrast.
- Ensure timers and charts have accessible textual alternatives.

## Icons

Use Lucide React.

Guidance:

- `h-4 w-4` for compact inline controls.
- `h-5 w-5` for normal buttons/navigation.
- Use consistent stroke-based icons.
- Do not mix unrelated icon styles.

## Design Anti-Patterns

Do not introduce:

- Rainbow dashboards.
- Excessive card nesting.
- Huge decorative illustrations.
- Glassmorphism.
- Heavy shadows everywhere.
- Gradient-heavy branding.
- Excessive rounded pills.
- Unnecessary animations.
- Separate UI components for every individual subject/type.
- Hardcoded example subjects in reusable product components.
