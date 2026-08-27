# ⚠️ Frontend Development Warning & Code Quality Rules

## Purpose

This document defines mandatory frontend development rules for this project.

**Before writing any new frontend code, always inspect the existing codebase first.**

The goal is to prevent:

- Duplicate code
- Dump code
- Unnecessary components
- Large files containing unrelated logic
- Repeated UI implementations
- Hardcoded UI that should be dynamic
- Poor component architecture
- Inconsistent design patterns

---

# 🚨 CRITICAL RULE: CHECK BEFORE YOU CREATE

## Before creating ANY new code

Always check whether the project already contains:

- [ ] A similar component
- [ ] An existing button component
- [ ] An existing input component
- [ ] An existing modal/dialog
- [ ] An existing card component
- [ ] An existing table
- [ ] An existing layout
- [ ] An existing hook
- [ ] An existing utility function
- [ ] An existing API function
- [ ] An existing TypeScript type or interface
- [ ] An existing animation
- [ ] An existing icon implementation
- [ ] An existing feature that can be extended

### Required process

> **SEARCH FIRST → UNDERSTAND EXISTING CODE → REUSE IF POSSIBLE → CREATE ONLY WHEN NECESSARY**

Do not immediately create a new component just because it is faster.

---

# 🧩 COMPONENT REUSABILITY RULES

## Components must be reusable

Do not create components that only work for one hardcoded situation if they can reasonably be reused.

### ❌ Bad

Creating multiple similar components:

```text
UserButton.tsx
AdminButton.tsx
DeleteButton.tsx
SaveButton.tsx
```

when one reusable component can handle the variants.

### ✅ Better

Use a reusable component:

```text
Button
├── variant
├── size
├── loading
├── disabled
└── icon
```

Use props and composition instead of duplicating components.

---

# 🔄 MAKE UI DYNAMIC

Do not hardcode repeated UI elements.

### ❌ Avoid

```tsx
<Card title="Prompt 1" />
<Card title="Prompt 2" />
<Card title="Prompt 3" />
```

### ✅ Prefer

Use data-driven rendering:

```tsx
{
  prompts.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} />);
}
```

---

## Dynamic component requirements

Components should support dynamic data when appropriate.

Examples:

- Cards should accept data through props.
- Tables should support dynamic rows and columns where appropriate.
- Navigation should be generated from configuration/data.
- Dashboard widgets should receive dynamic statistics.
- Lists should render from arrays.
- API data should not be manually duplicated in the UI.
- Status badges should use reusable variants.
- Forms should be reusable where possible.

---

# 📁 DO NOT PUT EVERYTHING IN ONE FILE

## ❌ Never create a giant component file

Do not put:

- Page layout
- API calls
- Business logic
- Forms
- Modals
- Tables
- Cards
- Helper functions
- Types
- Constants

all inside one file.

This creates difficult-to-maintain code.

---

## ✅ Separate responsibilities

Example:

```text
features/
└── prompts/
    ├── components/
    │   ├── PromptCard.tsx
    │   ├── PromptGrid.tsx
    │   ├── PromptFilters.tsx
    │   └── PromptForm.tsx
    │
    ├── hooks/
    │   └── usePrompts.ts
    │
    ├── services/
    │   └── prompt.service.ts
    │
    ├── types/
    │   └── prompt.types.ts
    │
    └── utils/
        └── prompt.utils.ts
```

### Important

Do not over-engineer small features.

Split files based on **clear responsibility**, not unnecessarily.

---

# 🗑️ NO DUMP CODE

## Dump code is forbidden

Do not write code that is:

- Unused
- Duplicated
- Temporary but never removed
- Commented-out old code
- Placeholder logic left in production
- Fake functions
- Empty unnecessary abstractions
- Unused imports
- Unused variables
- Dead components
- Duplicate helper functions
- Copy-pasted logic

### ❌ Do not do this

```tsx
// Old code
// const handleSubmitOld = () => {
//   ...
// };
```

If the code is no longer needed, remove it.

Git exists for history.

---

# 🔍 SEARCH THE PROJECT BEFORE WRITING CODE

Before adding a new feature:

### Step 1: Inspect the relevant folders

Check:

```text
components/
features/
app/
pages/
hooks/
lib/
utils/
services/
types/
```

### Step 2: Search for existing implementations

Search for:

- Component names
- Similar UI
- Existing functions
- Existing API calls
- Existing hooks
- Existing types

### Step 3: Reuse or extend

If an existing component is close to the requirement:

- Reuse it.
- Add a prop if necessary.
- Extend it carefully.

Do not duplicate it.

### Step 4: Create only if necessary

Create a new component only when:

- No existing component can handle the requirement.
- Reusing the existing component would make it unnecessarily complex.
- The new component represents a genuinely separate responsibility.

---

# 🎨 UI COMPONENT RULES

## Use the existing design system

Before creating custom UI elements, check whether the project already has:

- Buttons
- Inputs
- Selects
- Dialogs
- Dropdowns
- Tables
- Cards
- Tabs
- Tooltips
- Badges
- Skeleton loaders

If the project uses a UI library such as **shadcn/ui**, reuse and compose existing components instead of rebuilding them unnecessarily.

---

# ⚙️ LOGIC SEPARATION

Keep UI and business logic reasonably separated.

### ❌ Avoid

```tsx
export default function Dashboard() {
  // 500 lines of API logic
  // 300 lines of calculations
  // 200 lines of UI
}
```

### ✅ Prefer

