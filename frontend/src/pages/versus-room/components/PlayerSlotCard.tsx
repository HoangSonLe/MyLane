import { Card } from '@/components/ui/card'

import type { PlayerSlot } from '@/services/versus-room/versus-room.interface'
import { useTranslation } from '@/i18n/useTranslation'

function IconTrophy() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M5 3H3v5a5 5 0 005 5h8a5 5 0 005-5V3h-2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 3h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function IconUserDash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.75" />
      <line x1="22" y1="11" x2="16" y2="11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

export function PlayerSlotCard({
  slot,
  isHost,
  isEmpty,
  skeleton,
}: {
  slot?: PlayerSlot
  isHost?: boolean
  isEmpty?: boolean
  skeleton?: boolean
}) {
  const { t } = useTranslation()
  if (skeleton) {
    return (
      <Card padding="1rem">
        <div className="flex items-center gap-3">
          <div className="skeleton shrink-0" style={{ height: '2.5rem', width: '2.5rem', borderRadius: 'var(--radius-xl)' }} />
          <div className="flex flex-col gap-2 flex-1">
            <div className="skeleton" style={{ height: '0.875rem', width: '6rem', borderRadius: 'var(--radius-sm)' }} />
            <div className="skeleton" style={{ height: '0.75rem', width: '4rem', borderRadius: 'var(--radius-sm)' }} />
          </div>
          <div className="skeleton shrink-0" style={{ height: '1.25rem', width: '3.5rem', borderRadius: 'var(--radius-sm)' }} />
        </div>
      </Card>
    )
  }

  const initials = slot?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? '?'

  return (
    <div
      style={{
        borderRadius: 'var(--radius-2xl)',
        background: 'var(--ma-surface)',
        border: `1px solid ${isEmpty ? 'var(--ma-border-subtle)' : 'var(--ma-border)'}`,
        padding: '1rem',
        opacity: isEmpty ? 0.6 : 1,
      }}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="shrink-0 flex items-center justify-center"
          style={{
            height: '2.5rem',
            width: '2.5rem',
            borderRadius: 'var(--radius-xl)',
            background: isEmpty ? 'var(--ma-surface-raised)' : 'var(--ma-icon-bg)',
            border: '1px solid var(--ma-border)',
            color: 'var(--ma-fg-muted)',
          }}
          aria-hidden="true"
        >
          {isEmpty ? <IconUserDash /> : (
            <span className="text-[13px] font-bold" style={{ color: 'var(--ma-fg-muted)' }}>
              {initials}
            </span>
          )}
        </div>

        {/* Name + handle */}
        <div className="flex flex-1 min-w-0 flex-col justify-center">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[13px] font-semibold truncate min-w-0" style={{ color: isEmpty ? 'var(--ma-fg-subtle)' : 'var(--ma-fg)' }}>
              {isEmpty ? t.versusRoom.waitingForOpponent : slot?.name}
            </span>
            {isHost && !isEmpty && (
              <span
                className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 whitespace-nowrap"
                style={{
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--ma-brand-soft)',
                  color: 'var(--ma-brand)',
                }}
              >
                {t.versusRoom.hostLabel}
              </span>
            )}
          </div>
          {!isEmpty && slot && (
            <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
              <span className="text-[11px] truncate min-w-0 shrink" style={{ color: 'var(--ma-fg-subtle)' }}>
                @{slot.handle}
              </span>
              <span className="shrink-0" style={{ color: 'var(--ma-border)', fontSize: '10px' }} aria-hidden="true">&middot;</span>
              <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold whitespace-nowrap" style={{ color: 'var(--ma-progress)' }}>
                <IconTrophy />
                {slot.elo}
              </span>
            </div>
          )}
        </div>

        {/* Ready indicator */}
        {!isEmpty && slot && (
          <div
            className="shrink-0 flex items-center gap-1.5 px-2 py-1 whitespace-nowrap"
            style={{
              borderRadius: 'var(--radius-xl)',
              background: slot.ready ? 'oklch(0.70 0.15 145 / 0.12)' : 'var(--ma-surface-raised)',
              border: `1px solid ${slot.ready ? 'oklch(0.70 0.15 145 / 0.30)' : 'var(--ma-border)'}`,
            }}
            aria-label={slot.ready ? t.versusRoom.playerReadyAria(slot.name) : t.versusRoom.playerNotReadyAria(slot.name)}
          >
            <span
              className="inline-block shrink-0"
              style={{
                height: '7px',
                width: '7px',
                borderRadius: '50%',
                background: slot.ready ? 'var(--ma-success)' : 'var(--ma-fg-subtle)',
              }}
              aria-hidden="true"
            />
            <span
              className="text-[11px] font-semibold whitespace-nowrap"
              style={{ color: slot.ready ? 'var(--ma-success)' : 'var(--ma-fg-subtle)' }}
            >
              {slot.ready ? t.versusRoom.readyLabel : t.versusRoom.notReady}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
