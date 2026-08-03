import { getSupabaseClient } from './supabase.client'
import type { Friend, FriendCategoryRecord } from '../lobby/lobby.interface'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function resolvePresenceStatus(rawStatus: unknown, updatedAt?: string | null): Friend['status'] {
  if (!updatedAt) return 'offline'

  const lastSeen = new Date(updatedAt).getTime()
  if (!Number.isFinite(lastSeen) || Date.now() - lastSeen >= 2 * 60 * 1000) {
    return 'offline'
  }

  return rawStatus === 'in_game' || rawStatus === 'in-game' ? 'in-game' : 'online'
}

export const lobbySupabaseService = {
  /**
   * Update user presence status ('online' | 'offline' | 'in-game') with updated_at timestamp
   */
  async updatePresence(status: 'online' | 'offline' | 'in-game' = 'online'): Promise<void> {
    const supabase = getSupabaseClient()
    if (!supabase) return

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) return

    // Map 'in-game' to 'in_game' to satisfy database constraint check
    const dbStatus = status === 'in-game' ? 'in_game' : status

    try {
      await supabase.from('profiles').upsert(
        {
          id: userId,
          name: userData?.user?.user_metadata?.full_name || userData?.user?.email?.split('@')[0] || 'Player',
          handle: userData?.user?.email?.split('@')[0] || 'player',
          status: dbStatus,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
    } catch (err) {
      console.error('Error updating presence:', err)
    }
  },

  /**
   * Fetch user's friends from Supabase `friendships` and `profiles` tables
   */
  async getFriends(): Promise<Friend[]> {
    const supabase = getSupabaseClient()
    if (!supabase) return []

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) return []

    // Also update current user's own presence heartbeat on fetch
    this.updatePresence('online').catch(() => {})

    const { data: friendships } = await supabase
      .from('friendships')
      .select('requester_id, addressee_id, status')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .eq('status', 'accepted')

    if (!friendships || friendships.length === 0) return []

    const friendIds = friendships.map((f: any) =>
      f.requester_id === userId ? f.addressee_id : f.requester_id
    )

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, handle, overall_elo, status, updated_at')
      .in('id', friendIds)

    return (profiles || []).map((p: any) => {
      let onlineStatus: 'online' | 'offline' | 'in-game' = 'offline'
      const rawStatus = p.status as string

      if (p.updated_at) {
        const lastSeen = new Date(p.updated_at).getTime()
        const now = Date.now()
        // If last updated_at is within 2 minutes, treat as active
        if (now - lastSeen < 2 * 60 * 1000) {
          if (rawStatus === 'in_game' || rawStatus === 'in-game') {
            onlineStatus = 'in-game'
          } else {
            onlineStatus = 'online'
          }
        } else {
          onlineStatus = 'offline'
        }
      }

      return {
        id: p.id,
        name: p.name || 'Friend',
        handle: p.handle || 'friend',
        elo: p.overall_elo || 1000,
        status: onlineStatus,
      }
    })
  },

  /**
   * Fetch the public profile details needed by FriendProfileModal.
   * The incoming value can be either a profile UUID or a handle because
   * challenge invites currently carry the handle in their lightweight model.
   */
  async getFriendProfile(friendIdOrHandle: string, handle?: string): Promise<Friend | null> {
    const supabase = getSupabaseClient()
    if (!supabase) return null

    const identifier = friendIdOrHandle.trim()
    if (!identifier) return null

    const lookupField = UUID_PATTERN.test(identifier) ? 'id' : 'handle'
    const lookupValue = lookupField === 'id' ? identifier : (handle || identifier)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, handle, overall_elo, status, updated_at')
      .eq(lookupField, lookupValue)
      .maybeSingle()

    if (profileError) throw profileError
    if (!profile) return null

    const [
      { data: matches },
      { data: eloRows },
      { data: bestRows },
      { count: higherEloCount },
    ] = await Promise.all([
      supabase.from('match_history').select('outcome').eq('user_id', profile.id),
      supabase.from('category_elo').select('category, elo').eq('user_id', profile.id),
      supabase
        .from('category_bests')
        .select('category, ranked_score, ranked_level, highest_level')
        .eq('user_id', profile.id),
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gt('overall_elo', profile.overall_elo ?? 1000),
    ])

    const eloByCategory = new Map<string, number>(
      (eloRows || []).map((row: any) => [row.category, row.elo ?? 1000])
    )

    const records: Record<string, FriendCategoryRecord> = {}
    ;(bestRows || []).forEach((row: any) => {
      const bestScore = row.ranked_score ?? 0
      const highestLevel = row.highest_level ?? row.ranked_level ?? 1

      // Only expose categories with an actual ranked record. This keeps
      // default 0/1 database rows from appearing as fake achievements.
      if (bestScore <= 0 && highestLevel <= 1) return

      records[row.category] = {
        bestScore,
        highestLevel,
        elo: eloByCategory.get(row.category),
      }
    })

    const gamesPlayed = matches ? matches.length : undefined
    const wins = matches?.filter((match: any) => match.outcome === 'win').length ?? 0

    return {
      id: profile.id,
      name: profile.name || 'Friend',
      handle: profile.handle || 'friend',
      elo: profile.overall_elo ?? 1000,
      status: resolvePresenceStatus(profile.status, profile.updated_at),
      gamesPlayed,
      winRate: gamesPlayed === undefined ? undefined : gamesPlayed === 0 ? 0 : Math.round((wins / gamesPlayed) * 100),
      rank: higherEloCount === null || higherEloCount === undefined ? undefined : higherEloCount + 1,
      records: Object.keys(records).length > 0 ? records : undefined,
    }
  },

  /**
   * Search profiles by name or handle for adding friends
   */
  async searchProfiles(query: string): Promise<Friend[]> {
    const supabase = getSupabaseClient()
    if (!supabase || !query.trim()) return []

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id

    const cleanQuery = query.trim()

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, handle, overall_elo, status')
      .or(`name.ilike.%${cleanQuery}%,handle.ilike.%${cleanQuery}%`)
      .neq('id', userId || '')
      .limit(10)

    if (!profiles || profiles.length === 0) return []

    const profileIds = profiles.map((p: any) => p.id)

    // Check existing friendships status for these searched profiles
    const { data: friendships } = userId
      ? await supabase
          .from('friendships')
          .select('requester_id, addressee_id, status')
          .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
          .in('requester_id', [...profileIds, userId])
          .in('addressee_id', [...profileIds, userId])
      : { data: [] }

    const friendshipMap = new Map<string, { status: string; isRequester: boolean }>()
    ;(friendships || []).forEach((f: any) => {
      const otherId = f.requester_id === userId ? f.addressee_id : f.requester_id
      friendshipMap.set(otherId, {
        status: f.status,
        isRequester: f.requester_id === userId,
      })
    })

    return profiles.map((p: any) => {
      const fInfo = friendshipMap.get(p.id)
      let friendshipStatus: 'none' | 'pending_sent' | 'pending_received' | 'accepted' = 'none'

      if (fInfo) {
        if (fInfo.status === 'accepted') {
          friendshipStatus = 'accepted'
        } else if (fInfo.status === 'pending') {
          friendshipStatus = fInfo.isRequester ? 'pending_sent' : 'pending_received'
        }
      }

      return {
        id: p.id,
        name: p.name || 'User',
        handle: p.handle || 'user',
        elo: p.overall_elo || 1000,
        status: (p.status as 'online' | 'offline' | 'in-game') || 'offline',
        friendshipStatus,
      }
    })
  },

  /**
   * Send friend request (status = 'pending') in Supabase `friendships` table
   */
  async addFriend(friendId: string): Promise<boolean> {
    const supabase = getSupabaseClient()
    if (!supabase) return false

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId || userId === friendId) return false

    try {
      // Ensure profile exists for current user to satisfy foreign key constraint
      await supabase.from('profiles').upsert(
        {
          id: userId,
          name: userData?.user?.user_metadata?.full_name || userData?.user?.email?.split('@')[0] || 'Player',
          handle: userData?.user?.email?.split('@')[0] || 'player',
        },
        { onConflict: 'id' }
      )

      const { error } = await supabase.from('friendships').upsert(
        {
          requester_id: userId,
          addressee_id: friendId,
          status: 'pending',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'requester_id,addressee_id' }
      )

      if (error) {
        console.error('Error sending friend request:', error.message, error.details)
        return false
      }

      return true
    } catch (err) {
      console.error('addFriend exception:', err)
      return false
    }
  },

  /**
   * Fetch incoming friend requests (status = 'pending' where addressee_id = userId)
   */
  async getIncomingFriendRequests(): Promise<Friend[]> {
    const supabase = getSupabaseClient()
    if (!supabase) return []

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) return []

    try {
      const { data: requests, error: reqErr } = await supabase
        .from('friendships')
        .select('requester_id')
        .eq('addressee_id', userId)
        .eq('status', 'pending')

      if (reqErr) {
        console.error('getIncomingFriendRequests error:', reqErr)
        return []
      }

      if (!requests || requests.length === 0) return []

      const requesterIds = requests.map((r: any) => r.requester_id).filter(Boolean)
      if (requesterIds.length === 0) return []

      const { data: profiles, error: profErr } = await supabase
        .from('profiles')
        .select('id, name, handle, overall_elo, status')
        .in('id', requesterIds)

      if (profErr) {
        console.error('getIncomingFriendRequests profiles error:', profErr)
      }

      return (profiles || []).map((p: any) => ({
        id: p.id,
        name: p.name || 'Player',
        handle: p.handle || 'player',
        elo: p.overall_elo || 1000,
        status: (p.status as 'online' | 'offline' | 'in-game') || 'online',
      }))
    } catch (err) {
      console.error('getIncomingFriendRequests exception:', err)
      return []
    }
  },

  /**
   * Respond to friend request (accept or decline)
   */
  async respondToFriendRequest(requesterId: string, accept: boolean): Promise<boolean> {
    const supabase = getSupabaseClient()
    if (!supabase) return false

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) return false

    try {
      if (accept) {
        const { error } = await supabase
          .from('friendships')
          .update({ status: 'accepted', updated_at: new Date().toISOString() })
          .or(`and(requester_id.eq.${requesterId},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${requesterId})`)

        return !error
      } else {
        const { error } = await supabase
          .from('friendships')
          .delete()
          .or(`and(requester_id.eq.${requesterId},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${requesterId})`)

        return !error
      }
    } catch {
      return false
    }
  },

  /**
   * Realtime Supabase subscription for changes on `friendships` table (friend requests, accepts, declines)
   */
  subscribeToFriendRequests(userId: string, callback: () => void): () => void {
    const supabase = getSupabaseClient()
    if (!supabase || !userId) return () => {}

    const channel = supabase
      .channel(`friendships:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `addressee_id=eq.${userId}`,
        },
        () => callback()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `requester_id=eq.${userId}`,
        },
        () => callback()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },

  /**
   * Get recommended active players to connect with
   */
  async getRecommendedFriends(): Promise<Friend[]> {
    const supabase = getSupabaseClient()
    if (!supabase) return []

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) return []

    const { data: existing } = await supabase
      .from('friendships')
      .select('requester_id, addressee_id')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)

    const excludedIds = new Set<string>([userId])
    ;(existing || []).forEach((f: any) => {
      if (f.requester_id) excludedIds.add(f.requester_id)
      if (f.addressee_id) excludedIds.add(f.addressee_id)
    })

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, handle, overall_elo, status')
      .neq('id', userId)
      .limit(10)

    const filtered = (profiles || []).filter((p: any) => p.id && !excludedIds.has(p.id))

    return filtered.map((p: any) => ({
      id: p.id,
      name: p.name || 'Player',
      handle: p.handle || 'player',
      elo: p.overall_elo || 1000,
      status: (p.status as 'online' | 'offline' | 'in-game') || 'online',
    }))
  },
}
