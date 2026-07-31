# Alphabet Memory

Route: `/games/alphabet`

Source: [`MEMORY_ARENA_GAME_DESIGN.md`](../../MEMORY_ARENA_GAME_DESIGN.md) §2.2. Shared systems (scoring, Elo, modes) live in [`README.md`](README.md).

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

Identical to [Number Memory](number-memory.md): Viewing → Answering flow, 10-level table (6→15 characters, 5 wins/level), difficulty mode time bonuses, Pause/Resume/Reset, Endless Mode (starts at 16, +1 per 3 wins).

Speed Bonus coefficient differs — see [scoring formula](README.md#scoring-formula-ranked-games-only): Alphabet Memory uses **10 points/second** (vs. 8 for Number Memory).
