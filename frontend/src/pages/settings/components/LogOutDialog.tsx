import { useId } from 'react'
import { useTranslation } from '@/i18n/useTranslation'
import { IconLogOut, IconSpinner } from './icons'

interface LogOutDialogProps {
  visible: boolean
  busy: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function LogOutDialog({ visible, busy, onConfirm, onCancel }: LogOutDialogProps) {
  const titleId = useId()
  const { t } = useTranslation()
  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8 sm:items-center"
      style={{ background: 'oklch(0 0 0 / 0.60)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="w-full max-w-xs"
        style={{
          background: 'var(--ma-surface)',
          borderRadius: 'var(--radius-2xl)',
          border: '1px solid var(--ma-border)',
          boxShadow: 'var(--ma-shadow-lg)',
          padding: '1.5rem',
        }}
      >
        <div
          className="mx-auto mb-4 flex items-center justify-center"
          style={{
            height: '3rem',
            width: '3rem',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--ma-danger)',
            color: '#fff',
          }}
          aria-hidden="true"
        >
          <IconLogOut />
        </div>

        <h2
          id={titleId}
          className="mb-1 text-center text-[17px] font-bold leading-snug"
          style={{ color: 'var(--ma-fg)' }}
        >
          {t.settings.logOutTitle}
        </h2>
        <p
          className="mb-6 text-center text-[13px] leading-relaxed"
          style={{ color: 'var(--ma-fg-muted)' }}
        >
          {t.settings.logOutDesc}
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={[
              'flex h-11 flex-1 items-center justify-center gap-2',
              'text-[14px] font-semibold',
              'transition-transform duration-[var(--ma-duration-micro)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
              busy ? 'opacity-60 cursor-not-allowed' : 'active:scale-[0.97]',
            ].join(' ')}
            style={{
              borderRadius: 'var(--radius-2xl)',
              background: 'var(--ma-danger)',
              color: '#fff',
            }}
          >
            {busy && <IconSpinner />}
            {busy ? t.settings.logOutBusy : t.settings.logOutConfirm}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className={[
              'flex h-11 flex-1 items-center justify-center',
              'text-[14px] font-semibold',
              'transition-transform duration-[var(--ma-duration-micro)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
              busy ? 'opacity-60 cursor-not-allowed' : 'active:scale-[0.97]',
            ].join(' ')}
            style={{
              borderRadius: 'var(--radius-2xl)',
              background: 'var(--ma-surface-raised)',
              color: 'var(--ma-fg)',
              border: '1px solid var(--ma-border)',
            }}
          >
            {t.settings.logOutCancel}
          </button>
        </div>
      </div>
    </div>
  )
}
