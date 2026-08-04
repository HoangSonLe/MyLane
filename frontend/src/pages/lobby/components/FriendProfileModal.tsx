import { useEffect, useState } from 'react'

import { IconSwords } from '@/components/ui/icons'
import { Avatar } from '@/components/ui/Avatar'
import { ModalBackdrop } from '@/components/ui/ModalBackdrop'
import type { Friend } from '@/services/lobby/lobby.interface'
import { lobbyService } from '@/services/lobby/lobby.service'
import { GAME_CATEGORIES } from '@/services/versus-room/versus-room.mock'
import { getLocalizedGameLabel } from '@/services/gameplay/gameplay-screen.types'
import { useTranslation } from '@/i18n/useTranslation'
import {
  useInviteMuteStore,
  type MuteDurationOption,
} from '@/stores/invite-mute.store'
import { MuteInviteModal } from './MuteInviteModal'

interface FriendProfileModalProps {
  friend: Friend | null
  show: boolean
  onClose: () => void
  onChallenge?: (friendId: string) => void
  onOpenMute?: (userId: string, handle: string, name: string) => void
  className?: string
}

function IconBellOff() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13.73 21a2 2 0 01-3.46 0M18.63 13A17.89 17.89 0 0118 8M6.26 6.26A5.86 5.86 0 006 8c0 7-3 9-3 9h14M1 1l22 22" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconBell() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function FriendProfileModal({
  friend,
  show,
  onClose,
  onChallenge,
  onOpenMute,
  className = 'z-[70]',
}: FriendProfileModalProps) {
  const { t } = useTranslation()
  const { isMuted, muteUser, unmuteUser } = useInviteMuteStore()
  const [loadedProfile, setLoadedProfile] = useState<{ key: string; friend: Friend } | null>(null)
  const [showMuteDialog, setShowMuteDialog] = useState(false)

  const profileKey = friend ? `${friend.id}:${friend.handle}` : ''

  useEffect(() => {
    let cancelled = false

    if (!show || !friend) {
      setLoadedProfile(null)
      setShowMuteDialog(false)
      return () => {
        cancelled = true
      }
    }

    const hasCompleteStats =
      friend.gamesPlayed !== undefined &&
      friend.winRate !== undefined &&
      friend.records !== undefined

    if (hasCompleteStats) {
      setLoadedProfile({ key: profileKey, friend })
      return () => {
        cancelled = true
      }
    }

    setLoadedProfile(null)
    lobbyService
      .getFriendProfile(friend.id, friend.handle)
      .then((profile) => {
        if (!cancelled && profile) {
          setLoadedProfile({ key: profileKey, friend: profile })
        }
      })
      .catch(() => {
        // Keep the summary data visible if the detail request fails.
      })

    return () => {
      cancelled = true
    }
  }, [friend, profileKey, show])

  if (!show || !friend) return null

  const displayedFriend = loadedProfile?.key === profileKey
    ? { ...friend, ...loadedProfile.friend }
    : friend
  const muteTarget = { userId: displayedFriend.id, handle: displayedFriend.handle }
  const isUserMuted = isMuted(muteTarget)

  return (
    <>
      <ModalBackdrop show={show} onClose={onClose} className={className}>
        <div
          className="flex w-full max-w-sm flex-col gap-5 rounded-3xl p-6 shadow-2xl"
          style={{
            background: 'var(--ma-surface)',
            border: '1px solid var(--ma-border)',
          }}
        >
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ma-fg-subtle)' }}>
            {t.lobby.friendProfileTitle}
          </span>
          <span
            className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
            style={{
              background: displayedFriend.status === 'in-game' ? 'oklch(0.75 0.16 75 / 0.12)' : displayedFriend.status === 'offline' ? 'var(--ma-surface-raised)' : 'oklch(0.55 0.12 140 / 0.12)',
              color: displayedFriend.status === 'in-game' ? 'var(--ma-warning)' : displayedFriend.status === 'offline' ? 'var(--ma-fg-subtle)' : 'oklch(0.65 0.15 140)',
            }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{
                background: displayedFriend.status === 'in-game' ? 'var(--ma-warning)' : displayedFriend.status === 'offline' ? 'var(--ma-fg-subtle)' : 'var(--ma-success)',
              }}
            />
            {displayedFriend.status === 'in-game' ? t.lobby.inGame : displayedFriend.status === 'offline' ? 'Offline' : 'Online'}
          </span>
        </div>

        {/* User Hero Header */}
        <div className="flex items-center gap-4 rounded-2xl p-4" style={{ background: 'var(--ma-surface-raised)' }}>
          <Avatar name={displayedFriend.name} imageUrl={displayedFriend.avatarUrl} size="3.25rem" fontSize="16px" />
          <div className="flex flex-col min-w-0 flex-1">
            <h3 className="text-[16px] font-bold truncate" style={{ color: 'var(--ma-fg)' }}>
              {displayedFriend.name}
            </h3>
            <span className="text-[12px]" style={{ color: 'var(--ma-fg-subtle)' }}>
              @{displayedFriend.handle}
            </span>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: 'var(--ma-active-soft)', color: 'var(--ma-active)' }}>
                {displayedFriend.elo} Elo
              </span>
              {displayedFriend.rank && (
                <span className="text-[11px] font-medium" style={{ color: 'var(--ma-fg-muted)' }}>
                  #{displayedFriend.rank} Global
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="flex flex-col gap-1 rounded-2xl p-3" style={{ border: '1px solid var(--ma-border-subtle)' }}>
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ma-fg-subtle)' }}>
              {t.lobby.gamesPlayedLabel}
            </span>
            <span className="text-[16px] font-bold" style={{ color: 'var(--ma-fg)' }}>
              {displayedFriend.gamesPlayed ?? '—'}
            </span>
          </div>

          <div className="flex flex-col gap-1 rounded-2xl p-3" style={{ border: '1px solid var(--ma-border-subtle)' }}>
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ma-fg-subtle)' }}>
              {t.lobby.winRateLabel}
            </span>
            <span className="text-[16px] font-bold" style={{ color: 'var(--ma-success)' }}>
              {displayedFriend.winRate === undefined ? '—' : `${displayedFriend.winRate}%`}
            </span>
          </div>
        </div>

        {/* Top Game Records */}
        {displayedFriend.records && Object.keys(displayedFriend.records).length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ma-fg-subtle)' }}>
              {t.lobby.topGameRecords}
            </span>
            <div className="flex flex-col gap-2">
              {Object.entries(displayedFriend.records).map(([catId, rec]) => {
                const catMeta = GAME_CATEGORIES.find((c) => c.id === catId)
                return (
                  <div
                    key={catId}
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-[12px]"
                    style={{ background: 'var(--ma-surface-raised)' }}
                  >
                    <span className="font-semibold" style={{ color: 'var(--ma-fg)' }}>
                      {getLocalizedGameLabel(t, catMeta?.id ?? catId)}
                    </span>
                    <div className="flex items-center gap-3" style={{ color: 'var(--ma-fg-muted)' }}>
                      {rec.bestScore && (
                        <span>Best: <strong style={{ color: 'var(--ma-fg)' }}>{rec.bestScore}</strong></span>
                      )}
                      {rec.elo && (
                        <span className="font-medium text-[var(--ma-brand)]">{rec.elo} Elo</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2.5 mt-1">
          {isUserMuted ? (
            <button
              type="button"
              onClick={() => { void unmuteUser(muteTarget) }}
              className="flex items-center justify-center gap-1.5 rounded-2xl py-2.5 px-3 text-[12px] font-semibold transition-transform active:scale-95"
              style={{
                background: 'oklch(0.55 0.12 140 / 0.12)',
                border: '1px solid oklch(0.55 0.12 140 / 0.25)',
                color: 'oklch(0.65 0.15 140)',
              }}
            >
              <IconBell />
              {t.lobby.unmuteInvitesBtn}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (onOpenMute) {
                  onClose()
                  onOpenMute(displayedFriend.id, displayedFriend.handle, displayedFriend.name)
                } else {
                  setShowMuteDialog(true)
                }
              }}
              className="flex items-center justify-center gap-1.5 rounded-2xl py-2.5 px-3 text-[12px] font-semibold transition-transform active:scale-95"
              style={{
                background: 'var(--ma-surface-raised)',
                border: '1px solid var(--ma-border)',
                color: 'var(--ma-fg-muted)',
              }}
            >
              <IconBellOff />
              {t.lobby.muteInvitesBtn}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onClose()
              onChallenge?.(displayedFriend.id)
            }}
            disabled={displayedFriend.status === 'in-game'}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-2.5 text-[13px] font-semibold transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'var(--ma-brand)',
              color: 'var(--ma-brand-fg)',
              boxShadow: 'var(--ma-shadow-sm)',
            }}
          >
            <IconSwords />
            {t.lobby.challengeBtn}
          </button>
        </div>
        </div>
      </ModalBackdrop>

      <MuteInviteModal
        inviterHandle={displayedFriend.handle}
        inviterName={displayedFriend.name}
        show={showMuteDialog}
        onClose={() => setShowMuteDialog(false)}
        onConfirmMute={(_handle: string, option: MuteDurationOption) => {
          void muteUser(muteTarget, option)
          setShowMuteDialog(false)
        }}
      />
    </>
  )
}
