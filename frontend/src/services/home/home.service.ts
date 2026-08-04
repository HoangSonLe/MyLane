import { apiClient } from '@/services/http/api-client'
import { getSupabaseClient } from '@/services/supabase'
import type { LastPlayed } from './home.interface'

const GAME_LABELS: Record<string, string> = {
  number: 'Number Memory',
  alphabet: 'Alphabet Memory',
  grid: 'Grid Memory',
  sequence: 'Sequence Memory',
  color: 'Color Memory',
}

const MODE_LABELS: Record<string, string> = {
  'solo-practice': 'Solo Practice',
  'solo_practice': 'Solo Practice',
  'solo-ranked': 'Solo Ranked',
  'solo_ranked': 'Solo Ranked',
  'solo-endless': 'Solo Endless',
  'solo_endless': 'Solo Endless',
  'versus-ranked': 'Versus Ranked',
  'versus_ranked': 'Versus Ranked',
  'versus-unranked': 'Versus Unranked',
  'versus_unranked': 'Versus Unranked',
}

export const homeService = {
  /** Fetches the signed-in player's last-played session (null for guests — no server-side save). */
  async getHomeData(): Promise<{ lastPlayed: LastPlayed | null }> {
    const supabase = getSupabaseClient()
    if (supabase) {
      try {
        const { data: userData } = await supabase.auth.getUser()
        const userId = userData?.user?.id
        if (userId) {
          const { data: latestMatch } = await supabase
            .from('match_history')
            .select('*')
            .eq('user_id', userId)
            .order('played_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          if (latestMatch) {
            const gameName = GAME_LABELS[latestMatch.category] || latestMatch.category_label || latestMatch.category
            const modeName = MODE_LABELS[latestMatch.mode] || latestMatch.mode
            return {
              lastPlayed: {
                game: gameName,
                mode: modeName,
                score: latestMatch.level_reached || latestMatch.rounds_cleared || 1,
                level: latestMatch.level_reached || 1,
                maxScore: 10,
                roundsPlayed: latestMatch.rounds_cleared || 0,
              },
            }
          }
        }
      } catch (err) {
        console.warn('Failed to fetch lastPlayed from Supabase:', err)
      }
    }

    try {
      const { data } = await apiClient.get<{ lastPlayed: LastPlayed | null }>('/home')
      return data
    } catch {
      return { lastPlayed: null }
    }
  },
}
