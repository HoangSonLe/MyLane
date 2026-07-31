import { ScreenState, RoundMode, GameId } from '@/configs/enum'

export { ScreenState, RoundMode, RoundMode as RoomMode, GameId }

export type ErrorKind = 'invalid-code' | 'room-full' | 'room-expired' | 'connection'

export interface PlayerSlot {
  name: string
  handle: string
  elo: number
  ready: boolean
}

// GameCategoryId is an alias for GameId — use GameId from configs/enum directly
export type GameCategoryId = GameId

export interface GameCategory {
  id: GameCategoryId
  label: string
  description: string
}
