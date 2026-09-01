DevLearn Mobile App - Context Document
Overview
DevLearn is a learning tracking platform with a natural mobile use case. The mobile app is designed for quick, frictionless learning entry and progress tracking, complementing the web platform.

Core Philosophy
Same Backend: Web and mobile apps share the same API; no separate business logic for mobile

Mobile-First Features: Optimized for quick capture, timers, and daily progress viewing

Consistent Design: Monochrome design system across website, web portal, and mobile app

Mobile App Features (MVP)

1. Home Dashboard
   Daily progress summary

Quick stats: Today's total time, current streak

Quick action: "+ Log Learning"

2. Quick Learning Entry
   Minimal input: "What did you learn?" + "How long?"

All other fields optional

3-5 second recording flow

3. Timer
   Start/Pause/Finish controls

Real-time display: HH:MM:SS

Auto-log on finish

4. Learning History
   List of past sessions

Filter by date/subject

Edit/delete entries

5. Progress View
   Today's breakdown by subject:

text
Today: 2h 45m
DSA 1h
Redis 30m
SQL 45m
DevOps 30m
7-day streak display

Contribution graph

6. Settings
   Profile management

Notification preferences

Theme settings (light/dark)

Excluded from Mobile MVP
Admin Portal functionality

Complex analytics dashboards

Heavy data manipulation tools

Technology Stack
Layer Technology
Mobile Framework React Native + Expo
Language TypeScript
Backend API Express.js REST API
Web Client Next.js
Database PostgreSQL
ORM Prisma
Cache Redis
Auth Custom Authentication
Architecture
text
DevLearn API
Express.js
│
┌─────────────┴─────────────┐
│ │
Next.js React Native
Web Mobile
│ │
└─────────────┬─────────────┘
↓
Same REST API
API Endpoints (Shared)
text
POST /learning-sessions
GET /dashboard
GET /analytics
POST /tasks
GET /progress
GET /history
GET /streaks
Design Principles
UI Consistency
Monochrome color scheme

Shared design tokens

Consistent typography

Unified component library

Mobile Optimization
Touch-friendly interactions

Swipe gestures where appropriate

Bottom navigation

Pull-to-refresh

State Management
React Context or Zustand for global state

AsyncStorage for offline caching

Sync with backend on reconnect

Development Roadmap
Phase 1: Foundation
□ React Native + Expo setup
□ TypeScript configuration
□ Navigation setup (React Navigation)
□ API client configuration (Axios)
□ Authentication flow (login/register)
Phase 2: Core Features
□ Home dashboard
□ Learning session creation
□ Timer functionality
□ Session history list
Phase 3: Progress & Analytics
□ Daily/weekly progress view
□ Contribution graph
□ Streak tracking
□ Subject breakdown
Phase 4: Polish
□ Offline support
□ Push notifications
□ Deep linking
□ Performance optimization
Mobile-Specific UX Flows
Learning Entry Flow
text
Open App → Tap "+" → Select Subject →
Enter Duration → (Optional notes) → Save →
View updated progress
Timer Flow
text
Open Timer → Select Subject → Start →
Study → Pause/Resume → Finish →
Auto-save session
Daily Check Flow
text
Open App → View Today's Progress →
Check Streak → Review History →
Log Quick Entry
Architecture Decisions
DON'T
Don't create mobile-specific backend logic

Don't use if (mobile) conditions in API

Don't build separate mobile database

Don't copy entire web portal to mobile

DO
Share TypeScript types between web and mobile

Use same REST API endpoints

Cache data locally for offline access

Build mobile as a client, not a separate system

Build Order (Full Platform)
DevLearn Website

Backend Foundation

Authentication System

User Web Portal

Learning Tracking

Contribution System

Analytics

Admin Portal

Mobile App

Optional Integrations

Success Metrics
Technical
App size < 20MB

Cold start < 2 seconds

Session logging < 5 seconds

Offline capability for recent data

User Experience
Daily active usage

Session completion rate

Streak maintenance

User retention

Notes for Development
React Native + Expo allows single codebase for iOS/Android

Share TypeScript interfaces with web backend

Use Expo's built-in features (notifications, camera, etc.)

Test on both iOS and Android simulators

Consider using Expo EAS for builds
