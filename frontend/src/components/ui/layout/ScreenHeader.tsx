import type { ReactNode } from 'react'

import { BackButton } from '@/components/ui/BackButton'

/**
 * ScreenHeader — the `<header className="flex items-center justify-between
 * px-4 pb-2 pt-6">` wrapper, byte-identical across Home/Lobby/Leaderboard/
 * Profile. Content (back button, title, trailing action) stays as children
 * since it genuinely differs per screen (e.g. Home has no back button).
 */
export function ScreenHeader({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <header
      className={['flex items-center justify-between px-4 pb-2 pt-6', className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </header>
  )
}

/** ScreenHeaderTitle — the `h1 text-[17px] font-bold` title + matching skeleton placeholder, identical in Lobby/Leaderboard/Profile. */
export function ScreenHeaderTitle({
  skeleton,
  skeletonWidth = '5rem',
  children,
}: {
  skeleton?: boolean
  skeletonWidth?: string
  children: ReactNode
}) {
  if (skeleton) {
    return (
      <div
        className="skeleton justify-self-center"
        style={{ height: '1.375rem', width: skeletonWidth, borderRadius: 'var(--radius-sm)' }}
      />
    )
  }
  return (
    <h1 className="text-center text-[17px] font-bold" style={{ color: 'var(--ma-fg)' }}>
      {children}
    </h1>
  )
}

/** ScreenHeaderAction — the 36px trailing icon button (avatar/invite/settings), identical shape across Home/Lobby/Profile. */
export function ScreenHeaderAction({
  skeleton,
  onClick,
  ariaLabel,
  icon,
}: {
  skeleton?: boolean
  onClick?: () => void
  ariaLabel: string
  icon: ReactNode
}) {
  if (skeleton) {
    return (
      <div
        className="skeleton"
        style={{ height: '2.25rem', width: '2.25rem', borderRadius: 'var(--radius-2xl)' }}
      />
    )
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={[
        'flex h-9 w-9 items-center justify-center',
        'transition-transform duration-[var(--ma-duration-micro)] active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
      ].join(' ')}
      style={{
        borderRadius: 'var(--radius-2xl)',
        background: 'var(--ma-surface-raised)',
        border: '1px solid var(--ma-border)',
        color: 'var(--ma-fg-muted)',
      }}
    >
      {icon}
    </button>
  )
}

/** ScreenHeaderWithBack — composes BackButton + ScreenHeaderTitle inside a centered CSS Grid, for Lobby/Leaderboard/Profile. Title is mathematically centered 50% regardless of left/right item widths. */
export function ScreenHeaderWithBack({
  skeleton,
  onBack,
  ariaLabel,
  title,
  titleSkeletonWidth,
  trailing,
  className = '',
}: {
  skeleton?: boolean
  onBack?: () => void
  ariaLabel?: string
  title: ReactNode
  titleSkeletonWidth?: string
  trailing?: ReactNode
  className?: string
}) {
  return (
    <header
      className={['grid grid-cols-[1fr_auto_1fr] items-center px-4 pb-2 pt-6', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex justify-start">
        <BackButton onBack={onBack} skeleton={skeleton} {...(ariaLabel ? { ariaLabel } : {})} />
      </div>
      <ScreenHeaderTitle skeleton={skeleton} skeletonWidth={titleSkeletonWidth}>
        {title}
      </ScreenHeaderTitle>
      <div className="flex justify-end">
        {trailing ?? <div className="h-9 w-9 shrink-0" />}
      </div>
    </header>
  )
}
