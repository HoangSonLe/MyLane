# UI Documentation

## Purpose

This directory contains screen definitions and navigation flows for My Lane.

It defines *which* screens exist and *how users move between them*.

Visual and interaction rules (colors, typography, spacing, components) live in [`docs/design/design-bible/`](../design/design-bible/README.md) — read that first.

---

## Scope

- Screen inventory (list of every screen in the product)
- Navigation flow between screens
- Screen-to-screen data handoff

---

## Screen Inventory

Every screen named below is already referenced in the Design Bible ([`11-screen-guidelines.md`](../design/design-bible/11-screen-guidelines.md), [`01-design-philosophy.md`](../design/design-bible/01-design-philosophy.md)). This table only collects those facts in one place — it does not add new screens.

| Screen | Purpose | Primary Action |
|---|---|---|
| Home | Encourage another play session, not statistics | Play |
| Game Select | Let the player choose a game | Choose Game |
| Gameplay | Support gameplay, nothing else | *(game-specific — Missing in source documentation)* |
| Result | Celebrate progress, encourage replay | Play Again |
| Profile | Show identity, progress, history | Edit Profile |
| Settings | Configuration only, never mixed with gameplay | *(Missing in source documentation)* |
| Leaderboard | Comparison; must never hide the player's own rank | *(Missing in source documentation)* |
| Dialog | One decision | *(context-dependent)* |

Source: [`11-screen-guidelines.md`](../design/design-bible/11-screen-guidelines.md#home-screen) (screen purposes), [`01-design-philosophy.md`](../design/design-bible/01-design-philosophy.md#principle-2) (primary actions for Home, Game Select, Result, Profile).

Each screen should eventually get its own detailed spec using [`16-screen-template.md`](../design/design-bible/16-screen-template.md) — none exist yet.

---

## Navigation Flow (draft — needs confirmation)

The flow below is inferred from the primary actions above; it has not been explicitly specified anywhere in the source documentation. Treat it as a draft, not a decision, until a product/gameplay owner confirms it.

```
Home ─Play→ Game Select ─Choose Game→ Gameplay ─(finish)→ Result ─Play Again→ Gameplay (same game + mode)
                                                              └─(back)→ Home
Home ──→ Profile ──→ Edit Profile
Home ──→ Settings
Home ──→ Leaderboard
```

Confirmed by project owner:

- Result → **Play Again replays the same game and mode**, not Game Select.
- **Home and Lobby are separate screens.** Home is the default landing screen after Landing/Login; Lobby is reached from Home via a dedicated button when the player wants Versus/social, not a default landing target. This supersedes the "Home hoặc Lobby" placeholder previously in [`screen-inventory-and-flow.md`](screen-inventory-and-flow.md).
- **The 3-step tutorial is not a fixed step right after Login.** It triggers per game family, the first time a player picks that game in Game Select, right before that game's first Gameplay session.
- **Pause → Settings (Solo only, recommendation, not a source-documented fact):** Pause Overlay gets a 4th option, Settings, opened as a sub-overlay on top of Pause without leaving the Gameplay route; closing it returns to Pause. Versus is recommended to not support Pause at all, consistent with other real-time PvP games (shared seed + speed-based win condition make pausing exploitable) — Versus players only get Quit, governed by the existing 60s reconnect rule. Flag this for confirmation if a different behavior is wanted.

See [`screen-inventory-and-flow.md`](screen-inventory-and-flow.md) for the full updated flow diagrams.

Open questions (missing in source documentation): none remaining from the original list above.

---

## Status

Screen inventory and a draft navigation flow are documented above, synthesized from the Design Bible.

Detailed screen interface draft: [`screen-interface-spec.md`](screen-interface-spec.md)

Screen display data models: [`screen-display-data-models.md`](../technical/screen-display-data-models.md)

The interface draft covers the core sections of [`16-screen-template.md`](../design/design-bible/16-screen-template.md) — Purpose, Primary Action, Layout (as "Interface"), Navigation (as "Workflow"), and States (Loading/Empty/Error, per screen) — but does not use the template's exact section names (no separate User Goal, Secondary Actions, Components list, Data, or Accessibility sections). Treat it as template-aligned, not template-conformant. It is ready for Claude review, but any missing product or gameplay rule should still be treated as "Missing in source documentation" rather than guessed.
