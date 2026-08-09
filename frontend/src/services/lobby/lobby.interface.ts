export interface FriendCategoryRecord {
  bestScore?: number
  highestLevel?: number
  elo?: number
}

export interface Friend {
  id: string
  name: string
  handle: string
  avatarUrl?: string
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

/** Presence-indicator color for a friend's status — shared by every place that renders a status dot/label. */
export function friendStatusColor(status: Friend['status']): string {
  return status === 'in-game'
    ? 'var(--ma-warning)'
    : status === 'offline'
    ? 'var(--ma-fg-subtle)'
    : 'var(--ma-success)'
}
