import { apiClient } from '@/services/http/api-client'
import { isSupabaseConfigured } from '@/services/backend-config'
import { gameSupabaseService } from '@/services/supabase'
import type { GameStats } from './game-select.interface'

export const gameSelectService = {
  /** Fetches per-player Elo/best-score/highest-level for all 5 games (the games themselves are fixed, not server data). */
  async getStats(): Promise<GameStats[]> {
    if (isSupabaseConfigured()) {
      return gameSupabaseService.getStats()
    }

    const { data } = await apiClient.get<{ stats: GameStats[] }>('/game-select/stats')
    return data.stats
  },
}
