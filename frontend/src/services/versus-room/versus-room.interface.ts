import { ScreenState, RoundMode, GameId, DifficultyId, RoomEntrySource } from '@/configs/enum'

export { ScreenState, RoundMode, RoundMode as RoomMode, GameId, DifficultyId, RoomEntrySource }

export type ErrorKind = 'invalid-code' | 'room-full' | 'room-expired' | 'connection'

export interface PlayerSlot {
  id?: string
  name: string
  handle: string
  avatarUrl?: string
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

export interface Room {
  code: string
  matchId?: string
  link: string
  /** Persisted match seed shared by every client in the room. */
  seed: string
  category: GameCategoryId
  mode: RoundMode
  difficulty: DifficultyId
  roomName: string
  isPrivate: boolean
  host: PlayerSlot
  opponent: PlayerSlot | null
  opponentJoined: boolean
  status?: 'waiting' | 'in_progress' | 'finished'
  entrySource?: RoomEntrySource
  startAt?: string | null
  hostScore?: number
  guestScore?: number
  hostRoundsCompleted?: number
  guestRoundsCompleted?: number
  winnerId?: string | null
  finishReason?: 'completed' | 'forfeit' | 'disconnect' | null
  hostEloDelta?: number
  guestEloDelta?: number
}

export interface VersusRoundResult {
  matchStatus: 'waiting' | 'in_progress' | 'finished'
  hostScore: number
  guestScore: number
  hostRoundsCompleted: number
  guestRoundsCompleted: number
  winnerId: string | null
  outcome: 'win' | 'loss' | 'draw' | null
  eloChange: number
}

export interface PublicRoomSummary {
  code: string
  roomName: string
  category: GameCategoryId
  mode: RoundMode
  difficulty?: DifficultyId
  hostId?: string
  hostHandle?: string
  hostAvatarUrl?: string
  hostName: string
  hostElo: number
  playerCount: number
  maxPlayers: number
  isPrivate: boolean
}
