import { DifficultyId, GameId, ModeId } from '@/configs/enum'
import { clearSessionJSON, readSessionJSON, writeSessionJSON } from './safe-storage'

/**
 * Durable-progress checkpoint for Solo Gameplay, so a reload resumes at the
 * right level/streak instead of level 1. Deliberately does NOT capture
 * mid-round transient board state (current sequence, lit tiles, timer value)
 * — the resumed round restarts fresh at the checkpointed level, which is
 * simpler and avoids replaying a partially-viewed sequence unfairly. See
 * docs/technical/known-gaps.md "Resume-on-reload".
 */
export interface GameplayCheckpoint {
  gameType: GameId
  mode: ModeId
  difficulty: DifficultyId
  level: number
  winStreak: number
  lossCount: number
  roundsCleared: number
  maxConsecutiveItems: number
  bonusSeconds: number
  perfect: boolean
  reachedMaxLevel: boolean
}

const CHECKPOINT_KEY = 'mylane:gameplay-checkpoint:v1'

export function saveGameplayCheckpoint(checkpoint: GameplayCheckpoint) {
  writeSessionJSON(CHECKPOINT_KEY, checkpoint)
}

/** Returns the checkpoint only if it matches the game/mode/difficulty being started. */
export function loadGameplayCheckpoint(
  gameType: GameId,
  mode: ModeId,
  difficulty: DifficultyId,
): GameplayCheckpoint | null {
  const parsed = readSessionJSON<GameplayCheckpoint>(CHECKPOINT_KEY)
  if (!parsed || parsed.gameType !== gameType || parsed.mode !== mode || parsed.difficulty !== difficulty) return null
  return parsed
}

export function clearGameplayCheckpoint() {
  clearSessionJSON(CHECKPOINT_KEY)
}
