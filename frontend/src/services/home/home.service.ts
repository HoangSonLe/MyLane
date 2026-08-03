import { apiClient } from '@/services/http/api-client'
import type { LastPlayed } from './home.interface'

export const homeService = {
  /** Fetches the signed-in player's last-played session (null for guests — no server-side save). */
  async getHomeData(): Promise<{ lastPlayed: LastPlayed | null }> {
    const { data } = await apiClient.get<{ lastPlayed: LastPlayed | null }>('/home')
    return data
  },
}
