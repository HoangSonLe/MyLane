# Product Documentation

## Purpose

This directory contains product requirements and roadmap for My Lane.

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
- Color Memory

> **Note:** [`MY_LANE_GAME_DESIGN.md`](../../MY_LANE_GAME_DESIGN.md) — the detailed Game Design Document — only defines 3 of these 5 games (Number, Alphabet, Grid Memory). Sequence Memory and Color Memory's rules were authored separately for this project — see [`docs/gameplay/sequence-memory.md`](../gameplay/sequence-memory.md) and [`docs/gameplay/color-memory.md`](../gameplay/color-memory.md) — and are confirmed as original core games, on equal footing with the other 3.

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

Answered by [`MY_LANE_GAME_DESIGN.md`](../../MY_LANE_GAME_DESIGN.md) (repo root) — full detail in [`docs/gameplay/README.md`](../gameplay/README.md#accounts):

- Login required for full features (Versus, saved records, Elo, friends, leaderboard); supported methods: Google, Discord, Email/Password.
- Guest mode exists: Solo Practice only, no server-side save, no Versus.
- Game modes: Solo Practice, Solo Ranked, Versus Ranked, Versus Unranked.
- Room Rules & Features:
  - **Host Transfer**: Confirm modal when Host leaves; Host role automatically passes to the remaining player.
  - **Room Privacy**: Public (visible in Lobby list) or Private (requires 6-digit code or link).
  - **Available Public Rooms List**: Live list of open public rooms in the Lobby for 1-click joining.
  - **Quick Match vs Quick Join Distinction**:
    - **Quick Match**: Elo-based matchmaking for Ranked play (`MatchmakingScreen` queue).
    - **Quick Join**: Instant 1-click entry into open custom Public rooms (`VersusRoomScreen` direct join).
  - **Match Challenge Invitations & Temporary Mute**:
    - **Incoming Invite Toast/Modal**: When challenged by a friend/player, a floating card displays inviter info, game category, and 3 actions: Accept, Decline, or Mute Invites.
    - **Temporary Mute Invites**: Players can choose to temporarily ignore/mute invitations from a specific player for 5 minutes, 15 minutes, 30 minutes, or until the end of the current session.
  - **Public Friend Profile Popup**:
    - Clicking any friend in the Lobby or online friends list pops up a detailed public profile displaying their Avatar, Display Name, Handle, Presence Status, Overall Elo, Games Played, Win Rate, and Top Game Records, along with Challenge and Mute action buttons.
  - **Automated Versus 1v1 Gameplay Simulation**:
    - Versus 1v1 gameplay (`VersusGameplayScreen.tsx`) features automated simulated opponent turns, shared seed generation, round-by-round score synchronization, and smooth transition to final match results.
    - If one participant forfeits, the opponent is notified and automatically enters `ResultScreen` with the finalized win and head-to-head round-score comparison.
  - **Lobby One-Tap Data Refresh**:
    - One-tap Refresh controls on Available Rooms and Online Friends cards in `LobbyScreen.tsx` allow players to instantly re-fetch open rooms and friend statuses.
  - **Enhanced Result Screen & New Personal Record Animations**:
    - `ResultScreen.tsx` highlights Personal Best breakthroughs with pulsing gold star badge animations, detailed score breakdowns, and smooth navigation options.
    - Versus results add a compact two-player comparison card; forfeits include a clear non-blocking notice explaining why the match ended.
  - **Live Profile Match History Sync**:
    - Finished game runs automatically record new match entries and update personal category records in the signed-in user's Profile stats (`ProfileScreen.tsx`).
  - **Central Modal Overlay Layer (`ModalBackdrop`)**:
    - All dialogs and popups (including `WrongToast`) utilize a unified backdrop primitive (`ModalBackdrop`) that centralizes click-through prevention, event propagation isolation, and backdrop dismissal across all screens.
  - **Haptic Vibration Feedback**:
    - Tactical haptic vibration pulse (`navigator.vibrate`) triggers when players select answer buttons or interact with game grid tiles across all game modes (Sequence, Grid, Number, Color, Alphabet Memory). Can be enabled or disabled at any time in **Settings > Haptic Feedback**.
  - **Web Audio Sound Effects**:
    - Synthesized audio sound effects (`Web Audio API`) trigger on answer button taps, level completions, and wrong inputs across all 5 memory game modes. Can be enabled or disabled at any time in **Settings > Sound Effects**.

## Open Questions

Missing in source documentation — no product decision exists yet for:

- Quantitative success metrics (retention, DAU/MAU, session length targets, etc.)
- Monetization model (free, ads, subscription, IAP — the GDD's Version-1 exclusion list rules out a cosmetics shop for V1, but no model is defined even for later)
- Launch timeline / release milestones for Version 1

These require an explicit product decision before they can be documented here — do not assume.
