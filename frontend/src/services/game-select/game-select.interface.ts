import type { ReactNode } from 'react'
import { GameId, ModeId, DifficultyId, EntryPoint } from '@/configs/enum'

export { GameId, ModeId, DifficultyId, EntryPoint }

/** Fixed content — same for every player, never fetched from a server. */
export interface GameMeta {
  id: GameId
  label: string
  description: string
  icon: ReactNode
}

/** Per-player progress — fetched from /api/game-select/stats (see game-select.service.ts). */
export interface GameStats {
  id: GameId
  elo: number
  bestScore: number | null
  highestLevel: number | null
  /** docs/gameplay/README.md § Endless Mode: "Unlocks after a player completes
   *  Level 10" — set once a run wins the required rounds at Level 10, which
   *  `highestLevel` alone can't tell apart from merely reaching Level 10. */
  completedLevel10: boolean
}

export interface ModeMeta {
  id: ModeId
  label: string
  requiresAccount: boolean
  versusFlow: boolean
}

export interface DifficultyMeta {
  id: DifficultyId
  label: string
}
