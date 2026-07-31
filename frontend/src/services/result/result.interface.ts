import { ScreenState, ModeId, EntryPoint } from '@/configs/enum'

export { ScreenState, ModeId, EntryPoint }

export interface RankedBreakdown {
  baseScore: number
  speedBonus: number
  difficultyMultiplier: number
  perfectBonus: number
  completionMultiplier: number
}

export interface ResultData {
  game: string
  mode: ModeId
  modeLabel: string
  score: number
  levelReached: number
  previousBestScore: number | null
  previousBestLevel: number | null
  isNewRecord: boolean
  rankedBreakdown?: RankedBreakdown
  eloChange?: number       // Versus Ranked only
  previousElo?: number     // Versus Ranked only
}
