export interface FriendCategoryRecord {
  bestScore?: number
  highestLevel?: number
  elo?: number
}

export interface Friend {
  id: string
  name: string
  handle: string
  elo: number
  status: 'online' | 'offline' | 'in-game'
  friendshipStatus?: 'none' | 'pending_sent' | 'pending_received' | 'accepted'
  gamesPlayed?: number
  winRate?: number
  rank?: number
  records?: Record<string, FriendCategoryRecord>
}

export interface LobbyPlayer {
  name: string
  elo: number
}
