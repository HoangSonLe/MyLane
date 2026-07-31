import { IconChevronLeft } from '@/components/ui/icons'

import type { EntryPoint } from '@/services/game-select/game-select.interface'

export function BackRow({
  skeleton,
  entryPoint,
  onBack,
}: {
  skeleton?: boolean
  entryPoint: EntryPoint
  onBack?: () => void
}) {
  if (skeleton) {
    return (
      <div className="flex items-center gap-3 px-4 pb-1 pt-6">
        <div className="skeleton" style={{ height: '2.25rem', width: '2.25rem', borderRadius: 'var(--radius-2xl)' }} />
        <div className="skeleton" style={{ height: '1.5rem', width: '8rem', borderRadius: 'var(--radius-sm)' }} />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 px-4 pb-1 pt-6">
      <button
        type="button"
        onClick={onBack}
        aria-label={`Back to ${entryPoint === 'lobby' ? 'Lobby' : 'Home'}`}
        className={[
          'flex h-9 w-9 shrink-0 items-center justify-center',
          'transition-transform duration-[var(--ma-duration-micro)] active:scale-95',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
        ].join(' ')}
        style={{
          borderRadius: 'var(--radius-2xl)',
          background: 'var(--ma-surface-raised)',
          border: '1px solid var(--ma-border)',
        }}
      >
        <span style={{ color: 'var(--ma-fg-muted)' }}>
          <IconChevronLeft />
        </span>
      </button>
      <h1 className="text-[20px] font-bold leading-tight" style={{ color: 'var(--ma-fg)' }}>
        Select Game
      </h1>
    </div>
  )
}
