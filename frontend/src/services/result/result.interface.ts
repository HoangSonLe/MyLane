import { ScreenState, ModeId, EntryPoint, GameId, DifficultyId } from '@/configs/enum'

export { ScreenState, ModeId, EntryPoint }

export type MatchFinishReason = 'completed' | 'forfeit' | 'disconnect'

export interface VersusComparisonData {
  playerName: string
  opponentName: string
  playerScore: number
  opponentScore: number
  totalRounds: number
  /** Opponent's profile id — needed to send a direct Rematch challenge. */
  opponentId?: string
}

/** Raw session tallies GameplayScreen hands off at game-over — see docs/gameplay/README.md § Scoring Formula. */
export interface GameResultInput {
  /** Server match identity for idempotent Versus result persistence. */
  matchId?: string
  /** versus_rooms.code of the finished match — lets a Rematch challenge
   * bypass the friend-only check for this exact opponent. */
  roomCode?: string
  game: GameId
  mode: ModeId
  difficulty: DifficultyId
  levelReached: number
  roundsCleared: number
  /** Highest consecutive correct item count within a round; `n` in the base-score formula. */
  maxConsecutiveItems: number
  bonusSeconds: number
  perfect: boolean
  completedAllLevels: boolean
  /** Present for Versus results so Elo and history use the actual match outcome. */
  outcome?: 'win' | 'loss' | 'draw'
  /** Server-owned reason the Versus match ended. */
  finishReason?: MatchFinishReason
  /** Raw head-to-head snapshot used only by the Versus result UI. */
  versusComparison?: VersusComparisonData
  /** Opponent category Elo at match start; used only by Versus Ranked. */
  opponentElo?: number
  /** Elo delta already applied atomically by the Versus lifecycle RPC. */
  serverEloChange?: number
}

export interface RankedBreakdown {
  baseScore: number
  speedBonus: number
  difficultyMultiplier: number
  /** Multiplier (×1.25 or ×1.0), per docs — not an additive bonus despite the field name docs uses ("Perfect Bonus"). */
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
