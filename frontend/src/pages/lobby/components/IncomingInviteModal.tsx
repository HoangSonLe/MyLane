import { useState } from 'react'
import { IconSwords, IconChevronRight14, IconDiffEasy, IconDiffMedium, IconDiffHard, IconDiffSuperHard } from '@/components/ui/icons'
import { ModalBackdrop } from '@/components/ui/ModalBackdrop'
import { FriendProfileModal } from '@/pages/lobby/components/FriendProfileModal'
import { useTranslation } from '@/i18n/useTranslation'
import type { GameId } from '@/configs/enum'
import type { Friend } from '@/services/lobby/lobby.interface'
import {
  getLocalizedDifficultyLabel,
  getLocalizedGameLabel,
  getLocalizedModeLabel,
} from '@/services/gameplay/gameplay-screen.types'

export interface IncomingInviteData {
  id?: string
  inviterId: string
  inviterName: string
  inviterHandle: string
  inviterElo: number
  gameCategory: GameId
  difficulty?: string
  mode?: string
  roomCode: string
}

interface IncomingInviteModalProps {
  invite: IncomingInviteData | null
  show: boolean
  onAccept: (code: string) => void
  onDecline: () => void
  onOpenMute: (inviterId: string, inviterHandle: string, inviterName: string) => void
}

const GAME_DETAILS: Record<string, { label: string; modeLabel: string; desc: string; icon: string }> = {
  number: {
    label: 'Number Memory',
    modeLabel: 'Đấu Trí Con Số',
    desc: 'Ghi nhớ chuỗi chữ số tăng dần theo từng vòng. Người chơi có chuỗi chính xác dài nhất sẽ thắng!',
    icon: '🔢',
  },
  alphabet: {
    label: 'Alphabet Memory',
    modeLabel: 'Trí Nhớ Chữ Cái',
    desc: 'Ghi nhớ thứ tự các ký tự bảng chữ cái xuất hiện nhanh trên màn hình.',
    icon: '🔤',
  },
  grid: {
    label: 'Grid Memory',
    modeLabel: 'Ma Trận Lưới',
    desc: 'Ghi nhớ vị trí các ô vuông phát sáng trên lưới ma trận.',
    icon: '🧩',
  },
  sequence: {
    label: 'Sequence Memory',
    modeLabel: 'Chuỗi Tần Số',
    desc: 'Ghi nhớ và lặp lại chính xác thứ tự các nút sáng theo nhịp điệu.',
    icon: '⚡',
  },
  color: {
    label: 'Color Memory',
    modeLabel: 'Sắc Màu Nhớ',
    desc: 'Ghi nhớ chuỗi màu sắc và tìm điểm khác biệt trong thời gian ngắn nhất.',
    icon: '🎨',
  },
}

const DIFFICULTY_MAP: Record<string, { label: string; badgeBg: string; textColor: string; icon: any }> = {
  easy: { label: '🟢 Dễ', badgeBg: 'rgba(34, 197, 94, 0.12)', textColor: '#22c55e', icon: IconDiffEasy },
  medium: { label: '🟡 Trung Bình', badgeBg: 'rgba(234, 179, 8, 0.12)', textColor: '#eab308', icon: IconDiffMedium },
  hard: { label: '🔴 Khó', badgeBg: 'rgba(239, 68, 68, 0.12)', textColor: '#ef4444', icon: IconDiffHard },
  super_hard: { label: '🔥 Siêu Khó', badgeBg: 'rgba(249, 115, 22, 0.12)', textColor: '#f97316', icon: IconDiffSuperHard },
}

