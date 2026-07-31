export type Category = 'number' | 'alphabet' | 'grid' | 'sequence'

export type MatchOutcome = 'win' | 'loss' | 'draw'

export interface CategoryElo {
  category: Category
  label: string
  elo: number
  delta: number   // last-match change
}

export interface CategoryBest {
  category: Category
  label: string
  practiceScore: number
  practiceLevel: number
  rankedScore: number
  rankedLevel: number
  highestLevel: number
}

export interface Friend {
  id: string
  name: string
  handle: string
  elo: number
  status: 'online' | 'offline' | 'in-game'
}

export interface MatchEntry {
  id: string
  category: Category
  categoryLabel: string
  mode: string
  outcome: MatchOutcome
  score: number
  opponentName?: string
  eloChange?: number
  playedAt: string   // e.g. "Today", "Yesterday", "3d ago"
}

export interface ProfileData {
  username: string
  handle: string
  joinedLabel: string
  overallElo: number
  categoryElo: CategoryElo[]
  categoryBests: CategoryBest[]
  totalGames: number
  wins: number
  losses: number
  draws: number
  friends: Friend[]
  matchHistory: MatchEntry[]
}
