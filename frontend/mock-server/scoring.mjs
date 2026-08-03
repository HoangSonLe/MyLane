/**
 * Plain-JS mirror of computeScore() in src/services/gameplay/game-rules.ts —
 * keep both in sync. docs/gameplay/README.md § Scoring Formula.
 */
export const SPEED_BONUS_PER_SECOND = { number: 8, alphabet: 10, grid: 12, sequence: 9, color: 9 }

export const DIFFICULTY_SCORE_MULTIPLIER = { easy: 1.0, medium: 1.3, hard: 1.7, 'super-hard': 2.2 }
export const PERFECT_MULTIPLIER = 1.25
export const COMPLETION_MULTIPLIER_FULL = 1.0
export const COMPLETION_MULTIPLIER_PARTIAL = 0.6

export function computeScore({ game, difficulty, roundsCleared, maxConsecutiveItems, bonusSeconds, perfect, completedAllLevels, isRanked }) {
  const n = Math.max(0, maxConsecutiveItems ?? roundsCleared)
  const baseScore = 100 * n * (n - 1)
  const speedBonus = Math.round(Math.max(0, bonusSeconds) * SPEED_BONUS_PER_SECOND[game])

  if (!isRanked) {
    return { baseScore, speedBonus, difficultyMultiplier: 1, perfectBonus: 1, completionMultiplier: 1, score: baseScore + speedBonus }
  }

  const difficultyMultiplier = DIFFICULTY_SCORE_MULTIPLIER[difficulty]
  const perfectBonus = perfect ? PERFECT_MULTIPLIER : 1.0
  const completionMultiplier = completedAllLevels ? COMPLETION_MULTIPLIER_FULL : COMPLETION_MULTIPLIER_PARTIAL
  const score = Math.round((baseScore + speedBonus) * difficultyMultiplier * perfectBonus * completionMultiplier)
  return { baseScore, speedBonus, difficultyMultiplier, perfectBonus, completionMultiplier, score }
}

export function getEloKFactor(currentElo) {
  if (currentElo < 1200) return 40
  if (currentElo < 1600) return 32
  if (currentElo < 2000) return 24
  return 16
}

export function calculateEloDelta(currentElo, opponentElo, outcome) {
  const expected = 1 / (1 + 10 ** ((opponentElo - currentElo) / 400))
  const actual = outcome === 'win' ? 1 : outcome === 'draw' ? 0.5 : 0
  return Math.round(getEloKFactor(currentElo) * (actual - expected))
}
