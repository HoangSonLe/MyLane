import { IconChevronLeft } from '@/components/ui/icons'

/**
 * BackButton — extracted from 3 byte-identical inline definitions
 * (LeaderboardScreen, LobbyScreen, ProfileScreen). GameSelectScreen's back
 * button is a genuinely different style (icon-only, larger) and stays local.
 */
export function BackButton({
  onBack,
  skeleton,
  ariaLabel = 'Back to Home',
}: {
  onBack?: () => void
  skeleton?: boolean
  ariaLabel?: string
}) {
  return (
    <button
      type="button"
      onClick={onBack}
      aria-label={ariaLabel}
      className={[
        'flex items-center gap-1.5 px-3 py-1.5',
        'text-[13px] font-medium',
        'transition-colors duration-[var(--ma-duration-micro)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
        skeleton ? 'pointer-events-none' : '',
      ].join(' ')}
      style={{
        borderRadius: 'var(--radius-xl)',
        background: skeleton ? 'transparent' : 'var(--ma-surface-raised)',
        border: skeleton ? 'none' : '1px solid var(--ma-border)',
        color: 'var(--ma-fg-muted)',
        ...(skeleton ? { visibility: 'hidden' as const } : {}),
      }}
    >
      <IconChevronLeft />
      <span>Home</span>
    </button>
  )
}
