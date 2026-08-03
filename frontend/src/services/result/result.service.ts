import { apiClient } from '@/services/http/api-client'
import { isSupabaseConfigured } from '@/services/backend-config'
import { gameSupabaseService } from '@/services/supabase'
import type { GameResultInput, ResultData } from './result.interface'

export const resultService = {
  /** Submits a just-finished session — the backend/Supabase computes the final score and updates stored stats. */
  async submitResult(input: GameResultInput): Promise<ResultData> {
    if (isSupabaseConfigured()) {
      return gameSupabaseService.submitResult(input)
    }

    const { data } = await apiClient.post<{ result: ResultData }>('/game/result', input)
    return data.result
  },
}
