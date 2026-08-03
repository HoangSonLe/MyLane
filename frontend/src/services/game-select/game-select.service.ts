import { apiClient } from '@/services/http/api-client'
import type { GameStats } from './game-select.interface'

export const gameSelectService = {
  /** Fetches per-player Elo/best-score/highest-level for all 4 games (the games themselves are fixed, not server data). */
  async getStats(): Promise<GameStats[]> {
    const { data } = await apiClient.get<{ stats: GameStats[] }>('/game-select/stats')
    return data.stats
  },
}
