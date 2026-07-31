# Number Memory

Route: `/games/numbers`

Source: [`MEMORY_ARENA_GAME_DESIGN.md`](../../MEMORY_ARENA_GAME_DESIGN.md) §2.1. Shared systems (scoring, Elo, modes) live in [`README.md`](README.md).

---

## Goal

Remember and re-enter a random sequence of digits in the correct order.

## Character Set

Digits 1–9, sampled with replacement (can repeat within one sequence).

## Answer Input

3×3 numeric keypad (phone-keypad style).

## Round Flow

1. **Viewing phase** — the sequence is shown for `viewTime` seconds. Player may only look, not input.
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

## Controls

Player can **Pause** mid-round and **Resume** at the exact same state, or **Reset** the round at any time.

## Endless Mode

Unlocks after Level 10. Starting length 16, +1 character every 3 consecutive wins. Separate Endless leaderboard (ranked by highest length reached). See [`README.md`](README.md#endless-mode).
