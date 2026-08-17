# Grid Memory

Route: `/games/grid` · a.k.a. "Chimpanzee Memory"

Source: [`MY_LANE_GAME_DESIGN.md`](../../MY_LANE_GAME_DESIGN.md) §2.3. Shared systems (scoring, Elo, modes) live in [`README.md`](README.md).

---

## Goal

Remember the positions of numbered cells on a grid, then tap them back in ascending order (1 → n).

## Mechanics

- Rectangular grid, size `x_Axis × y_Axis`.
- Some cells contain numbers 1 through `beginCount` (the count to remember); the rest are empty.
- **Viewing phase**: numbers are shown in their cells for `viewTimeSeconds` (default **18s**). Player may **Skip** the remainder of this phase to move straight to Answering; skipping does not change `answerTimeSeconds` or scoring, it only ends the viewing wait early.
- **Answering phase**: numbers are hidden. Player taps cells in order 1, 2, 3… within `answerTimeSeconds` (default **40s**).

## Wrong-Tap Handling

- A wrong cell briefly flashes an error effect.
- `wrongAnswerPenaltySeconds` (default **3s**) is subtracted from the remaining answer time.
- The round is flagged `hasWrongSelect = true`.
- **Important**: even if the player then taps every remaining number correctly, the round still counts as a **loss** if any wrong tap occurred.

## Win/Lose (per round)

- **Win**: every position tapped in ascending order, **and** zero wrong taps.
- **Lose**: answer time runs out, or at least one wrong tap occurred during the round.

## Difficulty Progression (2 independent axes)

1. Increase `beginCount` (how many numbers to remember).
2. Once `beginCount` reaches the current grid's total cell count (`x_Axis × y_Axis`) **and** the player has won the required number of rounds → advance to the next, larger grid level, and reset `beginCount` to that level's starting value.

| Level | Grid size | Rounds to win | Starting `beginCount` |
|---|---|---|---|
| 1 | 5×5 | 3 | 10 |
| 2 | 6×5 | 3 | 12 |
| 3 | 6×6 | 3 | 14 |
| 4 | 7×6 | 3 | 16 |
| 5 | 7×7 | 3 | 18 |
| 6 | 8×8 | 3 | 20 |
| 7 | 9×8 | 3 | 22 |
| 8 | 9×9 | 3 | 24 |
| 9 | 10×9 | 3 | 26 |
| 10 | 10×10 | 3 | 28 |

## Default Timing

Viewing 18s · Answering 40s · Wrong-tap penalty 3s.

## In-Round Settings

Two display layouts, switchable during play:

- **Simple**: only cells with numbers are shown.
- **Full**: the entire grid is shown, including empty cells.

Supports Pause and Reset, same as the other games. Also supports **Skip** during the Viewing phase (see Mechanics).

> Mid-round level (grid size) / max-cell-count change is intentionally out of scope — decided against building it.

## Endless Mode

Unlocks after Level 10 (10×10 grid). `beginCount` +2 every 3 wins beyond that; larger grids (11×11+) are deferred to a later version. See [`README.md`](README.md#endless-mode).
