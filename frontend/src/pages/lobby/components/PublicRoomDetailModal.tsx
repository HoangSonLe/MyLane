import { IconSwords, IconUser } from '@/components/ui/icons'
import { ModalBackdrop } from '@/components/ui/ModalBackdrop'
import type { PublicRoomSummary } from '@/services/versus-room/versus-room.interface'
import { GAME_CATEGORIES } from '@/services/versus-room/versus-room.mock'
import { useTranslation } from '@/i18n/useTranslation'
import { RoundMode } from '@/configs/enum'
import { getLocalizedGameLabel } from '@/services/gameplay/gameplay-screen.types'

interface PublicRoomDetailModalProps {
  room: PublicRoomSummary | null
  show: boolean
  onClose: () => void
  onJoin: (code: string) => void
}

function IconGlobe() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}

export function PublicRoomDetailModal({
  room,
  show,
  onClose,
  onJoin,
}: PublicRoomDetailModalProps) {
  const { t } = useTranslation()

  if (!show || !room) return null

  const categoryMeta = GAME_CATEGORIES.find((c) => c.id === room.category)
  const isRanked = room.mode === RoundMode.VERSUS_RANKED

  return (
    <ModalBackdrop show={show} onClose={onClose}>
      <div
        className="flex w-full max-w-sm flex-col gap-5 rounded-3xl p-6 shadow-2xl"
        style={{
          background: 'var(--ma-surface)',
          border: '1px solid var(--ma-border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ma-fg-subtle)' }}>
            {t.lobby.roomDetailTitle}
          </span>
          <span
            className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
            style={{
              background: room.isPrivate ? 'oklch(0.65 0.15 20 / 0.12)' : 'oklch(0.55 0.12 140 / 0.12)',
              color: room.isPrivate ? 'oklch(0.70 0.18 20)' : 'oklch(0.65 0.15 140)',
            }}
          >
            {room.isPrivate ? (
              <>🔒 {t.versusRoom.privateRoom}</>
            ) : (
              <><IconGlobe /> {t.versusRoom.publicRoom}</>
            )}
          </span>
        </div>

        {/* Room Header Info */}
        <div className="flex items-center gap-3.5 rounded-2xl p-3.5" style={{ background: 'var(--ma-surface-raised)' }}>
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl"
            style={{
              background: 'var(--ma-brand)',
              color: 'var(--ma-brand-fg)',
            }}
          >
            <IconSwords />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <h3 className="text-[16px] font-bold truncate" style={{ color: 'var(--ma-fg)' }}>
              {room.roomName || room.code}
            </h3>
            <p className="text-[12px] font-medium" style={{ color: 'var(--ma-fg-muted)' }}>
              {getLocalizedGameLabel(t, categoryMeta?.id ?? room.category)} · {isRanked ? t.versusGameplay.ranked : t.versusGameplay.unranked}
            </p>
          </div>
        </div>

        {/* Host Info Section */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ma-fg-subtle)' }}>
            {t.lobby.hostInfo}
          </span>
          <div className="flex items-center justify-between rounded-2xl p-3" style={{ border: '1px solid var(--ma-border-subtle)' }}>
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl text-sm"
                style={{
                  background: 'var(--ma-icon-bg)',
                  color: 'var(--ma-icon-fg)',
                }}
              >
                <IconUser />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold" style={{ color: 'var(--ma-fg)' }}>
                  {room.hostName}
                </span>
                <span className="text-[11px]" style={{ color: 'var(--ma-fg-muted)' }}>
                  Rating: <strong className="font-semibold" style={{ color: 'var(--ma-fg)' }}>{room.hostElo} Elo</strong>
                </span>
              </div>
            </div>
            <span className="rounded-xl px-2.5 py-1 text-[11px] font-bold" style={{ background: 'var(--ma-active-soft)', color: 'var(--ma-active)' }}>
              Host
            </span>
          </div>
        </div>

        {/* Slot Info */}
        <div className="flex items-center justify-between text-[13px] px-1" style={{ color: 'var(--ma-fg-muted)' }}>
          <span>{t.challenge?.roomCode || 'Mã phòng (Code):'} <strong style={{ color: 'var(--ma-fg)' }}>{room.code}</strong></span>
          <span>{t.challenge?.playersCount || 'Số người:'} <strong style={{ color: 'var(--ma-fg)' }}>{room.playerCount}/{room.maxPlayers}</strong></span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex flex-1 items-center justify-center rounded-2xl py-3 text-[14px] font-semibold transition-transform active:scale-95"
            style={{
              background: 'var(--ma-surface-raised)',
              border: '1px solid var(--ma-border)',
              color: 'var(--ma-fg)',
            }}
          >
            {t.common.close}
          </button>
          <button
            type="button"
            onClick={() => {
              onJoin(room.code)
              onClose()
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-[14px] font-semibold transition-transform active:scale-95"
            style={{
              background: 'var(--ma-brand)',
              color: 'var(--ma-brand-fg)',
              boxShadow: 'var(--ma-shadow-sm)',
            }}
          >
            <IconSwords />
            {t.lobby.joinRoomConfirm}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  )
}
