import { IconChevronLeft } from '@/components/ui/icons'

export function RoomHeader({
  skeleton,
  onBack,
}: {
  skeleton?: boolean
  onBack?: () => void
}) {
  return (
    <header className="flex items-center justify-between px-4 pb-2 pt-6">
      {skeleton ? (
        <div
          className="skeleton"
          style={{ height: '2rem', width: '5.5rem', borderRadius: 'var(--radius-xl)' }}
        />
      ) : (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to Lobby"
          className={[
            'flex items-center gap-1.5 px-3 py-1.5',
            'text-[13px] font-medium',
            'transition-colors duration-[var(--ma-duration-micro)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
          ].join(' ')}
          style={{
            borderRadius: 'var(--radius-xl)',
            background: 'var(--ma-surface-raised)',
            border: '1px solid var(--ma-border)',
            color: 'var(--ma-fg-muted)',
          }}
        >
          <IconChevronLeft />
          <span>Lobby</span>
        </button>
      )}

      {skeleton ? (
        <div
          className="skeleton"
          style={{ height: '1.375rem', width: '6rem', borderRadius: 'var(--radius-sm)' }}
        />
      ) : (
        <h1 className="text-[17px] font-bold" style={{ color: 'var(--ma-fg)' }}>
          Versus Room
        </h1>
      )}

      {/* spacer to balance flex layout */}
      <div style={{ width: '5.5rem' }} aria-hidden="true" />
    </header>
  )
}
