# DevLearn — 02 Website Design & Product Marketing Specification

## Purpose

This document defines the public-facing DevLearn website.

It covers the website's purpose, messaging, visual direction, sections, visitor journey, and scope.

It does not define the authenticated user portal in detail.

## Context Files Used

This specification is based on:

- `ai-workflow-rules.md`
- `architecture.md`
- `code-standards.md`
- `progress-tracker.md`
- `project-overview.md`
- `ui-context.md`
- `01-design-system.md`

Those documents remain the source of truth for development workflow, architecture, coding standards, product scope, and the design system.

`02-website.md` owns only the public marketing website experience.

## 1. Product Identity

**Product:** DevLearn

**Positioning:**

> Track what you learn. Measure your time. See your progress.

DevLearn is a personal learning progress platform for students, developers, and self-learners.

It is not positioned as a generic Todo app.

## 2. Website Goal

The public website must take a visitor through:

```text
I have a learning-progress problem
        ↓
DevLearn understands it
        ↓
I understand the solution
        ↓
I see the product
        ↓
I believe it can help me
        ↓
Start Tracking
        ↓
Register / Login
        ↓
User Portal
```

The website is a product explanation and conversion experience, not a second dashboard.

## 3. Problem to Communicate

People learn through courses, YouTube, documentation, articles, books, coding practice, and projects.

Their learning becomes scattered, making it difficult to answer:

- What did I learn today?
- How much time did I actually spend?
- What did I complete?
- Which subjects am I spending time on?
- Am I learning consistently?
- Am I making progress?

Core problem statement:

> You spend hours learning, but your progress is scattered and difficult to see.

Core solution:

> DevLearn turns learning activity into a clear record of time, completed work, resources, and progress.

## 4. Visual Direction

DevLearn's website must feel:

- minimal
- dark
- monochrome
- premium
- technical
- calm
- focused
- developer-oriented

Avoid:

- gradients
- glassmorphism
- neon effects
- rainbow accents
- excessive shadows
- excessive rounded containers
- giant decorative illustrations
- unnecessary 3D effects
- 3D scroll animations
- excessive motion

Motion should support interaction and hierarchy, not become the visual identity.

## 5. Color System

Use the established monochrome design language:

```text
Background      #0D0D0D
Surface         #151515
Elevated        #1C1C1C
Border          #2A2A2A
Primary text    #FFFFFF
Secondary text  #BDBDBD
Muted text      #808080
Soft neutral    #E0E0E0
```

Use the design tokens from `ui-context.md`; do not hard-code these hex values directly in components.

The website should primarily feel black, white, and gray.

## 6. Typography

Use the established DevLearn typography direction:

- Geist Sans or equivalent modern sans-serif
- Geist Mono or equivalent mono font where technical values benefit from it

Use typography for hierarchy instead of excessive color.

Marketing copy must be:

- direct
- credible
- concise
- easy to scan

Avoid exaggerated claims such as “10x your productivity.”

## 7. Homepage Structure

Preferred order:

```text
Navbar
↓
Hero
↓
Problem
↓
Solution
↓
How It Works
↓
Product Preview
↓
Learning Contribution
↓
Analytics / Progress
↓
Why DevLearn
↓
FAQ
↓
Final CTA
↓
Footer
```

Do not add sections just to make the landing page longer.

## 8. Navbar

Keep it minimal.

Suggested:

```text
DevLearn

How It Works
Features
FAQ

Login
Start Tracking
```

The primary CTA should be visually clear but still follow the monochrome design.

## 9. Hero

Primary message direction:

> **Track what you learn. See your progress.**

Supporting message:

> DevLearn helps students and developers track their learning time, completed work, resources, and consistency in one focused workspace.

Primary CTA:

> Start Tracking

Secondary CTA:

> See How It Works

The Hero must answer:

1. What is DevLearn?
2. Who is it for?
3. Why should I care?

Do not lead with technologies such as Express, PostgreSQL, Prisma, or Redis.

