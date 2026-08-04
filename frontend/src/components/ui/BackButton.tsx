import { IconChevronLeft } from '@/components/ui/icons'
import { useTranslation } from '@/i18n/useTranslation'

/**
 * BackButton — extracted from 3 byte-identical inline definitions
 * (LeaderboardScreen, LobbyScreen, ProfileScreen). GameSelectScreen's back
 * button is a genuinely different style (icon-only, larger) and stays local.
 */
export function BackButton({
  onBack,
  skeleton,
  ariaLabel,
  iconOnly = false,
  label,
}: {
  onBack?: () => void
  skeleton?: boolean
  ariaLabel?: string
  iconOnly?: boolean
  label?: string
}) {
  const { t } = useTranslation()
  const displayLabel = label ?? t.common.home

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={onBack}
        aria-label={ariaLabel ?? t.common.back}
        className={[
          'flex h-9 w-9 shrink-0 items-center justify-center',
          'transition-colors duration-[var(--ma-duration-micro)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
          'active:bg-[var(--ma-surface-raised)]',
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
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onBack}
      aria-label={ariaLabel ?? t.common.back}
      className={[
        'flex shrink-0 items-center gap-1.5 px-3 py-1.5 whitespace-nowrap',
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
      <span>{displayLabel}</span>
    </button>
  )
}
