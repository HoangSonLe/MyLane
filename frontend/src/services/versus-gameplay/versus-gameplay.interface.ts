/**
 * versus-gameplay.interface.ts — interfaces và types cho VersusGameplayScreen.
 * Shared types import từ configs/enum.ts.
 */
import { GameId, RoundMode, OpponentStatus } from '@/configs/enum'

export { GameId, RoundMode, OpponentStatus }

export interface Props {
  gameType?: GameId
  roundMode?: RoundMode
  onQuit?: () => void
  onMatchEnd?: () => void
}
