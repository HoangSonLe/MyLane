import { useId } from 'react'
import { IconLogOut, IconSpinner } from './icons'

interface LogOutDialogProps {
  visible: boolean
  busy: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function LogOutDialog({ visible, busy, onConfirm, onCancel }: LogOutDialogProps) {
  const titleId = useId()
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
          Log out?
        </h2>
        <p
          className="mb-6 text-center text-[13px] leading-relaxed"
          style={{ color: 'var(--ma-fg-muted)' }}
        >
          You&apos;ll need to log in again to access Versus, Elo, and your saved scores.
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={[
              'flex h-12 w-full items-center justify-center gap-2',
              'text-[15px] font-semibold',
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
            {busy ? 'Logging out…' : 'Log out'}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className={[
              'flex h-12 w-full items-center justify-center',
              'text-[15px] font-semibold',
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
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
