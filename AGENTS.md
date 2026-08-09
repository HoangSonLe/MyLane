# My Lane AI Agent Instructions

This file defines how every AI agent should work inside this repository.

These instructions are mandatory.

---

# Before Doing Any Work

Always understand the task first.

Then locate the related documentation.

Never start coding immediately.

---

# Documentation Priority

When working on UI

Read

```
docs/design/design-bible/
```

When working on gameplay

Read

```
docs/gameplay/
```

When working on product features

Read

```
docs/product/
```

When working on backend

Read

```
docs/technical/
```

When working on screens

Read

```
docs/ui/
```

---

# Priority Order

If documentation conflicts

Priority is

1. Product
2. Gameplay
3. Design Bible
4. Technical
5. UI

Never invent new requirements.

---

# Design Rules

Never redesign the design language.

Reuse existing components.

Follow the Component System.

Follow the Design Principles.

Keep visual consistency.

Design for mobile first.

---

# Gameplay Rules

Gameplay documents are the source of truth.

Never change

- Rules
- Difficulty
- Score Formula
- Win Conditions
- Lose Conditions

unless explicitly requested.

---

# Technical Rules

Never change architecture without permission.

Never replace libraries automatically.

Never migrate database technology automatically.

Never introduce unnecessary dependencies.

---

# Coding Rules

Prefer simple solutions.

Avoid overengineering.

Avoid premature optimization.

Write maintainable code.

Document complex logic.

---

# Documentation Rules

Whenever new functionality is added

Update the corresponding documentation.

Never leave documentation outdated.

---

# Missing Information

If required information is missing

Do not guess.

Write

Missing in source documentation.

---

# Recommendations

Suggestions should always be separated from implementation.

Never silently modify requirements.

---

# Goal

Keep the project

Consistent

Maintainable

Scalable

Easy for future AI agents.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **GameBoard** (3338 symbols, 6765 relationships, 253 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

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