## 10. Hero Product Preview

Show a realistic product preview, such as:

```text
Today's Learning

4h 15m

DSA                 1h
System Design       30m
Redis               30m
SQL                 45m
DevOps              1h

Learning Activity
░ ░ ▒ ▓ ▓ ▒ ░ ▓ █ ▒
```

This is illustrative UI, not real usage data.

Use the preview to communicate learning time, activity, and progress.

## 11. Problem Section

Core message direction:

> **Learning is everywhere. Your progress is not.**

Explain that people watch videos, read docs, follow courses, solve problems, and switch between technologies but lose visibility into their actual progress.

The purpose is user recognition, not technical explanation.

## 12. Solution Section

Core message:

> **Turn scattered learning into measurable progress.**

Show:

```text
Without DevLearn
Videos
Docs
Courses
Notes
Random study sessions
        ↓
Hard to know what was accomplished

With DevLearn
Plan
 ↓
Learn
 ↓
Record
 ↓
Complete
 ↓
Review
 ↓
Improve
```

Keep this section concise.

## 13. How It Works

### 01 — Decide What to Learn

Create a subject, goal, or task.

Subjects are user-defined.

Examples such as DSA, Backend, Redis, DevOps, and System Design are illustrative only.

### 02 — Track the Learning

Record learning duration manually or use the timer.

### 03 — Capture What You Did

Optionally record:

- topic
- notes
- course
- resource
- YouTube link
- documentation
- other URLs

These are optional.

### 04 — See Your Progress

Learning activity becomes:

- daily totals
- weekly totals
- history
- analytics
- contribution activity
- consistency

## 14. Product Preview

Show realistic representations of the actual product:

### Dashboard

- Today's learning
- Weekly progress
- Current streak
- Recent sessions
- Contribution graph

### Learning Session

Example:

```text
Redis
45 minutes
Caching
Optional resource
```

### History

Show accumulated learning activity.

Marketing visuals must use the same UI language as the real portal.

## 15. Learning Contribution Section

This is a key DevLearn visual.

The product generates a contribution calendar from learning activity:

```text
Learning sessions
      ↓
Daily learning minutes
      ↓
Contribution level
      ↓
Learning contribution calendar
```

Use grayscale/tonal activity levels.

The graph is conceptually familiar like a contribution calendar, but it represents DevLearn learning activity, not imported GitHub activity.

Suggested message:

> **See your learning consistency at a glance.**

Do not imply GitHub API integration is required.

## 16. Analytics Section

Explain that DevLearn is more than a checklist.

Illustrative examples:

```text
This Week
18h 40m

Learning Days
6

Sessions
32

Most Studied
Backend
```

Subject breakdown can show examples such as:

```text
Backend          8h
DSA              5h
DevOps           3h
System Design    2h
```

These are illustrative, not real production statistics.

## 17. Why Students and Developers Need It

### Students

Help answer:

- Did I study today?
- How much time did I spend?
- What did I cover?
- Am I consistent?

### Developers

Help answer:

- How much time am I spending on backend engineering?
- Am I balancing DSA and system design?
- Which technologies am I actually practicing?
- How consistent am I?

### Self-learners

Provide a flexible record without forcing a rigid course structure.

## 18. Flexibility Message

Core principle:

> **Simple by default. Detailed when you need it.**

Basic entry:

```text
Redis
45 minutes
```

Detailed entry:

```text
Redis
45 minutes
Caching
DevOps Course
YouTube resource
Notes
```

Both must be valid product workflows.

## 19. Resources

Resources are optional.

Possible resources:

- YouTube video
- article
- documentation
- course
- PDF
- book
- GitHub repository
- any other URL

The MVP does not require external APIs for core learning tracking.

The user can track learning without adding a resource.

## 20. FAQ

Suggested questions:

### What is DevLearn?

A learning progress tracker for students and developers.

### Is DevLearn just another Todo app?

No. Tasks represent planned work; learning sessions represent actual learning and time spent.

