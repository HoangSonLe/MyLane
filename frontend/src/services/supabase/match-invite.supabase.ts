import { GameId } from '@/configs/enum'
import type { InviteStatus, MatchInviteData } from '../match-invite/match-invite.interface'
import { getSupabaseClient } from './supabase.client'

function requireSupabase() {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase client uninitialized')
  return supabase
}

function throwInviteError(error: any): never {
  throw new Error(error?.message || error?.details || 'Invite request failed')
}

async function mapInviteRow(supabase: any, row: any): Promise<MatchInviteData> {
  const { data: inviterProfile, error } = await supabase
    .from('profiles')
    .select('name, handle, overall_elo')
    .eq('id', row.inviter_id)
    .maybeSingle()
  if (error) throwInviteError(error)
  const { data: categoryElo, error: categoryEloError } = await supabase
    .from('category_elo')
    .select('elo')
    .eq('user_id', row.inviter_id)
    .eq('category', row.category)
    .maybeSingle()
  if (categoryEloError) throwInviteError(categoryEloError)

  return {
    id: row.id,
    roomCode: row.room_code,
    inviterId: row.inviter_id,
    inviterName: inviterProfile?.name || 'Bạn bè',
    inviterHandle: inviterProfile?.handle || 'friend',
    inviterElo: categoryElo?.elo ?? inviterProfile?.overall_elo ?? 1000,
    inviteeId: row.invitee_id,
    category: row.category as GameId,
    difficulty: row.difficulty || 'medium',
    mode: row.mode || 'versus_ranked',
    status: row.status as InviteStatus,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  }
}

export const matchInviteSupabaseService = {
  async sendChallengeInvite(
    inviteeId: string,
    category: GameId,
    difficulty = 'medium',
    mode = 'versus_ranked',
    /** Room code of a just-finished match against this exact opponent — lets
     * a non-friend Rematch bypass the friend-check. See
     * create_match_invite's p_rematch_room_code in database/schema.sql. */
    rematchRoomCode?: string
  ): Promise<{ inviteId: string; roomCode: string }> {
    const supabase = requireSupabase()
    const { data, error } = await supabase.rpc('create_match_invite', {
      p_invitee_id: inviteeId,
      p_category: category,
      p_difficulty: difficulty.replace(/-/g, '_'),
      p_mode: mode.replace(/-/g, '_'),
      p_rematch_room_code: rematchRoomCode ?? null,
    })
    if (error) throwInviteError(error)
    const row = Array.isArray(data) ? data[0] : data
    if (!row) throw new Error('Invite was not created')
    return { inviteId: row.invite_id, roomCode: row.room_code }
  },

  async respondToInvite(inviteId: string, accept: boolean): Promise<{ roomCode: string | null }> {
    const supabase = requireSupabase()
    const { data, error } = await supabase.rpc('respond_to_match_invite', {
      p_invite_id: inviteId,
      p_accept: accept,
    })
    if (error) throwInviteError(error)
    const row = Array.isArray(data) ? data[0] : data
    return { roomCode: row?.invite_status === 'accepted' ? row.room_code : null }
  },

  async cancelChallengeInvite(inviteId: string, _roomCode: string): Promise<void> {
    const supabase = requireSupabase()
    const { error } = await supabase.rpc('cancel_match_invite', { p_invite_id: inviteId })
    if (error) throwInviteError(error)
  },

  subscribeToIncomingInvites(userId: string, onInvite: (invite: MatchInviteData) => void): () => void {
    const supabase = getSupabaseClient()
    if (!supabase || !userId) return () => {}
    const channel = supabase
      .channel(`match-invites:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'match_invites',
          filter: `invitee_id=eq.${userId}`,
        },
        async (payload) => {
          const row = payload.new as any
          if (row?.status !== 'pending' || new Date(row.expires_at).getTime() <= Date.now()) return
          try {
            onInvite(await mapInviteRow(supabase, row))
          } catch {
            // Polling remains as the recovery path.
          }
        }
      )
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  },

  subscribeToInviteResponse(
    inviteId: string,
    onResponse: (status: InviteStatus, roomCode: string) => void
  ): () => void {
    const supabase = getSupabaseClient()
    if (!supabase || !inviteId) return () => {}
    const channel = supabase
      .channel(`invite-response:${inviteId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'match_invites', filter: `id=eq.${inviteId}` },
        (payload) => {
          const row = payload.new as any
          if (row && ['accepted', 'declined', 'expired'].includes(row.status)) {
            onResponse(row.status as InviteStatus, row.room_code)
          }
        }
      )
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  },

  async checkPendingInvite(userId: string): Promise<MatchInviteData | null> {
    const supabase = requireSupabase()
    const { error: expireError } = await supabase.rpc('expire_stale_match_invites')
    if (expireError) throwInviteError(expireError)
    const { data: row, error } = await supabase
      .from('match_invites')
      .select('*')
      .eq('invitee_id', userId)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throwInviteError(error)
    return row ? mapInviteRow(supabase, row) : null
  },

  async checkInviteStatus(inviteId: string): Promise<{ status: InviteStatus; roomCode: string } | null> {
    const supabase = requireSupabase()
    const { error: expireError } = await supabase.rpc('expire_stale_match_invites')
    if (expireError) throwInviteError(expireError)
    const { data: row, error } = await supabase
      .from('match_invites')
      .select('status, room_code')
      .eq('id', inviteId)
      .maybeSingle()
    if (error) throwInviteError(error)
    return row ? { status: row.status as InviteStatus, roomCode: row.room_code } : null
  },
}
