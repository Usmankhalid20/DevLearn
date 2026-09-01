# DevLearn — Project Overview & Problem Statement

> **"Track what you learn. Measure your time. See your progress."**

DevLearn is a full-stack, multi-user SaaS platform and developer companion designed to transform unstructured, scattered learning into a quantifiable, structured, and verifiable learning history. It equips software engineers, computer science students, and self-taught developers with deep focus timers, milestone recognition, progress analytics, and a signature dark monochrome 52-week activity heatmap.

---

## 1. What is DevLearn?

Modern self-directed technical education happens across a myriad of disjointed platforms: documentation tabs, video tutorials, GitHub repositories, interactive coding challenges, textbooks, and online courses. While learners spend hours studying Data Structures & Algorithms, Backend Engineering, Cloud Infrastructure, Database Internals, and System Design, their efforts leave no centralized trace.

**DevLearn acts as the personal ledger and telemetry platform for technical learning.**

It bridges the gap between **intention** (what you plan to learn) and **execution** (the verified focus time you spend studying). DevLearn tracks actual study minutes per topic, provides real-time stopwatch timers, maintains course curriculums, organizes resource bookmarks, tracks streaks with built-in grace periods, calculates analytics, and renders a GitHub-style activity contribution calendar powered purely by your focus minutes.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                              THE DEVLEARN LOOP                              │
└─────────────────────────────────────────────────────────────────────────────┘
  1. PLAN           2. FOCUS & TIME       3. LOG & ENRICH       4. PROGRESS
 ┌──────────┐      ┌───────────────┐     ┌───────────────┐     ┌─────────────┐
 │ Define   │  ──> │ Run Live      │ ──> │ Capture Topic,│ ──> │ Heatmap,    │
 │ Subjects │      │ Timer or Log  │     │ Notes, URLs,  │     │ Streaks, &  │
 │ & Tasks  │      │ Minutes       │     │ & Course Tags │     │ Analytics   │
 └──────────┘      └───────────────┘     └───────────────┘     └─────────────┘
```

---

## 2. Why Do We Need DevLearn? (The Problem Space)

### The Dilemma of Modern Self-Learning
Self-taught engineers and students face distinct challenges that traditional productivity or note-taking apps fail to address:

1. **Fragmented Learning Footprint**:
   - A learner might study PostgreSQL on Monday via official docs, practice LeetCode on Tuesday, watch a Distributed Systems lecture on YouTube on Wednesday, and read an architecture book on Thursday.
   - At the end of the month, their learning footprint is scattered across browser histories, bookmarks, and disjointed notes. They cannot easily answer: *"How many hours did I dedicate to Distributed Systems this month?"*

2. **The "Illusion of Competence" & Passive Consumption**:
   - Watching hours of technical video playlists often creates a false sense of mastery without real focus.
   - Without measuring active, dedicated focus time, learners overestimate their actual practice hours and lose track of consistency.

3. **Separation of Plans vs. Reality**:
   - Traditional todo lists treat completing a task as binary (done / not done).
   - In technical learning, spending 3 hours wrestling with an operating systems concept is immense progress, even if the task isn't "checked off." Tasks represent *intent*; learning sessions represent *reality*.

4. **Lack of Visual Momentum & Accountability**:
   - Developers love GitHub's contribution graph because green squares create psychological momentum.
   - However, reading documentation, architecting projects, and studying theory produce zero Git commits. DevLearn provides an equivalent **52-week activity heatmap** powered specifically by learning minutes.

5. **Vendor Lock-in & Bloated Generic Tools**:
   - Generic productivity suites (Notion, Jira, Trello) require tedious custom template setups, lack purpose-built learning timers, and lack streak algorithms with timezone-aware grace periods.

---

## 3. What Problems Does DevLearn Solve?

| Problem | DevLearn Solution |
|---|---|
| **Scattered study activity across platforms** | Single unified ledger organizing study history by dynamic, user-defined subjects. |
| **No accurate measurement of study hours** | Live stopwatch timer and manual session logging down to the exact minute. |
| **Confusing task completion with actual learning** | Explicit separation: **Tasks** define future intentions; **Learning Sessions** record verified focus duration. |
| **Lost study resources and URLs** | Embedded Resource Library linking documentation, articles, GitHub repos, and video links directly to learning sessions. |
| **Lack of structured course tracking** | Dedicated Courses module tracking syllabus progress, estimated vs completed durations, and completion percentages. |
| **Difficulty maintaining study streaks** | Built-in Streak Engine calculating consecutive study days with automated grace periods for active learners. |
| **No long-term visibility into subject balance** | Visual analytics showing subject time distribution, 30-day focus trends, and average session lengths. |
| **Lack of verifiable milestones** | Automated Milestone Badge Engine awarding achievements for focus volume, consistency streaks, and subject breadth. |
| **Privacy and vendor lock-in concerns** | Private-by-default architecture with 1-click JSON and CSV data export capabilities. |

---

## 4. Target Audience

DevLearn is tailored for anyone who treats technical learning as a serious, measurable craft:

* **Computer Science & Engineering Students**: Balancing coursework, DSA practice, and personal projects.
* **Self-Taught & Transitioning Developers**: Building a disciplined daily study habit to break into the tech industry.
* **Junior & Mid-Level Engineers**: Leveling up in system design, new languages, cloud architecture, and framework internals.
* **Technical Interview Candidates**: Tracking dedicated problem-solving hours across algorithms, database indexing, and distributed systems.
* **Lifelong Tech Learners**: Maintaining multi-year records of books, courses, and engineering papers studied.

---

## 5. Core Product Principles

1. **Simple by Default, Deep When Needed**:
   - A learning session requires only three fields to save: `Subject`, `Duration`, and `Date`.
   - Topics, detailed takeaways, code notes, course associations, and resource URLs remain strictly optional.

2. **Dynamic & User-Defined (No Hard-Coded Taxonomy)**:
   - Subjects are entirely created and customized by each user (e.g., *Rust, Kubernetes, Linux Internals, Machine Learning*).

3. **Tasks $\neq$ Learning Duration**:
   - Tasks represent intended milestones. Learning sessions record actual invested time. A session can link to a task, but task completion does not fabricate session hours.

4. **Verifiable Activity Drives Visualization**:
   - The 52-week contribution heatmap is calculated strictly from stored database records of learning minutes, categorized into a clean 5-tier grayscale spectrum.

5. **Zero Mandatory Paid External Vendors**:
   - Core features function independently without requiring third-party subscriptions (e.g., Clerk, Google Cloud APIs, YouTube API keys, or GitHub synchronization).

6. **Privacy & Data Portability by Default**:
   - Every learner's study data is strictly isolated. Full data export in JSON and CSV formats is available at any time.

---

## 6. Product Evolution & Multi-Client Vision

DevLearn is architected as a modular ecosystem sharing a centralized API:

* **Web Application (`apps/web`)**: Next.js 15 App Router interface featuring the public marketing showcase, deep analytics dashboards, interactive courses/tasks management, and system administration portal.
* **Mobile Companion (`apps/mobile`)**: React Native / Expo application optimized for instant capture, 1-tap quick logging, and live study timers on the go.
* **Backend API (`apps/api`)**: Node.js & Express modular monolith backed by PostgreSQL and Redis caching.
