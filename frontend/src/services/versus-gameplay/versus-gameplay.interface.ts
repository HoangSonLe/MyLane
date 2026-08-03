/**
 * versus-gameplay.interface.ts — interfaces và types cho VersusGameplayScreen.
 * Shared types import từ configs/enum.ts.
 */
import { DifficultyId, GameId, RoundMode, OpponentStatus } from '@/configs/enum'
import type { GameResultInput } from '@/services/result/result.interface'
import type { Room } from '@/services/versus-room/versus-room.interface'

export { GameId, RoundMode, OpponentStatus }

export interface Props {
  room?: Room | null
  gameType?: GameId
  roundMode?: RoundMode
  difficulty?: DifficultyId
  seed?: string
  onQuit?: () => void
  onMatchEnd?: (result: GameResultInput) => void
}
