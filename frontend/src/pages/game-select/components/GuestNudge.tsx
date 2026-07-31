import { Card } from '@/components/ui/card'

import { IconLock } from './icons'

export function GuestNudge({
  onLogIn,
}: {
  onLogIn?: () => void
}) {
  return (
    <Card className="mx-4 flex items-center justify-between gap-3" border="subtle" padding="0.875rem 1rem">
      <div className="flex items-center gap-2.5 min-w-0">
        <span style={{ color: 'var(--ma-fg-subtle)', flexShrink: 0 }}>
          <IconLock />
        </span>
        <p className="text-[12px] leading-snug" style={{ color: 'var(--ma-fg-muted)' }}>
          Sign in to unlock Ranked and Versus modes, and track your stats.
        </p>
      </div>
      <button
        type="button"
        onClick={onLogIn}
        className={[
          'shrink-0 px-3 py-1.5 text-[12px] font-semibold whitespace-nowrap',
          'transition-transform duration-[var(--ma-duration-micro)] active:scale-95',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
        ].join(' ')}
        style={{
          borderRadius: 'var(--radius-xl)',
          background: 'var(--ma-surface-raised)',
          border: '1px solid var(--ma-border)',
          color: 'var(--ma-fg)',
        }}
      >
        Log In
      </button>
    </Card>
  )
}
