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
  /** Player chose to leave mid-match — counts as a forfeit (server-side). */
  onQuit?: () => void
  onMatchEnd?: (result: GameResultInput) => void
  /**
   * The opponent stayed disconnected past the 60s reconnect window and the
   * player leaves. NOT a forfeit: no RPC is called, the room stays
   * `in_progress` and the match is simply not counted — see
   * docs/technical/known-gaps.md §5 for the server-side finalize backlog.
   */
  onAbandon?: () => void
}
