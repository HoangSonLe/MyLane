import { GameId } from '@/configs/enum'

export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'expired'

export interface MatchInviteData {
  id: string
  roomCode: string
  inviterId: string
  inviterName: string
  inviterHandle: string
  inviterAvatarUrl?: string
  inviterElo: number
  inviteeId: string
  category: GameId
  difficulty?: string
  mode?: string
  status: InviteStatus
  createdAt: string
  expiresAt?: string
}
