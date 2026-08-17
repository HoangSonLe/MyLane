/**
 * Per-game rules mirrored from docs/gameplay/*.md — level tables, timing,
 * character sets. Centralised here (instead of scattered magic numbers in
 * GameplayScreen.tsx) so each number stays traceable to its doc source.
 * Do not change these without updating the docs first — see
 * docs/gameplay/README.md's "never change without an explicit request".
 */
import { DifficultyId, GameId } from '@/configs/enum'

export const GAME_LABELS: Record<string, string> = {
  [GameId.NUMBER]: 'Number Memory',
  [GameId.ALPHABET]: 'Alphabet Memory',
  [GameId.GRID]: 'Grid Memory',
  [GameId.SEQUENCE]: 'Sequence Memory',
  [GameId.COLOR]: 'Color Memory',
}

/** docs/gameplay/*.md "Difficulty Modes" — added to answerTime for all games and to viewTime for Number/Alphabet. */
export const DIFFICULTY_SECONDS: Record<DifficultyId, number> = {
  [DifficultyId.EASY]: 5,
  [DifficultyId.MEDIUM]: 4,
  [DifficultyId.HARD]: 3,
  [DifficultyId.SUPER_HARD]: 2,
}

export interface LinearLevel {
  level: number
  length: number
  roundsToWin: number
}

/** docs/gameplay/number-memory.md — level 1 = 8 chars ... level 10 = 17 chars, 3 wins/level. */
export const NUMBER_LEVELS: LinearLevel[] = Array.from({ length: 10 }, (_, i) => ({
  level: i + 1,
  length: i + 8,
  roundsToWin: 3,
}))

/** docs/gameplay/alphabet-memory.md — "identical to Number Memory" level table. */
export const ALPHABET_LEVELS: LinearLevel[] = NUMBER_LEVELS

/** docs/gameplay/sequence-memory.md — level 1 = 6 tiles ... level 10 = 15 tiles, 3 wins/level. */
export const SEQUENCE_LEVELS: LinearLevel[] = Array.from({ length: 10 }, (_, i) => ({
  level: i + 1,
  length: i + 6,
  roundsToWin: 3,
}))

export interface GridLevel {
  level: number
  xAxis: number
  yAxis: number
  beginCount: number
  roundsToWin: number
}

/**
 * docs/gameplay/grid-memory.md level table. The doc also describes a 2-axis
 * "increase beginCount until it reaches total cells, then grow the grid"
 * progression, but doesn't give the within-level beginCount growth step —
 * only this per-level table is fully specified, so each level here is
 * treated as one discrete step (advance via win-streak like the other 3
 * games) rather than inventing an unstated intra-level growth formula.
 */
export const GRID_LEVELS: GridLevel[] = [
  { level: 1, xAxis: 5, yAxis: 5, beginCount: 10, roundsToWin: 3 },
  { level: 2, xAxis: 6, yAxis: 5, beginCount: 12, roundsToWin: 3 },
  { level: 3, xAxis: 6, yAxis: 6, beginCount: 14, roundsToWin: 3 },
  { level: 4, xAxis: 7, yAxis: 6, beginCount: 16, roundsToWin: 3 },
  { level: 5, xAxis: 7, yAxis: 7, beginCount: 18, roundsToWin: 3 },
  { level: 6, xAxis: 8, yAxis: 8, beginCount: 20, roundsToWin: 3 },
  { level: 7, xAxis: 9, yAxis: 8, beginCount: 22, roundsToWin: 3 },
  { level: 8, xAxis: 9, yAxis: 9, beginCount: 24, roundsToWin: 3 },
  { level: 9, xAxis: 10, yAxis: 9, beginCount: 26, roundsToWin: 3 },
  { level: 10, xAxis: 10, yAxis: 10, beginCount: 28, roundsToWin: 3 },
]

/** docs/gameplay/grid-memory.md "Default Timing". */
export const GRID_VIEW_TIME_SECONDS = 18
export const GRID_ANSWER_TIME_SECONDS = 40
export const GRID_WRONG_TAP_PENALTY_SECONDS = 3

