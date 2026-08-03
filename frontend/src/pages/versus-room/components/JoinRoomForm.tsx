import { useRef } from 'react'

import { IconDoorOpen } from '@/components/ui/icons'
import { IconLoader } from './icons'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { useTranslation } from '@/i18n/useTranslation'

export function JoinRoomForm({
  skeleton,
  codeValue,
  isJoining,
  onCodeChange,
  onJoin,
}: {
  skeleton?: boolean
  codeValue: string
  isJoining: boolean
  onCodeChange: (v: string) => void
  onJoin: () => void
}) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  if (skeleton) {
    return (
      <div className="flex flex-col gap-3 mx-4">
        <div className="skeleton" style={{ height: '1rem', width: '5rem', borderRadius: 'var(--radius-sm)' }} />
        <div className="skeleton" style={{ height: '2.75rem', borderRadius: 'var(--radius-2xl)' }} />
      </div>
    )
  }

  const canJoin = codeValue.trim().length > 0 && !isJoining

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <SectionLabel label={t.versusRoom.roomCodeOrLinkLabel} />
        <div className="px-4">
          <input
            ref={inputRef}
            type="text"
            value={codeValue}
            onChange={(e) => onCodeChange(e.target.value)}
            placeholder={t.versusRoom.roomCodePlaceholder}
            aria-label={t.versusRoom.roomCodeOrLinkAria}
            autoComplete="off"
            spellCheck={false}
            className={[
              'w-full bg-transparent text-[14px] font-medium outline-none',
              'placeholder:text-[var(--ma-fg-subtle)] tracking-wider uppercase',
              'focus:ring-2 focus:ring-[var(--ma-ring)]',
            ].join(' ')}
            style={{
              borderRadius: 'var(--radius-2xl)',
              background: 'var(--ma-surface)',
              border: '1px solid var(--ma-border)',
              color: 'var(--ma-fg)',
              padding: '0.875rem 1rem',
              transition: 'border-color var(--ma-duration-micro)',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing && canJoin) {
                onJoin()
              }
            }}
          />
        </div>
      </div>

      <div className="px-4">
        <button
          type="button"
          onClick={onJoin}
          disabled={!canJoin}
          className={[
            'flex h-14 w-full items-center justify-center gap-2.5',
            'text-[15px] font-semibold',
            'transition-transform duration-[var(--ma-duration-micro)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
            !canJoin ? 'opacity-40 cursor-not-allowed' : 'active:scale-[0.97]',
          ].join(' ')}
          style={{
            borderRadius: 'var(--radius-2xl)',
            background: 'var(--ma-brand)',
            color: 'var(--ma-brand-fg)',
            boxShadow: !canJoin ? 'none' : '0 4px 24px oklch(0.78 0.16 75 / 0.28)',
          }}
          aria-label={t.versusRoom.joinRoomAria}
        >
          {isJoining ? (
            <>
              <span style={{ color: 'var(--ma-brand-fg)' }}>
                <IconLoader />
              </span>
              {t.versusRoom.joining}
            </>
          ) : (
            <>
              <span style={{ color: 'var(--ma-brand-fg)' }}>
                <IconDoorOpen />
              </span>
              {t.versusRoom.joinRoomBtn}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