```text
DashboardPage
      │
      ├── DashboardHeader
      ├── DashboardStats
      ├── DashboardCharts
      └── DashboardRecentActivity
```

Move reusable or complex logic into:

```text
hooks/
services/
utils/
lib/
```

when appropriate.

---

# 🧠 REUSABLE LOGIC

If the same logic is used in multiple places, do not copy it.

Consider:

- Custom hooks
- Utility functions
- Shared services
- Shared constants
- Shared types

### Example

Instead of duplicating API logic:

```tsx
fetch("/api/prompts");
```

in multiple unrelated files, centralize the logic when appropriate.

Example:

```text
services/
└── prompt.service.ts
```

---

# 📦 TYPESCRIPT RULES

Do not duplicate types across multiple files.

### ❌ Bad

```tsx
type User = {
  id: string;
  name: string;
};
```

repeated in many components.

### ✅ Better

Create shared types when the type is used across the feature:

```text
types/
└── user.types.ts
```

Or keep types close to the feature when they are feature-specific.

---

# 🔌 API AND DATA RULES

Do not hardcode data that should come from the backend.

### ❌ Avoid

```tsx
const users = [
  { id: 1, name: "John" },
  { id: 2, name: "Sarah" },
];
```

if the page is supposed to display real users.

### Use mock data only when:

- The backend is not ready.
- The mock is clearly temporary.
- The code is structured so real API integration is easy.

Remove unnecessary mock data when the real API is available.

---

# 🧹 KEEP FILES CLEAN

Every frontend file should have a clear responsibility.

Before finishing work, check:

- [ ] Are there unused imports?
- [ ] Are there unused variables?
- [ ] Is code duplicated?
- [ ] Is the component too large?
- [ ] Can repeated logic be extracted?
- [ ] Does an existing component already solve this problem?
- [ ] Is the UI dynamic where it should be?
- [ ] Are props and types properly defined?
- [ ] Is there unnecessary hardcoding?
- [ ] Is temporary code removed?

---

# 🚫 DO NOT CREATE DUPLICATE COMPONENTS

Before creating:

```text
NewButton.tsx
NewModal.tsx
NewCard.tsx
NewTable.tsx
NewInput.tsx
```

first check whether the project already has:

```text
Button.tsx
Modal.tsx
Card.tsx
Table.tsx
Input.tsx
```

If it exists, reuse or extend it.

---

# 📐 COMPONENT DESIGN PRINCIPLES

Components should follow these principles:

## Single Responsibility

A component should have one clear purpose.

## Reusability

If the UI pattern appears multiple times, consider making it reusable.

## Flexibility

Use props for differences.

## Maintainability

Keep components understandable.

## Composition

Prefer combining smaller components instead of creating huge components.

---

# ⚠️ DO NOT OVER-ABSTRACT

Reusability does **not** mean creating a component for every small element.

### ❌ Bad over-abstraction

```text
PageTitleText.tsx
PageTitleContainer.tsx
PageTitleWrapper.tsx
```

for something used only once.

### ✅ Good judgment

Create reusable components when:

- They are used multiple times.
- They represent a meaningful UI pattern.
- They reduce duplication.
- They improve maintainability.

---

# 🏗️ PAGE DEVELOPMENT RULE

A page should primarily:

1. Define the page structure.
2. Connect data.
3. Compose existing components.

A page should **not** contain every piece of UI logic.

### Preferred structure

```text
app/
└── dashboard/
    └── page.tsx

components/
├── dashboard/
│   ├── DashboardHeader.tsx
│   ├── StatsCards.tsx
│   └── RecentActivity.tsx
```

---

# 🔎 BEFORE WRITING NEW CODE — REQUIRED CHECKLIST

Before adding code, ask:

- [ ] Does this component already exist?
- [ ] Is there a similar component I can reuse?
- [ ] Can I extend an existing component with props?
- [ ] Does this hook already exist?
- [ ] Does this utility already exist?
- [ ] Is there already an API service for this?
- [ ] Is this type already defined?
- [ ] Am I duplicating logic?
- [ ] Am I hardcoding something that should be dynamic?
- [ ] Am I putting too much code in one file?
- [ ] Is this new code actually necessary?

---

# 🚨 FINAL DEVELOPMENT RULE

## NEVER FOLLOW THIS PROCESS

```text
Requirement
    ↓
Immediately write new code
    ↓
Create duplicate components
    ↓
Copy and paste existing logic
    ↓
Leave unused code
```

---

## ALWAYS FOLLOW THIS PROCESS

```text
Requirement
    ↓
Inspect existing project structure
    ↓
Search for existing components and logic
    ↓
Understand existing implementation
    ↓
Reuse existing components if possible
    ↓
Extend existing components if necessary
    ↓
Create new code only when required
    ↓
Keep components dynamic and reusable
    ↓
Remove duplication and unused code
    ↓
Review before finishing
```

---

# 🛑 FINAL WARNING

> **DO NOT WRITE CODE JUST TO MAKE THE FEATURE WORK.**
>
> Write code that fits the existing architecture.

Always prioritize:

1. **Reuse existing code**
2. **Avoid duplication**
3. **Keep components dynamic**
4. **Keep components reusable**
5. **Separate responsibilities**
6. **Do not put everything in one file**
7. **Do not write dump code**
8. **Do not over-engineer**
9. **Keep the codebase clean**
10. **Check existing code before creating anything new**

## Golden Rule

> **FIRST CHECK → THEN REUSE → THEN EXTEND → THEN CREATE ONLY IF NECESSARY.**
