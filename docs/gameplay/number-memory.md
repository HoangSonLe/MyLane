# Number Memory

Route: `/games/numbers`

Source: [`MY_LANE_GAME_DESIGN.md`](../../MY_LANE_GAME_DESIGN.md) §2.1. Shared systems (scoring, Elo, modes) live in [`README.md`](README.md).

---

## Goal

Remember and re-enter a random sequence of digits in the correct order.

## Character Set

Digits 1–9, sampled with replacement (can repeat within one sequence).

## Answer Input

3×3 numeric keypad (phone-keypad style).

## Round Flow

1. **Viewing phase** — the sequence is shown for `viewTime` seconds. Player may only look, not input. Player may **Skip** the remainder of this phase to move straight to Answering; skipping does not change `answerTime` or scoring, it only ends the viewing wait early.
2. **Answering phase** — the sequence is hidden (shown as `?`). Player must tap the digits in the exact order seen, within `answerTime` seconds.
3. The system checks the full entered sequence against the original as soon as enough digits are entered, or when time runs out.

## Win/Lose (per round)

- **Win**: 100% correct order and length.
- **Lose**: at least one wrong position, or time runs out before the sequence is fully entered.

## Level System

- 10 levels.
- Level 1 starts at 6 characters; each level adds 1 character (up to 15 at level 10).
- Each level requires `times` consecutive round wins (default **5**) to advance.
- Losing `times` rounds within the same level → **Game Over**.

| Level | Characters to remember | Rounds to win |
|---|---|---|
| 1 | 6 | 5 |
| 2 | 7 | 5 |
| 3 | 8 | 5 |
| 4 | 9 | 5 |
| 5 | 10 | 5 |
| 6 | 11 | 5 |
| 7 | 12 | 5 |
| 8 | 13 | 5 |
| 9 | 14 | 5 |
| 10 | 15 | 5 |

## Difficulty Modes

Added on top of both `viewTime` and `answerTime`:

| Mode | Seconds added |
|---|---|
| Easy | +5s |
| Medium | +4s |
| Hard | +3s |
| Super Hard | +2s |

## Default Timing

This game's own spec never gave `viewTime`/`answerTime` concrete default
seconds (only Grid Memory's doc did) — implementation shipped with a
length-scaled placeholder that was never promoted to a documented default.
Promoted here as-is, formalizing shipped/tested behavior rather than
changing it:

- `viewTime` = `max(0.8s, characters × 0.6s)`, before adding the Difficulty
  Mode seconds above.
- `answerTime` = `10s + level × 3s` (Endless: level is treated as
  `10 + floor(consecutive wins ÷ 3)`), before adding the Difficulty Mode
  seconds above.

Source: `getAnswerTimeSeconds()`/`startNumberRound()` in
`frontend/src/pages/gameplay/GameplayScreen.tsx`.

## Controls

Player can **Pause** mid-round and **Resume** at the exact same state, or **Reset** the round at any time. During the Viewing phase, player can also **Skip** ahead to Answering early (see Round Flow).

## Endless Mode

Unlocks after Level 10. Starting length 16, +1 character every 3 consecutive wins. Separate Endless leaderboard (ranked by highest length reached). See [`README.md`](README.md#endless-mode).
