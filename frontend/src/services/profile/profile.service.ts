import { apiClient } from '@/services/http/api-client'
import { isSupabaseConfigured } from '@/services/backend-config'
import { profileSupabaseService } from '@/services/supabase'
import type { ProfileStats } from './profile.interface'

export const profileService = {
  /** Fetches the signed-in player's stats from backend/Supabase. */
  async getProfile(): Promise<ProfileStats> {
    if (isSupabaseConfigured()) {
      const res = await profileSupabaseService.getProfile()
      return res
    }

    const { data } = await apiClient.get<{ profile: ProfileStats }>('/profile')
    return data.profile
  },
}
