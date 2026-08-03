import { apiClient } from '@/services/http/api-client'
import { isSupabaseConfigured } from '@/services/backend-config'
import { gameSupabaseService } from '@/services/supabase'
import type { BoardType, Category, LeaderboardBoard, SortMetric } from './leaderboard.interface'

export const leaderboardService = {
  /** Fetches ranked entries for a board/category/metric combo, plus the signed-in player's pinned row if out of range. */
  async getBoard(params: { board: BoardType; category: Category; metric: SortMetric }): Promise<LeaderboardBoard> {
    if (isSupabaseConfigured()) {
      return gameSupabaseService.getLeaderboard(params)
    }

    const { data } = await apiClient.get<LeaderboardBoard>('/leaderboard', { params })
    return data
  },
}
