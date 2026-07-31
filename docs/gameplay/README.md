# Gameplay Documentation

## Purpose

This directory is the source of truth for game mechanics: rules, difficulty curves, scoring formulas, and win/lose conditions for each game in Memory Arena.

Per [`AGENTS.md`](../../AGENTS.md), rules, difficulty, score formulas, and win/lose conditions defined here must never change without an explicit request.

**Primary source:** [`MEMORY_ARENA_GAME_DESIGN.md`](../../MEMORY_ARENA_GAME_DESIGN.md) (repo root) — the full Game Design Document, v1.1. This directory restructures that document into the per-topic layout `AGENTS.md`/`CLAUDE.md` expect; the GDD remains the canonical detailed reference.

---

## Games (Version 1)

The Game Design Document ([`MEMORY_ARENA_GAME_DESIGN.md`](../../MEMORY_ARENA_GAME_DESIGN.md)) defines 3 of the 4 Version 1 games. The 4th, Sequence Memory, has no entry in that root document but is confirmed by the project owner as an original core game, on equal footing with the other 3 (see note on its page):

- [Number Memory](number-memory.md) — remember and re-enter a sequence of digits
- [Alphabet Memory](alphabet-memory.md) — remember and re-enter a sequence of digits + letters
- [Grid Memory](grid-memory.md) — remember numbered positions on a grid, tap back in ascending order (a.k.a. "Chimpanzee Memory")
- [Sequence Memory](sequence-memory.md) — remember the order grid tiles flash in, tap them back in that order. **Confirmed original game for this project**, not present in the root GDD.

---

## Shared Systems

These rules apply across all 3 games and must stay consistent between them.

### Accounts

- Login required for full features (Versus, saved records, Elo, friends, leaderboard).
- Supported login: Google, Discord, Email/Password.
- **Guest mode**: Solo Practice only, no server-side save, no Versus.
- Per-account data: username (unique), avatar, per-category Elo (Numbers/Alphabet/Grid) + overall Elo, best score per category+mode, highest level reached per category, total games/wins/losses/draws, friends list, last ~100 matches history.

### Game Modes

| Mode | Description | Affects Elo? | Saved to records/leaderboard? |
|---|---|---|---|
| Solo Practice | Free practice, no pressure. Can reveal the answer after each round. | No | No |
| Solo Ranked | Solo play for rank/records. | No | Yes |
| Versus Ranked | 1v1, same category + mode, shared seed. Faster correct player wins. | Yes | Yes |
| Versus Unranked | 1v1 for fun. | No | No |

Versus match creation: invite a friend directly, create a room and share a code/link, or Quick Match (Elo-based).

### Matchmaking (Quick Match)

1. Matches online players in the same game category with the closest Elo.
2. Initial Elo window: **±100**.
3. If no match after **10s**, widen by **±50**; repeat every 10s up to **±300** max.
4. Max wait: **60–90s**, then "no opponent found," retry allowed.
5. Online friends within a valid Elo window are prioritized.
6. Each game category has its own matchmaking queue (no cross-category matches).

### Scoring Formula (Ranked games only)

```
Final Score = (Base Score + Speed Bonus) × Difficulty Multiplier × Perfect Bonus × Completion Multiplier
```

- **Base Score** = `100 × n × (n - 1)`, where `n` = highest number of consecutive correct items reached in the round.
- **Speed Bonus** = `max(0, TimeLimit - TimeTaken) × speed coefficient`. Speed coefficient by game: Number Memory **8**/s, Alphabet Memory **10**/s, Grid Memory **12**/s, Sequence Memory **9**/s (not in the root GDD, confirmed for this project — see [sequence-memory.md](sequence-memory.md)).
- **Difficulty Multiplier**: Easy ×1.0, Medium ×1.3, Hard ×1.7, Super Hard ×2.2.
- **Perfect Bonus**: ×1.25 if zero mistakes in the whole game, else ×1.0.
- **Completion Multiplier**: ×1.0 if the game/level was completed, ×0.6 if failed partway.
- Final score is rounded to the nearest integer.

### Elo System

Standard chess-style Elo, calculated **only** for Versus Ranked matches.

```
E_A = 1 / (1 + 10^((R_B - R_A) / 400))
R_A_new = R_A + K × (S_A - E_A)
```

`S_A` = 1 win / 0.5 draw / 0 loss. K-factor by current Elo: <1200 → K=40, 1200–1599 → K=32, 1600–1999 → K=24, ≥2000 → K=16.

- Each game category has its own Elo, plus a weighted-average overall Elo.
- Starting Elo: **1000**. Floor: **100** (never goes lower).

### Leaderboard & Records

- Boards: Global All-time (by best score and by Elo, per category), Weekly (resets weekly), Monthly (resets monthly), Friends-only, Top 100 per category.
- Only **Ranked** games count toward records/leaderboard.
- Recorded per player: best score per category+mode, date achieved, highest level reached, current + peak Elo, total games, Versus win rate, last ~100 matches (viewable in detail).

### Endless Mode

Unlocks after a player completes **Level 10** in any category.

- Number/Alphabet Memory: sequence length starts at 16, +1 every 3 consecutive wins.
- Grid Memory: after the 10×10 grid, `beginCount` +2 every 3 wins; larger grids (11×11+) deferred to a later version.
- Has its own leaderboard (ranked by highest item count / `beginCount` reached).
- Solo only (Practice + Ranked) — no Versus Endless in Version 1.

### Onboarding

- First open: choose "Play now (Guest)" or "Log in."
- One-time, 3-step, skippable tutorial per game family (view pattern → pattern hides → re-enter in order). Confirmed trigger point: the first time a player picks that game family in Game Select, immediately before that game's first Gameplay session — not a fixed step right after Login. See [`docs/ui/screen-inventory-and-flow.md`](../ui/screen-inventory-and-flow.md#tutorial-3-bước).
- On Guest → account conversion: offer to merge local best score/level (keep the higher value). Versus and Elo only start once an account exists.

### Out of scope for Version 1

Daily/Weekly Challenge, Achievement/Badge system, Season or Elo soft-reset, cosmetics/shop.

---

## Technical Rules for Implementation

- Versus matches **must** share one server-generated `seed` so both players get an identical puzzle.
- Viewing/Answering countdowns must be server-controlled (or use a tamper-resistant timer) — never trust client-side timing alone.
- Basic anti-cheat: rate-limit input speed, flag abnormal/bot-like input patterns.
- Guest config/progress lives in `localStorage`; synced to the server on login.
- Reconnect window during Versus: **60 seconds** (GDD §11 says 45–60s, §17 sets it at 60s) — treat 60s as the value unless a decision changes it. Timeout while disconnected counts as a loss.
- All tunable numbers (timers, win-streak counts, score coefficients, K-factor, etc.) must be configurable (server-side config), never hard-coded into core logic.

Source: [`MEMORY_ARENA_GAME_DESIGN.md`](../../MEMORY_ARENA_GAME_DESIGN.md) §§3–11, §17.