function IconBellOff() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13.73 21a2 2 0 01-3.46 0M18.63 13A17.89 17.89 0 0118 8M6.26 6.26A5.86 5.86 0 006 8c0 7-3 9-3 9h14M1 1l22 22" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IncomingInviteModal({
  invite,
  show,
  onAccept,
  onDecline,
  onOpenMute,
}: IncomingInviteModalProps) {
  const { t } = useTranslation()
  const [showGameRules, setShowGameRules] = useState(false)
  const [showInviterProfile, setShowInviterProfile] = useState(false)

  if (!show || !invite) return null

  const gameInfo = GAME_DETAILS[invite.gameCategory] || {
    label: invite.gameCategory,
    modeLabel: 'Trận Đấu 1v1',
    desc: 'Thi đấu trí nhớ trực tiếp 1v1 với bạn bè.',
    icon: '🎮',
  }

  const diffKey = (invite.difficulty || 'medium').toLowerCase()
  const diffInfo = DIFFICULTY_MAP[diffKey] || DIFFICULTY_MAP.medium
  const gameLabel = getLocalizedGameLabel(t, invite.gameCategory)
  const difficultyLabel = getLocalizedDifficultyLabel(t, diffKey)
  const modeText = getLocalizedModeLabel(t, invite.mode || 'versus-ranked')

  const inviterFriendObj: Friend = {
    id: invite.inviterId,
    name: invite.inviterName,
    handle: invite.inviterHandle,
    elo: invite.inviterElo,
    status: 'online',
  }

  return (
    <>
      <ModalBackdrop show={show} className="z-[60] items-start pt-12">
        <div
          className="flex w-full max-w-sm flex-col gap-3 rounded-3xl p-5 shadow-2xl transition-all"
          style={{
            background: 'var(--ma-surface)',
            border: '1px solid var(--ma-border)',
          }}
        >
          {/* Top bar with challenge title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl text-base"
                style={{
                  background: 'var(--ma-brand)',
                  color: 'var(--ma-brand-fg)',
                }}
              >
                <IconSwords />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[14px] font-bold truncate" style={{ color: 'var(--ma-fg)' }}>
                  {t.lobby.incomingChallengeTitle}
                </span>
                <span className="text-[12px] font-semibold text-[var(--ma-brand)]">
                  {gameInfo.icon} {gameLabel}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenMute(invite.inviterId, invite.inviterHandle, invite.inviterName)}
              className="flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-semibold transition-opacity hover:opacity-80 active:opacity-60"
              style={{
                background: 'var(--ma-surface-raised)',
                border: '1px solid var(--ma-border)',
                color: 'var(--ma-fg-muted)',
              }}
              title={t.lobby.muteInvitesBtn}
            >
              <IconBellOff />
              {t.lobby.muteInvitesBtn}
            </button>
          </div>

          {/* 1. Clickable Game Info Card (Shows Mode + Difficulty Tag) */}
          <div
            onClick={() => setShowGameRules((prev) => !prev)}
            className="flex flex-col p-3 rounded-2xl cursor-pointer transition-all hover:opacity-90 active:scale-[0.99]"
            style={{
              background: 'var(--ma-surface-raised)',
              border: '1px solid var(--ma-border-subtle)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[12px] font-bold text-[var(--ma-fg)]">
                  {modeText} • {gameLabel}
                </span>

                {/* Prominent Difficulty Tag */}
                <span
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-bold"
                  style={{
                    background: diffInfo.badgeBg,
                    color: diffInfo.textColor,
                  }}
                >
                  {difficultyLabel}
                </span>
              </div>

              <span
                className={`transition-transform duration-200 ${showGameRules ? 'rotate-90' : ''}`}
                style={{ color: 'var(--ma-fg-subtle)' }}
              >
                <IconChevronRight14 />
              </span>
            </div>

            {showGameRules && (
              <div className="mt-2.5 pt-2 text-[11px] text-[var(--ma-fg-muted)] border-t border-[var(--ma-border-subtle)] animate-in fade-in duration-150">
                <p>{gameInfo.desc}</p>
                <p className="mt-1 font-semibold text-[var(--ma-brand)]">
                  ⚡ {t.challenge?.roomCode || 'Mã phòng:'} {invite.roomCode}
                </p>
              </div>
            )}
          </div>

          {/* 2. Clickable Inviter Details Card (Click to preview inviter profile) */}
          <div
            onClick={() => setShowInviterProfile(true)}
            className="flex items-center justify-between rounded-2xl p-3 cursor-pointer transition-all hover:opacity-90 active:scale-[0.99]"
            style={{
              background: 'var(--ma-surface-raised)',
              border: '1px solid var(--ma-brand-soft)',
            }}
            title={t.challenge?.clickProfileHint || 'Bấm để xem thông tin người thách đấu'}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
                style={{ background: 'var(--ma-brand)' }}
              >
                {invite.inviterName[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-bold truncate hover:underline" style={{ color: 'var(--ma-fg)' }}>
                  {invite.inviterName}
                </span>
                <span className="text-[11px] truncate" style={{ color: 'var(--ma-fg-muted)' }}>
                  @{invite.inviterHandle} • <strong style={{ color: 'var(--ma-brand)' }}>{invite.inviterElo} Elo</strong>
                </span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[var(--ma-brand)] shrink-0 flex items-center gap-1">
              {t.challenge?.viewInviterProfile || 'Xem hồ sơ'}
              <IconChevronRight14 />
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 mt-1">
            <button
              type="button"
              onClick={onDecline}
              className="flex flex-1 items-center justify-center rounded-2xl py-2.5 text-[13px] font-semibold transition-transform active:scale-95"
              style={{
                background: 'var(--ma-surface-raised)',
                border: '1px solid var(--ma-border)',
                color: 'var(--ma-fg)',
              }}
            >
              {t.lobby.declineChallenge}
            </button>
            <button
              type="button"
              onClick={() => onAccept(invite.roomCode)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-2.5 text-[13px] font-semibold transition-transform active:scale-95"
              style={{
                background: 'var(--ma-brand)',
                color: 'var(--ma-brand-fg)',
                boxShadow: 'var(--ma-shadow-sm)',
              }}
            >
              <IconSwords />
              {t.lobby.acceptChallenge}
            </button>
          </div>
        </div>
      </ModalBackdrop>

      {/* Inviter Friend Profile Preview Modal */}
      <FriendProfileModal
        friend={inviterFriendObj}
        show={showInviterProfile}
        onClose={() => setShowInviterProfile(false)}
        onOpenMute={onOpenMute}
        className="z-[80]"
      />
    </>
  )
}
