import { getSupabaseClient } from './supabase.client'
import { GameId } from '../game-select/game-select.interface'
import type { ProfileStats, ProfileIdentity, UpdateProfileInput } from '../profile/profile.interface'
import { GAME_LABELS } from '../gameplay/game-rules'
import { calculateOverallElo } from '@/lib/utils'

function throwIfSupabaseError(error: any, actionDescription: string) {
  if (error) {
    throw new Error(`[Supabase Error] ${actionDescription}: ${error.message}`)
  }
}

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
      supabase.from('profiles').select('name, handle, avatar_url, overall_elo, joined_label').eq('id', userId).maybeSingle(),
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
      score: Number(m.score ?? 0),
      opponentName: m.opponent_name || undefined,
      playerRoundScore: m.player_round_score == null ? undefined : Number(m.player_round_score),
      opponentRoundScore: m.opponent_round_score == null ? undefined : Number(m.opponent_round_score),
      eloChange: m.mode === 'versus_ranked' && m.elo_change != null ? Number(m.elo_change) : undefined,
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

    const computedOverallElo = calculateOverallElo(eloRows, profileRow?.overall_elo || 1000)

    return {
      username: profileRow?.name || userData?.user?.user_metadata?.full_name || userData?.user?.email?.split('@')[0] || 'Player',
      handle: profileRow?.handle || userData?.user?.email?.split('@')[0] || 'player',
      avatarUrl: profileRow?.avatar_url || userData?.user?.user_metadata?.avatar_url || undefined,
      joinedLabel: profileRow?.joined_label || 'Member',
      overallElo: computedOverallElo,
      totalGames: (matches || []).length,
      wins,
      losses,
      draws,
      matchHistory,
      categoryElo,
      categoryBests,
    }
  },

  async updateProfile(input: UpdateProfileInput): Promise<ProfileIdentity> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('PROFILE_BACKEND_UNAVAILABLE')

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) throw new Error('PROFILE_AUTH_REQUIRED')

    const username = input.username.trim()
    const handle = input.handle.trim().toLowerCase()
    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: username,
        handle,
        avatar_url: input.avatarUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('name, handle, avatar_url')
      .single()

    if (error) {
      if (error.code === '23505') throw new Error('PROFILE_HANDLE_TAKEN')
      throw new Error(error.message || 'PROFILE_SAVE_FAILED')
    }

    // Keep Supabase Auth metadata aligned for surfaces that read auth before
    // the public profile row has loaded. The profile table remains canonical.
    await supabase.auth.updateUser({
      data: { full_name: data.name, avatar_url: data.avatar_url },
    })

    return {
      username: data.name,
      handle: data.handle,
      avatarUrl: data.avatar_url || undefined,
    }
  },

  async uploadAvatar(file: File): Promise<string> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('PROFILE_BACKEND_UNAVAILABLE')

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) throw new Error('PROFILE_AUTH_REQUIRED')

    const path = `${userId}/avatar.webp`
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, {
        upsert: true,
        contentType: 'image/webp',
        cacheControl: '3600',
      })

    if (error) throw new Error(error.message || 'PROFILE_AVATAR_UPLOAD_FAILED')

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return `${data.publicUrl}?v=${Date.now()}`
  },
}
