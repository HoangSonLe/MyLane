# Claude Project Instructions

Welcome to Memory Arena.

You are contributing to an existing project.

This repository already contains documentation.

Do not ignore it.

---

# Project Goal

Build a mobile-first brain training platform.

Current target

Version 1 (MVP)

---

# Before Every Task

Determine which area the task belongs to.

Read only the relevant documentation.

---

## UI

Read

```
docs/design/design-bible/
```

then

```
docs/ui/
```

---

## Gameplay

Read

```
docs/gameplay/
```

---

## Backend

Read

```
docs/technical/
```

---

## Product

Read

```
docs/product/
```

---

# Documentation Hierarchy

For Product Requirements

Use

```
docs/product/
```

For Gameplay Logic

Use

```
docs/gameplay/
```

For Visual Design

Use

```
docs/design/design-bible/
```

For Technical Decisions

Use

```
docs/technical/
```

For Screen Definitions

Use

```
docs/ui/
```

If two documents conflict, priority is

1. Product
2. Gameplay
3. Design Bible
4. Technical
5. UI

---

# Working Principles

Always preserve consistency.

Reuse existing architecture.

Reuse existing UI components.

Prefer extending instead of replacing.

---

# Never Do These

Do not redesign the UI.

Do not invent gameplay.

Do not change scoring.

Do not modify balancing.

Do not rewrite documentation.

Do not rename files unnecessarily.

Do not replace frameworks without approval.

---

# When Creating New Features

First

Identify related documentation.

Second

Check whether similar functionality already exists.

Third

Implement.

Fourth

Update documentation.

---

# When Documentation Is Missing

Do not assume.

Write

Missing in source documentation.

Then stop.

---

# Communication Style

Be concise.

Explain important decisions.

Separate

Facts

Assumptions

Recommendations

Never mix them.

---

# Success Criteria

Every change should

- Respect the documentation
- Keep consistency
- Be easy to maintain
- Support future expansion