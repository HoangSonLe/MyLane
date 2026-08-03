import { useEffect, useRef, useState } from 'react'

import { Card } from '@/components/ui/card'
import { IconSwords } from '@/components/ui/icons'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { useTranslation } from '@/i18n/useTranslation'
import type { PlayerSlot } from '@/services/versus-room/versus-room.interface'
import { IconLoader } from './icons'
import { PlayerSlotCard } from './PlayerSlotCard'

export function ReadyRoomView({
  skeleton,
  host,
  opponent,
  isHost,
  opponentJoined,
  onStart,
  onToggleReady,
  currentPlayerReady,
  isUpdatingReady,
  isQuickMatch = false,
  roomStatus = 'waiting',
  startAt,
}: {
  skeleton?: boolean
  host: PlayerSlot
  opponent: PlayerSlot | null
  isHost: boolean
  opponentJoined: boolean
  onStart?: () => void
  onToggleReady?: () => void
  currentPlayerReady: boolean
  isUpdatingReady?: boolean
  isQuickMatch?: boolean
  roomStatus?: 'waiting' | 'in_progress' | 'finished'
  startAt?: string | null
}) {
  const { t } = useTranslation()
  const bothReady = opponentJoined && !!opponent?.ready && host.ready
  const canStart = isHost && bothReady && roomStatus === 'waiting'
  const autoStartRequestedRef = useRef(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  // One participant is the transaction coordinator internally, but Quick Match
  // presents equal UX to both players. The RPC writes one shared start_at.
  useEffect(() => {
    if (!isQuickMatch || !isHost || !bothReady || roomStatus !== 'waiting' || startAt) return
    if (autoStartRequestedRef.current) return
    autoStartRequestedRef.current = true
    void Promise.resolve(onStart?.()).catch(() => {
      autoStartRequestedRef.current = false
    })
  }, [bothReady, isHost, isQuickMatch, onStart, roomStatus, startAt])

  useEffect(() => {
    if (!startAt) {
      setCountdown(null)
      return
    }
    const update = () => {
      setCountdown(Math.max(0, Math.ceil((new Date(startAt).getTime() - Date.now()) / 1000)))
    }
    update()
    const timer = setInterval(update, 200)
    return () => clearInterval(timer)
  }, [startAt])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <SectionLabel label={t.versusRoom.playersLabel} />
        <div className="flex flex-col gap-2 px-4">
          <PlayerSlotCard slot={host} isHost skeleton={skeleton} />
          <PlayerSlotCard slot={opponent ?? undefined} isEmpty={!opponentJoined} skeleton={skeleton} />
        </div>
      </div>

      {!skeleton && !opponentJoined && (
        <Card className="mx-4 flex items-center gap-2.5" border="subtle" padding="0.875rem 1rem">
          <span style={{ color: 'var(--ma-fg-muted)' }} aria-live="polite"><IconLoader /></span>
          <p className="text-[13px]" style={{ color: 'var(--ma-fg-muted)' }}>{t.versusRoom.waitingForOpponent}</p>
        </Card>
      )}

      {isQuickMatch && opponentJoined ? (
        <div className="px-4">
          <Card className="flex flex-col items-center justify-center gap-2 py-5" border="subtle">
            <p className="text-[24px] font-extrabold text-[var(--ma-brand)] tabular-nums">
              {countdown !== null ? (countdown > 0 ? countdown : '🚀') : <IconLoader />}
            </p>
            <p className="text-[13px] font-semibold text-[var(--ma-brand)]">
              {countdown !== null ? `Trận đấu bắt đầu trong ${countdown}s...` : 'Đang đồng bộ thời điểm bắt đầu...'}
            </p>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col gap-2 px-4">
          <button
            type="button"
            onClick={onToggleReady}
            disabled={isUpdatingReady || roomStatus !== 'waiting'}
            className="flex h-12 w-full items-center justify-center rounded-2xl text-[14px] font-semibold transition-transform active:scale-[0.97] disabled:opacity-50"
            style={{
              background: currentPlayerReady
                ? 'var(--ma-brand-soft)'
                : isHost
                ? 'var(--ma-surface)'
                : 'var(--ma-brand)',
              border: currentPlayerReady
                ? '1px solid var(--ma-brand)'
                : isHost
                ? '1px solid var(--ma-border)'
                : '1px solid var(--ma-brand)',
              color: currentPlayerReady
                ? 'var(--ma-brand)'
                : isHost
                ? 'var(--ma-fg)'
                : 'var(--ma-brand-fg)',
              boxShadow: !currentPlayerReady && !isHost ? '0 4px 20px oklch(0.78 0.16 75 / 0.25)' : 'none',
            }}
          >
            {isUpdatingReady ? (
              <IconLoader />
            ) : currentPlayerReady ? (
              `✓ ${t.versusRoom.readyLabel}`
            ) : (
              t.versusRoom.readyLabel
            )}
          </button>

          {isHost ? (
            <button
              type="button"
              onClick={onStart}
              disabled={!canStart}
              className="flex h-14 w-full items-center justify-center gap-2.5 text-[15px] font-semibold transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
              style={{
                borderRadius: 'var(--radius-2xl)',
                background: 'var(--ma-brand)',
                color: 'var(--ma-brand-fg)',
                boxShadow: canStart ? '0 4px 24px oklch(0.78 0.16 75 / 0.28)' : 'none',
              }}
              aria-label={canStart ? t.versusRoom.startTheMatchAria : t.versusRoom.waitingBothReadyAria}
            >
              <span style={{ color: 'var(--ma-brand-fg)' }}><IconSwords /></span>
              {canStart ? t.versusRoom.startMatch : opponentJoined ? t.versusRoom.waitingForReady : t.versusRoom.waitingForOpponent}
            </button>
          ) : (
            <Card className="flex items-center justify-center gap-2.5 py-4" border="subtle">
              <IconLoader />
              <p className="text-[13px] font-semibold text-[var(--ma-brand)]">Đang chờ chủ phòng bắt đầu ván đấu...</p>
            </Card>
          )}

          {opponentJoined && !bothReady && (
            <p className="text-center text-[11px] text-[var(--ma-fg-subtle)]" aria-live="polite">
              {t.versusRoom.bothMustBeReady}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
