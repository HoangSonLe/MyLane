import { apiClient } from '@/services/http/api-client'
import { isSupabaseConfigured } from '@/services/backend-config'
import { settingsSupabaseService } from '@/services/supabase'
import type { SettingsData } from './settings.interface'
import type { Locale } from '@/stores/locale.store'
import type { Theme } from '@/stores/theme.store'

export const settingsService = {
  /** Fetches the signed-in player's settings from backend/Supabase. */
  async getSettings(): Promise<SettingsData> {
    if (isSupabaseConfigured()) {
      const remote = await settingsSupabaseService.getSettings()
      return {
        notifications: remote?.notifications_enabled ?? true,
        sounds: remote?.sounds_enabled ?? true,
        haptics: remote?.haptics_enabled ?? true,
        locale: (remote?.preferred_language as Locale) || 'vi',
        theme: (remote?.theme as Theme) || 'dark',
        linkedMethods: [],
      }
    }

    const { data } = await apiClient.get<{ settings: SettingsData }>('/settings')
    return data.settings
  },

  /**
   * Persists the player's language preference to the server/Supabase.
   */
  async saveLocale(locale: Locale): Promise<void> {
    if (isSupabaseConfigured()) {
      await settingsSupabaseService.updateSettings({ language: locale })
      return
    }

    await apiClient.patch('/settings/locale', { locale })
  },

  /**
   * Persists the player's theme preference ('dark' | 'light') to Supabase.
   */
  async saveTheme(theme: Theme): Promise<void> {
    if (isSupabaseConfigured()) {
      await settingsSupabaseService.updateSettings({ theme })
    }
  },
}