/** docs/gameplay/sequence-memory.md "Round Flow". */
export const SEQUENCE_FLASH_MS = 600
export const SEQUENCE_GAP_MS = 300
export const SEQUENCE_TILE_COUNT = 9 // 3x3 board

export interface ColorLevel {
  level: number
  colorCount: number
  length: number
  roundsToWin: number
}

/**
 * docs/gameplay/color-memory.md — original game for this project (like
 * Sequence Memory), rules authored per explicit user request, not sourced
 * from the GDD. Two-axis growth like Grid Memory: both sequence length and
 * the number of distinct colors increase across the 10 levels.
 */
export const COLOR_LEVELS: ColorLevel[] = [
  { level: 1, colorCount: 4, length: 7, roundsToWin: 3 },
  { level: 2, colorCount: 4, length: 8, roundsToWin: 3 },
  { level: 3, colorCount: 4, length: 9, roundsToWin: 3 },
  { level: 4, colorCount: 5, length: 9, roundsToWin: 3 },
  { level: 5, colorCount: 5, length: 10, roundsToWin: 3 },
  { level: 6, colorCount: 5, length: 11, roundsToWin: 3 },
  { level: 7, colorCount: 6, length: 11, roundsToWin: 3 },
  { level: 8, colorCount: 6, length: 12, roundsToWin: 3 },
  { level: 9, colorCount: 6, length: 13, roundsToWin: 3 },
  { level: 10, colorCount: 6, length: 14, roundsToWin: 3 },
]

/** docs/gameplay/color-memory.md "Round Flow" — same flash/gap pace as Sequence Memory. */
export const COLOR_FLASH_MS = SEQUENCE_FLASH_MS
export const COLOR_GAP_MS = SEQUENCE_GAP_MS

/** docs/gameplay/README.md "Scoring Formula" Speed Bonus coefficients (points/second). */
export const SPEED_BONUS_PER_SECOND: Record<GameId, number> = {
  [GameId.NUMBER]: 8,
  [GameId.ALPHABET]: 10,
  [GameId.GRID]: 12,
  [GameId.SEQUENCE]: 9,
  [GameId.COLOR]: 9,
}

/**
 * docs/gameplay/README.md "Scoring Formula (Ranked games only)":
 *
 *   Final Score = (Base Score + Speed Bonus) × Difficulty Multiplier × Perfect Bonus × Completion Multiplier
 *
 * The doc marks the formula "Ranked games only", but doesn't define any
 * separate Practice formula — Practice mode reuses the same Base
 * Score + Speed Bonus (no multipliers), matching how the original Result
 * mock always showed *some* score for Practice runs, just without the
 * breakdown card. `ResultScreen`/`RankedBreakdownCard` still only *display*
 * the breakdown for Ranked, per docs.
 */
export const DIFFICULTY_SCORE_MULTIPLIER: Record<DifficultyId, number> = {
  [DifficultyId.EASY]: 1.0,
  [DifficultyId.MEDIUM]: 1.3,
  [DifficultyId.HARD]: 1.7,
  [DifficultyId.SUPER_HARD]: 2.2,
}
export const PERFECT_MULTIPLIER = 1.25
export const COMPLETION_MULTIPLIER_FULL = 1.0
export const COMPLETION_MULTIPLIER_PARTIAL = 0.6

export interface ScoreInput {
  game: GameId
  difficulty: DifficultyId
  /** Number of completed rounds; retained for result/history statistics. */
  roundsCleared: number
  /** Highest consecutive correct item count within one round; `n` in Base Score. */
  maxConsecutiveItems: number
  /** Sum of `max(0, TimeLimit - TimeTaken)` across every correctly-cleared round this session. */
  bonusSeconds: number
  /** Zero mistakes anywhere in the session. */
  perfect: boolean
  /** Completed the required win streak at the game's max level (10). */
  completedAllLevels: boolean
  /** Ranked modes get the full multiplier stack; Practice only gets Base Score + Speed Bonus. */
  isRanked: boolean
}

