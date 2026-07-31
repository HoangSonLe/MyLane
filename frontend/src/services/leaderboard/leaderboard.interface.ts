export type BoardType =
  | 'global-alltime'
  | 'weekly'
  | 'monthly'
  | 'friends'
  | 'top100'
  | 'endless'

export type SortMetric = 'score' | 'elo'

export type Category = 'number' | 'alphabet' | 'grid' | 'sequence'

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  handle: string
  score: number
  elo: number
  isCurrentUser?: boolean
}
