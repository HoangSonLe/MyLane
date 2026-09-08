import { getSupabaseClient, openRealtimeChannel } from './supabase.client'

export interface AccountInviteMuteRecord {
  mutedUserId: string
  mutedHandle: string
  untilTimestamp: string
}

function requireSupabase() {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase client uninitialized')
  return supabase
}

function throwInviteMuteError(error: any): never {
  throw new Error(error?.message || error?.details || 'Invite mute request failed')
}

function mapMuteRow(row: any): AccountInviteMuteRecord | null {
  if (!row?.muted_user_id || !row?.muted_handle || !row?.until_timestamp) return null
  return {
    mutedUserId: row.muted_user_id,
    mutedHandle: row.muted_handle,
    untilTimestamp: row.until_timestamp,
  }
}

export const inviteMuteSupabaseService = {
  async getActiveMutes(userId: string): Promise<AccountInviteMuteRecord[]> {
    const supabase = requireSupabase()
    const { data, error } = await supabase
      .from('invite_mutes')
      .select('muted_user_id, muted_handle, until_timestamp')
      .eq('user_id', userId)
      .gt('until_timestamp', new Date().toISOString())

    if (error) throwInviteMuteError(error)
    return (data || [])
      .map(mapMuteRow)
      .filter((record): record is AccountInviteMuteRecord => record !== null)
  },

  async upsertMute(
    userId: string,
    target: { userId: string; handle: string },
    untilTimestamp: string
  ): Promise<void> {
    const supabase = requireSupabase()
    const { error } = await supabase.from('invite_mutes').upsert(
      {
        user_id: userId,
        muted_user_id: target.userId,
        muted_handle: target.handle,
        until_timestamp: untilTimestamp,
      },
      { onConflict: 'user_id,muted_user_id' }
    )
    if (error) throwInviteMuteError(error)
  },

  async expireMute(userId: string, mutedUserId: string): Promise<void> {
    const supabase = requireSupabase()
    const { error } = await supabase
      .from('invite_mutes')
      .update({ until_timestamp: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('muted_user_id', mutedUserId)
    if (error) throwInviteMuteError(error)
  },

  subscribeToMutes(
    userId: string,
    onChange: (record: AccountInviteMuteRecord) => void
  ): () => void {
    const supabase = getSupabaseClient()
    if (!supabase || !userId) return () => {}

    return openRealtimeChannel(supabase, `invite-mutes:${userId}`, (channel) => {
      channel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'invite_mutes',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const record = mapMuteRow(payload.new)
            if (record) onChange(record)
          }
        )
        .subscribe()
    })
  },
}