### Do I need to add a topic every time?

No. Topics are optional.

### Do I need to add YouTube videos?

No. Resources are optional.

### Is GitHub required?

No. The contribution graph is based on DevLearn learning activity.

### Can I track anything?

Yes. Subjects are user-defined.

### Can I use a timer?

Yes.

### Can I manually enter learning time?

Yes.

Only add more FAQ items when they answer real user questions.

## 21. Final CTA

Message direction:

> **Start tracking your learning today.**

Supporting copy:

> Make your learning visible, measurable, and easier to understand.

Primary CTA:

> Start Tracking

Secondary:

> Log In

## 22. Footer

Keep it simple:

```text
DevLearn

Product
How It Works
Features
FAQ

Account
Login
Register

Legal
Privacy
Terms
```

Only expose pages that actually exist.

## 23. User Journey

New visitor:

```text
Visitor
 ↓
Landing Page
 ↓
Understands Problem
 ↓
Understands Solution
 ↓
Sees Product UI
 ↓
Start Tracking
 ↓
Register
 ↓
Email Verification
 ↓
User Portal
```

Returning user:

```text
Landing Page
 ↓
Login
 ↓
User Portal
```

Authenticated users should not be forced back through marketing content.

## 24. Marketing Website vs User Portal

### Marketing Website

Purpose:

> Explain and convert.

Focus on:

- problem
- solution
- value
- product visuals
- credibility
- CTA

### User Portal

Purpose:

> Perform and review learning activity.

Focus on:

- dashboard
- learning sessions
- tasks
- resources
- history
- analytics
- settings

Do not mix the layouts unnecessarily.

## 25. Responsive Design

Support:

- desktop
- laptop
- tablet
- mobile

Mobile is not an afterthought.

Ensure important actions such as starting learning, recording time, and reviewing progress remain usable on small screens.

## 26. Accessibility

Required:

- semantic HTML
- keyboard navigation
- visible focus states
- accessible links and buttons
- correct heading hierarchy
- sufficient contrast
- meaningful alternative text
- reduced-motion support

Do not communicate important information by color alone.

## 27. SEO

The public website should include:

- clear title
- meta description
- semantic headings
- meaningful content
- Open Graph metadata
- canonical metadata where needed
- clean URLs
- sitemap where applicable
- robots configuration where applicable

SEO language must describe the real product naturally.

## 28. Performance

Keep the marketing site lightweight.

Avoid:

- huge images
- video backgrounds
- unnecessary client-side JavaScript
- heavy decorative assets
- excessive animation

Use server rendering where appropriate and load client-side code only where needed.

## 29. Website Scope

Initial public website:

```text
Home
How It Works
Features
FAQ
Login
Register
```

Additional pages such as About, Contact, Privacy, and Terms should be added when they have an actual requirement.

Do not create pages simply to increase page count.

## 30. Out of Scope for This Website Specification

Do not implement or advertise as required:

- GitHub API
- YouTube API
- Google login
- Clerk
- Liveblocks
- Stripe
- fake testimonials
- fake user counts
- fake social proof
- unnecessary integrations

The website must accurately represent the actual DevLearn product.

## 31. Website Success Criteria

A first-time visitor should quickly understand:

1. What DevLearn is.
2. Who it is for.
3. What problem it solves.
4. How learning tracking works.
5. What the contribution graph represents.
6. That optional fields remain optional.
7. That YouTube and GitHub are not required for core tracking.
8. What the product looks like.
9. How to start.

The primary journey is:

```text
Understand
   ↓
Trust
   ↓
Start Tracking
   ↓
Register
   ↓
Use DevLearn
```

## 32. Implementation Rule

Do not build the website from a generic SaaS template and then force DevLearn into it.

Every section must support one of these goals:

- explain the problem
- explain the solution
- demonstrate the product
- establish trust
- lead the visitor toward starting DevLearn

If a section does none of these, it should not be added.

The goal is not a larger landing page.

The goal is **clear product communication through a focused, premium interface**.
