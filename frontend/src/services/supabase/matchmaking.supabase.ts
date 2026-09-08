import { DifficultyId } from '@/configs/enum'
import type { GameCategoryId } from '../versus-room/versus-room.interface'
import { getSupabaseClient, openRealtimeChannel } from './supabase.client'

export type MatchmakingQueueStatus = 'searching' | 'matched' | 'expired' | 'missing'

export interface MatchmakingQueueResult {
  status: MatchmakingQueueStatus
  queueId?: string
  roomCode?: string
  matchId?: string
}

function requireSupabase() {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase client uninitialized')
  return supabase
}

function dbDifficulty(difficulty: DifficultyId): string {
  return String(difficulty).replace(/-/g, '_')
}

function throwRpcError(error: any): never {
  const message = error?.message || error?.details || 'Matchmaking request failed'
  throw new Error(message)
}

/**
 * Queue mutations are deliberately routed through PostgreSQL functions. Pairing
 * two rows and creating their room must be one transaction; a client-side
 * update guard cannot prevent both clients from claiming one another.
 */
export const matchmakingSupabaseService = {
  async getCategoryElo(category: GameCategoryId): Promise<number> {
    const supabase = requireSupabase()
    const { data: userData, error: authError } = await supabase.auth.getUser()
    if (authError) throwRpcError(authError)
    const userId = userData?.user?.id
    if (!userId) throw new Error('AUTH_REQUIRED')

    const { data, error } = await supabase
      .from('category_elo')
      .select('elo')
      .eq('user_id', userId)
      .eq('category', category)
      .maybeSingle()

    if (error) throwRpcError(error)
    if (data?.elo !== undefined && data?.elo !== null) return data.elo

    const { data: profile } = await supabase
      .from('profiles')
      .select('overall_elo')
      .eq('id', userId)
      .maybeSingle()

    return profile?.overall_elo ?? 1000
  },

  async enterQueue(input: {
    category: GameCategoryId
    difficulty: DifficultyId
    userElo: number
    eloDelta: number
    attemptId: string
  }): Promise<string> {
    const supabase = requireSupabase()
    const { data, error } = await supabase.rpc('enter_matchmaking_queue', {
      p_category: input.category,
      p_difficulty: dbDifficulty(input.difficulty),
      p_user_elo: input.userElo,
      p_elo_delta: input.eloDelta,
      p_attempt_id: input.attemptId,
    })

    if (error) throwRpcError(error)
    return String(data)
  },

  async updateQueueWindow(input: {
    attemptId: string
    userElo: number
    eloDelta: number
  }): Promise<void> {
    const supabase = requireSupabase()
    const { error } = await supabase.rpc('update_matchmaking_window', {
      p_attempt_id: input.attemptId,
      p_user_elo: input.userElo,
      p_elo_delta: input.eloDelta,
    })
    if (error) throwRpcError(error)
  },

  async pollQueue(attemptId: string): Promise<MatchmakingQueueResult> {
    const supabase = requireSupabase()
    const { data, error } = await supabase.rpc('poll_matchmaking', {
      p_attempt_id: attemptId,
    })

    if (error) throwRpcError(error)
    const row = Array.isArray(data) ? data[0] : data
    if (!row) return { status: 'missing' }

    return {
      status: row.match_status as MatchmakingQueueStatus,
      queueId: row.queue_id || undefined,
      roomCode: row.room_code || undefined,
      matchId: row.match_id || undefined,
    }
  },

  subscribeToQueueMatch(
    userId: string,
    attemptId: string,
    onMatched: (roomCode: string) => void
  ): () => void {
    const supabase = getSupabaseClient()
    if (!supabase || !userId) return () => {}

    return openRealtimeChannel(supabase, `matchmaking:${userId}:${attemptId}`, (channel) => {
      channel
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'matchmaking_queue',
            filter: `user_id=eq.${userId}`,
          },
          (payload: any) => {
            const row = payload.new
            if (
              row?.attempt_id === attemptId &&
              row.status === 'matched' &&
              row.room_code &&
              row.room_code !== 'PENDING'
            ) {
              onMatched(row.room_code)
            }
          }
        )
        .subscribe()
    })
  },

  async leaveQueue(attemptId?: string): Promise<void> {
    const supabase = getSupabaseClient()
    if (!supabase) return
    const { error } = await supabase.rpc('leave_matchmaking_queue', {
      p_attempt_id: attemptId || null,
    })
    if (error) throwRpcError(error)
  },

  async clearStaleQueueRows(): Promise<void> {
    return this.leaveQueue()
  },
}
