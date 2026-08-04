import { getSupabaseClient } from './supabase.client'

export const settingsSupabaseService = {
  /**
   * Save User Settings to Supabase `user_settings` table
   */
  async updateSettings(settings: {
    notifications?: boolean
    sounds?: boolean
    haptics?: boolean
    language?: 'en' | 'vi'
    theme?: string
    hasSeenOnboarding?: boolean
  }) {
    const supabase = getSupabaseClient()
    if (!supabase) return

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) return

    try {
      // Ensure profile exists to satisfy foreign key constraint
      await supabase.from('profiles').upsert(
        {
          id: userId,
          name: userData?.user?.user_metadata?.full_name || userData?.user?.email?.split('@')[0] || 'Player',
          handle: userData?.user?.email?.split('@')[0] || 'player',
        },
        { onConflict: 'id', ignoreDuplicates: true }
      )

      const payload: Record<string, any> = {
        user_id: userId,
        updated_at: new Date().toISOString(),
      }

      if (typeof settings.notifications === 'boolean') payload.notifications_enabled = settings.notifications
      if (typeof settings.sounds === 'boolean') payload.sounds_enabled = settings.sounds
      if (typeof settings.haptics === 'boolean') payload.haptics_enabled = settings.haptics
      if (typeof settings.hasSeenOnboarding === 'boolean') payload.has_seen_onboarding = settings.hasSeenOnboarding
      if (settings.language) payload.preferred_language = settings.language
      if (settings.theme) payload.theme = settings.theme

      await supabase.from('user_settings').upsert(payload, { onConflict: 'user_id' })
    } catch {
      // Gracefully handle RLS or connection issues
    }
  },

  /**
   * Get User Settings from Supabase `user_settings` table
   */
  async getSettings() {
    const supabase = getSupabaseClient()
    if (!supabase) return null

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) return null

    try {
      const { data } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (data) return data

      // Ensure profile exists first to satisfy foreign key constraint
      await supabase.from('profiles').upsert(
        {
          id: userId,
          name: userData?.user?.user_metadata?.full_name || userData?.user?.email?.split('@')[0] || 'Player',
          handle: userData?.user?.email?.split('@')[0] || 'player',
        },
        { onConflict: 'id', ignoreDuplicates: true }
      )

      // If no row exists yet, initialize default settings row in Database
      const defaultSettings = {
        user_id: userId,
        notifications_enabled: true,
        sounds_enabled: true,
        haptics_enabled: true,
        preferred_language: 'vi',
        theme: 'light',
        has_seen_onboarding: false,
      }

      await supabase.from('user_settings').upsert(defaultSettings, { onConflict: 'user_id' })
      return defaultSettings
    } catch {
      return null
    }
  },
}
