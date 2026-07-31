# Product Documentation

## Purpose

This directory contains product requirements and roadmap for Memory Arena.

It is the highest-priority documentation source: per [`CLAUDE.md`](../../CLAUDE.md) and [`AGENTS.md`](../../AGENTS.md), Product documentation wins if it conflicts with any other documentation category.

This document synthesizes facts already stated in [`00-project-overview.md`](../design/design-bible/00-project-overview.md) and the [Design Bible](../design/design-bible/README.md) into requirements/roadmap form. It does not introduce new product decisions — see "Open Questions" for what still needs a decision.

---

## Vision & Mission

Build the best browser-based memory training platform that feels like a game instead of a test.

Help players improve memory, attention and cognitive skills through enjoyable gameplay, while encouraging continuous improvement and avoiding unnecessary stress.

Source: [`00-project-overview.md`](../design/design-bible/00-project-overview.md#vision).

---

## Target Audience

Primary: Students, Office workers, Gamers, Competitive players.

Secondary: Teachers, Parents, Researchers.

Source: [`00-project-overview.md`](../design/design-bible/00-project-overview.md#target-audience).

---

## Version 1 (MVP) Scope

**Platforms**

- Mobile Web
- Desktop Web

**Games**

- Sequence Memory
- Number Memory
- Alphabet Memory
- Grid Memory

> **Note:** [`MEMORY_ARENA_GAME_DESIGN.md`](../../MEMORY_ARENA_GAME_DESIGN.md) — the detailed Game Design Document — only defines 3 of these 4 games (Number, Alphabet, Grid Memory). Sequence Memory's rules were authored separately for this project — see [`docs/gameplay/sequence-memory.md`](../gameplay/sequence-memory.md) — and are confirmed by the project owner as an original core game, on equal footing with the other 3.

**Non-goals** (must never be true of the product, per the [Design Bible](../design/design-bible/README.md#design-goal)):

- Not an educational app
- Not an IQ test
- Not a productivity dashboard
- Not a casino game

Source: [`00-project-overview.md`](../design/design-bible/00-project-overview.md#platforms) and [`design-bible/README.md`](../design/design-bible/README.md).

---

## Roadmap (Post-V1)

**Future platforms**

- PWA
- Android
- iOS

**Future games**

- Pattern Memory
- Simon
- Memory Matrix
- Spatial Memory
- Corsi Block
- Dual N-Back
- Visual Memory
- Audio Memory
- Typing Memory
- Daily Challenge

This list must stay in sync with `00-project-overview.md` and [`design-bible/README.md`](../design/design-bible/README.md#future-expansion) — update all three together.

---

## Product Principles

The product should always feel: Fun, Friendly, Relaxing, Rewarding, Competitive (optional).

It should never feel like: School homework, IQ testing, Medical software, Enterprise dashboard.

Source: [`00-project-overview.md`](../design/design-bible/00-project-overview.md#product-principles).

---

## Success Criteria (qualitative)

Players should naturally think "I'll play one more round" instead of "I've finished today's task."

Source: [`00-project-overview.md`](../design/design-bible/00-project-overview.md#success-criteria).

---

## Accounts & Modes

Answered by [`MEMORY_ARENA_GAME_DESIGN.md`](../../MEMORY_ARENA_GAME_DESIGN.md) (repo root) — full detail in [`docs/gameplay/README.md`](../gameplay/README.md#accounts):

- Login required for full features (Versus, saved records, Elo, friends, leaderboard); supported methods: Google, Discord, Email/Password.
- Guest mode exists: Solo Practice only, no server-side save, no Versus.
- Game modes: Solo Practice, Solo Ranked, Versus Ranked, Versus Unranked.

## Open Questions

Missing in source documentation — no product decision exists yet for:

- Quantitative success metrics (retention, DAU/MAU, session length targets, etc.)
- Monetization model (free, ads, subscription, IAP — the GDD's Version-1 exclusion list rules out a cosmetics shop for V1, but no model is defined even for later)
- Launch timeline / release milestones for Version 1

These require an explicit product decision before they can be documented here — do not assume.
