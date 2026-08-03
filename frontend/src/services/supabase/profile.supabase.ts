import { getSupabaseClient } from './supabase.client'
import type { ProfileStats } from '../profile/profile.interface'
import { GameId } from '@/configs/enum'

export const profileSupabaseService = {
  /**
   * Fetch Profile Stats from Supabase
   */
  async getProfile(): Promise<ProfileStats> {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return {
        username: 'Guest Player',
        handle: 'guest',
        joinedLabel: 'Guest Session',
        overallElo: 1000,
        totalGames: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        matchHistory: [],
        categoryElo: [],
        categoryBests: [],
      }
    }

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) {
      return {
        username: 'Guest Player',
        handle: 'guest',
        joinedLabel: 'Guest Session',
        overallElo: 1000,
        totalGames: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        matchHistory: [],
        categoryElo: [],
        categoryBests: [],
      }
    }

    const [
      { data: profileRow },
      { data: matches },
      { data: eloRows },
      { data: bestRows },
    ] = await Promise.all([
      supabase.from('profiles').select('name, handle, overall_elo, joined_label').eq('id', userId).maybeSingle(),
      supabase.from('match_history').select('*').eq('user_id', userId).order('played_at', { ascending: false }).limit(30),
      supabase.from('category_elo').select('*').eq('user_id', userId),
      supabase.from('category_bests').select('*').eq('user_id', userId),
    ])

    const matchHistory = (matches || []).map((m: any) => ({
      id: m.id,
      category: m.category,
      categoryLabel: m.category_label || m.category,
      mode: m.mode,
      outcome: m.outcome,
      score: m.score,
      playedAt: m.played_at,
    }))

    const wins = (matches || []).filter((m: any) => m.outcome === 'win').length
    const losses = (matches || []).filter((m: any) => m.outcome === 'loss').length
    const draws = (matches || []).filter((m: any) => m.outcome === 'draw').length

    const ALL_CATEGORIES: { id: GameId; label: string }[] = [
      { id: GameId.NUMBER, label: 'Number' },
      { id: GameId.ALPHABET, label: 'Alphabet' },
      { id: GameId.GRID, label: 'Grid' },
      { id: GameId.SEQUENCE, label: 'Sequence' },
      { id: GameId.COLOR, label: 'Color' },
    ]

    const eloMap = new Map((eloRows || []).map((e: any) => [e.category, e]))
    const bestMap = new Map((bestRows || []).map((b: any) => [b.category, b]))

    const categoryElo = ALL_CATEGORIES.map((c) => {
      const e = eloMap.get(c.id)
      return {
        category: c.id,
        label: c.label,
        elo: e?.elo || 1000,
        delta: e?.last_delta || 0,
        lastDelta: e?.last_delta || 0,
      }
    })

    const categoryBests = ALL_CATEGORIES.map((c) => {
      const b = bestMap.get(c.id)
      return {
        category: c.id,
        label: c.label,
        practiceScore: b?.practice_score || 0,
        practiceLevel: b?.practice_level || 1,
        rankedScore: b?.ranked_score || 0,
        rankedLevel: b?.ranked_level || 1,
        highestLevel: b?.highest_level || 1,
      }
    })

    return {
      username: profileRow?.name || userData?.user?.user_metadata?.full_name || userData?.user?.email?.split('@')[0] || 'Player',
      handle: profileRow?.handle || userData?.user?.email?.split('@')[0] || 'player',
      joinedLabel: profileRow?.joined_label || 'Member',
      overallElo: profileRow?.overall_elo || 1000,
      totalGames: (matches || []).length,
      wins,
      losses,
      draws,
      matchHistory,
      categoryElo,
      categoryBests,
    }
  },
}