export interface ScoreBreakdown {
  baseScore: number
  speedBonus: number
  difficultyMultiplier: number
  perfectBonus: number
  completionMultiplier: number
  score: number
}

export function computeScore(input: ScoreInput): ScoreBreakdown {
  const n = Math.max(0, input.maxConsecutiveItems ?? input.roundsCleared)
  const baseScore = 100 * n * (n - 1)
  const speedBonus = Math.round(Math.max(0, input.bonusSeconds) * SPEED_BONUS_PER_SECOND[input.game])

  if (!input.isRanked) {
    return { baseScore, speedBonus, difficultyMultiplier: 1, perfectBonus: 1, completionMultiplier: 1, score: baseScore + speedBonus }
  }

  const difficultyMultiplier = DIFFICULTY_SCORE_MULTIPLIER[input.difficulty]
  const perfectBonus = input.perfect ? PERFECT_MULTIPLIER : 1.0
  const completionMultiplier = input.completedAllLevels ? COMPLETION_MULTIPLIER_FULL : COMPLETION_MULTIPLIER_PARTIAL
  const score = Math.round((baseScore + speedBonus) * difficultyMultiplier * perfectBonus * completionMultiplier)
  return { baseScore, speedBonus, difficultyMultiplier, perfectBonus, completionMultiplier, score }
}

export type EloOutcome = 'win' | 'loss' | 'draw'

export function getEloKFactor(currentElo: number): number {
  if (currentElo < 1200) return 40
  if (currentElo < 1600) return 32
  if (currentElo < 2000) return 24
  return 16
}

/** Chess-style Elo from docs/gameplay/README.md. Only Versus Ranked callers may use this. */
export function calculateEloDelta(currentElo: number, opponentElo: number, outcome: EloOutcome): number {
  const expected = 1 / (1 + 10 ** ((opponentElo - currentElo) / 400))
  const actual = outcome === 'win' ? 1 : outcome === 'draw' ? 0.5 : 0
  return Math.round(getEloKFactor(currentElo) * (actual - expected))
}

export function clampLevel(level: number): number {
  return Math.min(Math.max(level, 1), 10)
}

export function getLinearLevel(levels: LinearLevel[], level: number): LinearLevel {
  return levels[clampLevel(level) - 1]
}

export function getGridLevel(level: number): GridLevel {
  return GRID_LEVELS[clampLevel(level) - 1]
}

export function getColorLevel(level: number): ColorLevel {
  return COLOR_LEVELS[clampLevel(level) - 1]
}

/** Per-game level lookup, dispatched by GameId — used by GameplayScreen. */
export function getRoundsToWin(gameType: GameId, level: number): number {
  switch (gameType) {
    case GameId.NUMBER:   return getLinearLevel(NUMBER_LEVELS, level).roundsToWin
    case GameId.ALPHABET: return getLinearLevel(ALPHABET_LEVELS, level).roundsToWin
    case GameId.SEQUENCE: return getLinearLevel(SEQUENCE_LEVELS, level).roundsToWin
    case GameId.GRID:     return getGridLevel(level).roundsToWin
    case GameId.COLOR:    return getColorLevel(level).roundsToWin
  }
}

export interface EndlessConfig {
  length: number
  xAxis?: number
  yAxis?: number
  beginCount?: number
  colorCount?: number
}

/** docs/gameplay/README.md Endless Mode progressive difficulty calculation per 3 consecutive wins. */
export function getEndlessConfig(gameType: GameId, endlessWins: number): EndlessConfig {
  const steps = Math.floor(Math.max(0, endlessWins) / 3)
  switch (gameType) {
    case GameId.NUMBER:
    case GameId.ALPHABET:
      return { length: 18 + steps }
    case GameId.SEQUENCE:
      return { length: 16 + steps }
    case GameId.GRID:
      return { xAxis: 10, yAxis: 10, beginCount: 28 + steps * 2, length: 28 + steps * 2 }
    case GameId.COLOR:
      return { colorCount: 6, length: 15 + steps }
  }
}
