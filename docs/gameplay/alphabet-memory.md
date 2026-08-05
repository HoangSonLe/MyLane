# Alphabet Memory

Route: `/games/alphabet`

Source: [`MY_LANE_GAME_DESIGN.md`](../../MY_LANE_GAME_DESIGN.md) §2.2. Shared systems (scoring, Elo, modes) live in [`README.md`](README.md).

---

## Goal

Same as [Number Memory](number-memory.md): remember and re-enter a random sequence in the correct order. Every rule (round flow, win/lose, level table, difficulty modes, controls, Endless Mode) is **identical** to Number Memory except for the two differences below.

## Character Set

Digits 0–9 **and** letters A–Z (36 characters total), sampled with replacement.

## Answer Input

QWERTY layout, 4 rows:

```
1234567890
QWERTYUIOP
ASDFGHJKL
ZXCVBNM
```

## Everything else

Identical to [Number Memory](number-memory.md): Viewing → Answering flow (including the **Skip** control to end Viewing early), 10-level table (6→15 characters, 5 wins/level), difficulty mode time bonuses, Pause/Resume/Reset, Endless Mode (starts at 16, +1 per 3 wins).

Speed Bonus coefficient differs — see [scoring formula](README.md#scoring-formula-ranked-games-only): Alphabet Memory uses **10 points/second** (vs. 8 for Number Memory).

## Default Timing

Same undocumented-default situation as [Number Memory § Default
Timing](number-memory.md#default-timing), promoted here as shipped/tested
behavior. `answerTime` uses the exact same formula; `viewTime` uses a
slightly slower per-character rate than Number Memory (36-character set vs.
9 digits — one extra reason to give each character a touch more time),
which is why this isn't byte-for-byte "identical" to Number Memory despite
the rest of the game being so:

- `viewTime` = `max(0.8s, characters × 0.65s)`, before adding the
  Difficulty Mode seconds.
- `answerTime` = `10s + level × 3s` (same formula as Number Memory), before
  adding the Difficulty Mode seconds.

Source: `getAnswerTimeSeconds()`/`startAlphaRound()` in
`frontend/src/pages/gameplay/GameplayScreen.tsx`.
