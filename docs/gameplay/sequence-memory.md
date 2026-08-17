# Sequence Memory

Route: `/games/sequence`

> **Status: confirmed original Version 1 game.** Unlike [Number Memory](number-memory.md), [Alphabet Memory](alphabet-memory.md), and [Grid Memory](grid-memory.md) — which come directly from [`MY_LANE_GAME_DESIGN.md`](../../MY_LANE_GAME_DESIGN.md) — this game has no entry in that root document; `00-project-overview.md` lists it as a Version 1 game but never defined its rules. This file was authored to close that gap and has been confirmed by the project owner as a core game, on equal footing with the other 3. `MY_LANE_GAME_DESIGN.md` itself has not been amended with an entry for it — this file remains the canonical rules source for Sequence Memory.

Shared systems (scoring, Elo, modes) live in [`README.md`](README.md).

---

## Goal

Remember the order in which grid tiles flash, then tap them back in the same order.

This differs from [Grid Memory](grid-memory.md) (which shows numbered labels simultaneously and expects ascending-number order) — here tiles carry no numbers, and the order to reproduce is *the order they flashed in*, shown one at a time.

## Board

3×3 grid of blank, identical tiles (no numbers or labels).

## Round Flow

1. **Viewing phase** — tiles flash one at a time in sequence: each tile lights up for `flashDuration` (0.6s), with a `gapDuration` (0.3s) pause before the next flashes. Sequence length = the current level's step count. Player may only watch.
2. **Answering phase** — all tiles return to their blank state. Player must tap the tiles in the exact order they flashed, within `answerTime` seconds.
3. The round resolves as soon as the player has tapped as many tiles as the sequence length, or when `answerTime` runs out.

## Win/Lose (per round)

- **Win**: every tile tapped in the exact order flashed, within the time limit.
- **Lose**: any wrong tile tapped (round ends immediately on first mistake), or time runs out before the sequence is completed.

## Level System

- 10 levels.
- Level 1 starts at a 6-tile sequence; each level adds 1 tile (up to 15 at level 10).
- Each level requires **3** consecutive round wins to advance (same convention as Number/Alphabet Memory).
- Losing 3 rounds within the same level → **Game Over**.

| Level | Sequence length | Rounds to win |
|---|---|---|
| 1 | 6 | 3 |
| 2 | 7 | 3 |
| 3 | 8 | 3 |
| 4 | 9 | 3 |
| 5 | 10 | 3 |
| 6 | 11 | 3 |
| 7 | 12 | 3 |
| 8 | 13 | 3 |
| 9 | 14 | 3 |
| 10 | 15 | 3 |

## Difficulty Modes

Added to `answerTime`, same pattern as the other games:

| Mode | Seconds added |
|---|---|
| Easy | +5s |
| Medium | +4s |
| Hard | +3s |
| Super Hard | +2s |

## Default Timing

`answerTime` never had a documented base default (only Grid Memory's doc
gives one). Promoted here as shipped/tested behavior, same situation as
[Number Memory § Default Timing](number-memory.md#default-timing):

- `answerTime` = `10s + level × 3s` (Endless: level is treated as
  `10 + floor(consecutive wins ÷ 3)`), before adding the Difficulty Mode
  seconds above. Same formula as Number/Alphabet Memory.

Source: `getAnswerTimeSeconds()` in `frontend/src/pages/gameplay/GameplayScreen.tsx`.

## Controls

Pause/Resume at the exact same state, or Reset the round at any time — same as the other games.

## Scoring

Uses the shared [scoring formula](README.md#scoring-formula-ranked-games-only). Speed Bonus coefficient: **9 points/second** (between Number Memory's 8 and Alphabet Memory's 10; distinct from Grid Memory's 12 — chosen for this draft, not sourced from the GDD).

## Endless Mode

Unlocks after Level 10. Starting length 16, +1 tile every 3 consecutive wins. Separate Endless leaderboard, same convention as [`README.md`](README.md#endless-mode).
