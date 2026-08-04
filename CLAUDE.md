# Claude Project Instructions

Welcome to My Lane.

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

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **GameBoard** (3630 symbols, 7116 relationships, 233 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/GameBoard/context` | Codebase overview, check index freshness |
| `gitnexus://repo/GameBoard/clusters` | All functional areas |
| `gitnexus://repo/GameBoard/processes` | All execution flows |
| `gitnexus://repo/GameBoard/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
