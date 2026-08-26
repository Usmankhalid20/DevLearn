# DevLearn SaaS

## Overview

DevLearn is a personal learning-progress application for students, developers, and self-learners. It helps users record what they learn, how much time they spend learning, what optional resources they use, what tasks they complete, and how consistently they learn over time. The product begins as a focused personal tracker but is designed as a multi-user SaaS architecture suitable for a portfolio project and future product expansion.

## Product Problem

People often spend time learning DSA, backend engineering, system design, SQL, DevOps, courses, documentation, and videos, but the activity is scattered across notebooks, browser history, course platforms, and memory. They may know they were "busy learning" without being able to answer:

- What did I actually learn?
- How much time did I spend learning?
- What subjects received most of my time?
- What did I complete this week?
- Am I learning consistently?
- What progress have I made over the last month?

The product turns that scattered activity into a measurable learning history.

## Product Promise

> **Track what you learn. Measure your time. See your progress.**

## Audience

Primary users:

- Students.
- Junior and mid-level developers.
- Self-taught developers.
- People following technical courses.
- Interview-preparation learners.
- Anyone learning multiple technical subjects at the same time.

## Product Principles

- Simple by default, detailed when needed.
- User-defined and dynamic rather than hard-coded around example subjects.
- Tasks represent plans; learning sessions represent actual activity.
- Actual learning minutes drive the contribution activity graph.
- Optional resources enrich a session but are never required.
- Private by default.
- No paid external API is required for core functionality.

## Core User Flow

### Visitor Flow

1. Visitor lands on the public marketing website.
2. Website explains the learning-tracking problem.
3. Website explains the product approach and shows a real product preview.
4. Visitor chooses to start tracking.
5. Visitor registers or logs in.
6. Authenticated user enters the user portal.

### First-Time User Flow

1. User sees a lightweight welcome/onboarding experience.
2. User can optionally create subjects such as DSA, Backend, SQL, Redis, or any custom subject.
3. User can immediately create a first learning session without completing a long setup wizard.

### Daily Learning Flow

1. User creates a task or directly creates a learning session.
2. User selects a subject.
3. User records learning duration manually or through the timer.
4. User may optionally add topic, notes, resource URL, course, or other metadata.
5. User saves/completes the session.
6. The system stores the learning session in PostgreSQL.
7. The system updates/invalidate relevant cached views.
8. Daily learning totals update.
9. The contribution calendar reflects that day's learning activity.
10. The dashboard and analytics show the updated progress.

## Core Domain Concepts

### Subject

A user-defined area of learning. Examples are only examples and must not be hard-coded.

### Goal

An optional target such as a number of learning hours or a learning objective.

### Task

Something the user intends to learn or complete.

### Learning Session

A record of actual learning activity. Minimum fields are subject, duration, and date/time. Topic, notes, resource, and course information are optional.

### Resource

An optional supporting item such as a YouTube URL, article, documentation page, book, PDF/link, or GitHub repository.

### Course

An optional structure for users who want to organize learning into courses/modules/lessons. The final hierarchy is still an open question.

### Contribution

A GitHub-style calendar generated from the user's own learning activity. It is not GitHub activity and does not require the GitHub API.

## Features

### Marketing Website

- Clear explanation of the learning-tracking problem.
- Product purpose and positioning.
- Explanation of how the system works.
- Product/dashboard previews.
- Learning contribution graph preview.
- Feature overview.
- FAQ.
- Clear registration/login call-to-action.

### Authentication

- Register with email and password.
- Login with email and password.
- Email verification.
- Password reset.
- Secure HTTP-only session cookies.
- Authentication and ownership enforcement.

### Learning Tracking

- User-defined subjects.
- Manual learning duration entry.
- Start/pause/resume/stop timer flow.
- Editable learning history.
- Optional topic.
- Optional "what I learned" note.
- Optional general notes.
- Optional associated resource.
- Optional course association.

### Tasks

- Create tasks.
- Mark tasks complete.
- Edit/delete tasks.
- Associate a task with learning sessions when useful.
- Do not equate task completion with learning duration.

### Resources

- Store optional URLs.
- Support generic resource types.
- YouTube links are supported as normal URLs in MVP.
- API-based metadata retrieval is a future enhancement, not an MVP requirement.

### Progress and Contributions

- Daily learning total.
- Weekly learning total.
- Monthly learning total.
- Learning contribution calendar.
- Current/best streak when rules are finalized.
- Subject distribution.
- Recent learning activity.

### Analytics

Initial analytics should focus on useful information rather than many charts:

- Total learning time.
- Learning by subject.
- Learning by day/week/month.
- Number of sessions.
- Consistency/streak.
- Goal progress when goals are used.

### User Portal

Core navigation:

- Dashboard.
- Learning.
- Tasks.
- Resources.
- History.
- Analytics.
- Settings.

## Scope

### In Scope — MVP

- Public marketing website.
- Registration/login.
- Email verification and password reset.
- User ownership and private learning data.
- User-defined subjects.
- Learning sessions.
- Manual duration tracking.
- Timer-based duration tracking.
- Tasks and task completion.
- Optional topics/notes.
- Optional resource URLs.
- Learning history.
- Daily/weekly/monthly totals.
- Learning contribution calendar.
- Basic analytics.
- Dark monochrome design system.
- PostgreSQL persistence.
- Express.js REST API.
- Prisma ORM.
- Redis caching where justified.
- Docker-based local development.

### Out of Scope — MVP

- Google login.
- Clerk authentication.
- Liveblocks/collaborative editing.
- GitHub API synchronization.
- YouTube API integration.
- Payments/Stripe.
- File uploads/blob storage.
- Public profiles/sharing unless separately approved.
- Complex admin portal.
- Microservices.
- Large-scale social/community features.

## Future Enhancements

Only add these after the core product is stable and the feature has a real product reason:

- YouTube metadata lookup.
- GitHub activity integration.
- Additional learning/coding platform integrations.
- Public learning profiles.
- Paid SaaS plans.
- Email reminders.
- Advanced goals and milestones.
- More detailed course structures.
- Export/import of learning history.

## Success Criteria

1. A visitor can understand the problem, value proposition, and product flow from the marketing website.
2. A user can register, verify their email, log in, and access a private user portal.
3. A user can create a learning session using only subject, duration, and date/time.
4. A user can optionally attach topic, notes, course, and resource information.
5. A user can create and complete tasks without the system confusing task completion with learning duration.
6. A user's dashboard shows accurate daily and weekly learning totals.
7. The contribution calendar accurately reflects daily learning activity according to the finalized threshold rules.
8. User A cannot access User B's private learning data.
9. Redis caching can improve repeated reads without becoming a source of truth.
10. The core MVP works without requiring paid external APIs or SaaS vendors.
11. Core user flows have automated coverage and the production build passes.
