import type { Friend } from '@/services/lobby/lobby.interface'

export type { Friend }

export type Category = 'number' | 'alphabet' | 'grid' | 'sequence' | 'color'

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

/** Server-provided profile stats — friends are fetched separately via `lobbyService` (same list as Lobby). */
export interface ProfileStats {
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
  matchHistory: MatchEntry[]
}

/** Shape the Profile screen's components render — `ProfileStats` merged with the player's real friends list. */
export interface ProfileData extends ProfileStats {
  friends: Friend[]
}
