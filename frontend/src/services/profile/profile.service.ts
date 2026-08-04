import { apiClient } from '@/services/http/api-client'
import { isSupabaseConfigured } from '@/services/backend-config'
import { profileSupabaseService } from '@/services/supabase'
import type { ProfileIdentity, ProfileStats, UpdateProfileInput } from './profile.interface'
import { calculateOverallElo } from '@/lib/utils'

export const profileService = {
  /** Fetches the signed-in player's stats from backend/Supabase. */
  async getProfile(): Promise<ProfileStats> {
    let profile: ProfileStats
    if (isSupabaseConfigured()) {
      profile = await profileSupabaseService.getProfile()
    } else {
      const { data } = await apiClient.get<{ profile: ProfileStats }>('/profile')
      profile = data.profile
    }

    if (profile.categoryElo && profile.categoryElo.length > 0) {
      profile.overallElo = calculateOverallElo(profile.categoryElo, profile.overallElo)
    }

    return profile
  },

  /** Updates the signed-in player's public identity. */
  async updateProfile(input: UpdateProfileInput): Promise<ProfileIdentity> {
    if (isSupabaseConfigured()) {
      return profileSupabaseService.updateProfile(input)
    }

    const { data } = await apiClient.patch<{ profile: ProfileIdentity }>('/profile', input)
    return data.profile
  },

  /** Stores a normalized avatar and returns its public URL. */
  async uploadAvatar(file: File): Promise<string> {
    if (isSupabaseConfigured()) {
      return profileSupabaseService.uploadAvatar(file)
    }

    // Mock mode has no object storage process. A blob URL keeps the browser
    // flow realistic for the current session while production uses Supabase.
    return URL.createObjectURL(file)
  },
}
