// GameplayHeader — the header bar for GameplayScreen.
// Not using ScreenHeader kit because gameplay header has a different layout:
// [back button] [title + subtitle center] [pause button]
// with pt-16 safe area padding and a pause button (vs. a trailing action icon).

interface GameplayHeaderProps {
  title: string
  subtitle: string
  pauseDisabled?: boolean
  onBack?: () => void
  onPause?: () => void
}

function IconChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconPause() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="6" y="4" width="4" height="16" rx="1.5" fill="currentColor" />
      <rect x="14" y="4" width="4" height="16" rx="1.5" fill="currentColor" />
    </svg>
  )
}

export function GameplayHeader({
  title,
  subtitle,
  pauseDisabled,
  onBack,
  onPause,
}: GameplayHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 pb-2 pt-16">
      <button
        type="button"
        aria-label="Back"
        onClick={onBack}
        className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors active:bg-[var(--ma-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
        style={{ background: 'var(--ma-surface)', color: 'var(--ma-fg-muted)', boxShadow: 'var(--ma-shadow-sm)' }}
      >
        <IconChevronLeft />
      </button>

      <div className="text-center">
        <h1 className="text-[14px] font-bold tracking-tight" style={{ color: 'var(--ma-fg)' }}>
          {title}
        </h1>
        <p className="text-[11px]" style={{ color: 'var(--ma-fg-muted)' }}>
          {subtitle}
        </p>
      </div>

      <button
        type="button"
        aria-label="Pause game"
        onClick={onPause}
        disabled={pauseDisabled}
        className={[
          'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
          'active:bg-[var(--ma-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
          pauseDisabled ? 'opacity-40' : '',
        ].join(' ')}
        style={{ background: 'var(--ma-surface)', color: 'var(--ma-fg-muted)', boxShadow: 'var(--ma-shadow-sm)' }}
      >
        <IconPause />
      </button>
    </header>
  )
}

// Loading placeholder for GameplayHeader
export function GameplayHeaderSkeleton() {
  return (
    <header className="flex items-center justify-between px-4 pb-2 pt-16">
      <div className="skeleton h-10 w-10 rounded-xl" />
      <div className="skeleton h-10 w-36 rounded-xl" />
      <div className="skeleton h-10 w-10 rounded-xl" />
    </header>
  )
}
