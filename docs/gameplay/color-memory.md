# Color Memory

Route: `/games/color`

> **Status: original Version 1 game, authored by explicit request.** Like
> [Sequence Memory](sequence-memory.md), this has no entry in
> [`MY_LANE_GAME_DESIGN.md`](../../MY_LANE_GAME_DESIGN.md). It
> started as the original visual design for Sequence Memory's board (4
> colored tiles) before that game's board was corrected to match its actual
> spec (a 3×3 grid of blank, identical tiles). Rather than discard the
> colored-tile design, it was kept as its own game — rules below were
> authored to close the gap, the same way sequence-memory.md was. This file
> is the canonical rules source for Color Memory.

Shared systems (scoring, Elo, modes) live in [`README.md`](README.md).

---

## Goal

Watch a sequence of colored tiles flash one at a time, then tap them back
in the same order — a classic "Simon"-style memory game.

This differs from [Sequence Memory](sequence-memory.md): tiles are
**distinct colors**, not identical/blank, and the board itself grows (more
colors, not just a longer sequence) as levels increase.

## Board

Grid of colored, square tiles — `colorCount` tiles (4 to 6, depending on
level), laid out as close to a square grid as the count allows. Six colors
are defined: amber, teal, rose, violet, lime, sky; only the first
`colorCount` are shown.

## Round Flow

1. **Viewing phase** — tiles flash one at a time in sequence: each tile
   lights up for `flashDuration` (0.6s, same pace as Sequence Memory), with
   a `gapDuration` (0.3s) pause before the next flashes. The same color can
   repeat within one sequence. Player may only watch.
2. **Answering phase** — all tiles return to their dim/inactive state.
   Player must tap the tiles in the exact order they flashed, within
   `answerTime` seconds.
3. The round resolves as soon as the player has tapped as many tiles as the
   sequence length, or when `answerTime` runs out.

## Win/Lose (per round)

- **Win**: every tile tapped in the exact order flashed, within the time
  limit.
- **Lose**: any wrong tile tapped (round ends immediately on first
  mistake, same convention as Sequence Memory), or time runs out before the
  sequence is completed.

## Level System

- 10 levels, **two independent axes** grow together (same spirit as [Grid
  Memory](grid-memory.md)'s 2-axis progression): sequence length, and the
  number of distinct colors on the board.
- Each level requires **3** consecutive round wins to advance (same
  convention as Number/Alphabet/Sequence Memory).
- Losing 3 rounds within the same level → **Game Over**.

| Level | Colors | Sequence length | Rounds to win |
|---|---|---|---|
| 1 | 4 | 7 | 3 |
| 2 | 4 | 8 | 3 |
| 3 | 4 | 9 | 3 |
| 4 | 5 | 9 | 3 |
| 5 | 5 | 10 | 3 |
| 6 | 5 | 11 | 3 |
| 7 | 6 | 11 | 3 |
| 8 | 6 | 12 | 3 |
| 9 | 6 | 13 | 3 |
| 10 | 6 | 14 | 3 |

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
  seconds above. Same formula as Number/Alphabet/Sequence Memory.

Source: `getAnswerTimeSeconds()` in `frontend/src/pages/gameplay/GameplayScreen.tsx`.

## Controls

Pause/Resume at the exact same state, or Reset the round at any time —
same as the other games.

## Scoring

Uses the shared [scoring formula](README.md#scoring-formula-ranked-games-only).
Speed Bonus coefficient: **9 points/second** (same as Sequence Memory —
no stronger basis to pick a different value; not yet wired into any
scoring pipeline, see [`docs/technical/known-gaps.md`](../technical/known-gaps.md)).

## Endless Mode

Unlocks after Level 10. `colorCount` stays fixed at 6 (the board doesn't
grow further); sequence length continues from Level 10's ending value of
14, starting at **15** and +1 every 3 consecutive wins — same +1-per-3-wins
convention as Number/Alphabet/Sequence Memory. Separate Endless
leaderboard, same convention as [`README.md`](README.md#endless-mode).
