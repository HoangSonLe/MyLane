import { isSupabaseConfigured } from '@/services/backend-config'
import { matchInviteSupabaseService } from '@/services/supabase'
import { GameId } from '@/configs/enum'
import type { MatchInviteData, InviteStatus } from './match-invite.interface'

export const matchInviteService = {
  /** Send challenge invitation with full game settings */
  async sendChallengeInvite(
    inviteeId: string,
    category: GameId,
    difficulty: string = 'medium',
    mode: string = 'versus_ranked',
    rematchRoomCode?: string
  ): Promise<{ inviteId: string; roomCode: string }> {
    if (isSupabaseConfigured()) {
      return matchInviteSupabaseService.sendChallengeInvite(inviteeId, category, difficulty, mode, rematchRoomCode)
    }
    return {
      inviteId: 'mock-invite-123',
      roomCode: 'MEM-8472',
    }
  },

  /** Respond to invitation (Accept / Decline) */
  async respondToInvite(inviteId: string, accept: boolean): Promise<{ roomCode: string | null }> {
    if (isSupabaseConfigured()) {
      return matchInviteSupabaseService.respondToInvite(inviteId, accept)
    }
    return { roomCode: accept ? 'MEM-8472' : null }
  },

  /** Cancel invite */
  async cancelChallengeInvite(inviteId: string, roomCode: string): Promise<void> {
    if (isSupabaseConfigured()) {
      return matchInviteSupabaseService.cancelChallengeInvite(inviteId, roomCode)
    }
  },

  /** Directly poll for any pending match challenge invite for current logged in user */
  async checkPendingInvite(userId: string): Promise<MatchInviteData | null> {
    if (isSupabaseConfigured()) {
      return matchInviteSupabaseService.checkPendingInvite(userId)
    }
    return null
  },

  /** Directly check the current status of an invite */
  async checkInviteStatus(inviteId: string): Promise<{ status: InviteStatus; roomCode: string } | null> {
    if (isSupabaseConfigured()) {
      return matchInviteSupabaseService.checkInviteStatus(inviteId)
    }
    return null
  },

  /** Subscribe to incoming invites on opponent screen */
  subscribeToIncomingInvites(userId: string, onInvite: (invite: MatchInviteData) => void): () => void {
    if (isSupabaseConfigured()) {
      return matchInviteSupabaseService.subscribeToIncomingInvites(userId, onInvite)
    }
    return () => {}
  },

  /** Subscribe to invite response on challenger screen */
  subscribeToInviteResponse(
    inviteId: string,
    onResponse: (status: InviteStatus, roomCode: string) => void
  ): () => void {
    if (isSupabaseConfigured()) {
      return matchInviteSupabaseService.subscribeToInviteResponse(inviteId, onResponse)
    }
    return () => {}
  },
}
