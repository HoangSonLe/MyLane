import type { ReactNode } from 'react'
import { GameId, ModeId, DifficultyId, EntryPoint } from '@/configs/enum'

export { GameId, ModeId, DifficultyId, EntryPoint }

export interface GameMeta {
  id: GameId
  label: string
  description: string
  icon: ReactNode
  elo: number
  bestScore: number | null
  highestLevel: number | null
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
