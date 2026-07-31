import { EmptyStateCard, ErrorStateCard, OfflineStateCard } from '@/components/ui/card'
import { IconLock } from '@/components/ui/icons'
import { IconUserPlus, IconAlertCircle } from './icons'

// ─── EmptyFriends ─────────────────────────────────────────────────

export function EmptyFriends() {
  return (
    <EmptyStateCard
      gapClassName="gap-3"
      cardBorder="subtle"
      cardPadding="2rem 1.5rem"
      icon={<IconUserPlus />}
      iconColor="var(--ma-brand)"
      iconWrapperStyle={{
        height: '2.75rem',
        width: '2.75rem',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--ma-brand-soft)',
      }}
      title="No friends yet"
      description={
        <>
          Invite friends with the{' '}
          <span style={{ color: 'var(--ma-fg)' }}>+ button</span> above to
          see them here and challenge them to a match.
        </>
      }
    />
  )
}

// ─── FriendsError ─────────────────────────────────────────────────

interface FriendsErrorProps {
  onRetry?: () => void
}

export function FriendsError({ onRetry }: FriendsErrorProps) {
  return (
    <ErrorStateCard
      gapClassName="gap-4"
      cardPadding="2rem 1.5rem"
      icon={<IconAlertCircle />}
      iconColor="var(--ma-danger)"
      iconWrapperStyle={{
        height: '2.75rem',
        width: '2.75rem',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--ma-icon-bg)',
      }}
      title="Could not load friends"
      description="Something went wrong fetching your friends list. Check your connection and try again."
      action={
        <button
          type="button"
          onClick={onRetry}
          className={[
            'flex h-10 items-center justify-center px-6',
            'text-[13px] font-semibold',
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
          Try again
        </button>
      }
    />
  )
}

// ─── OfflineWall ──────────────────────────────────────────────────

interface OfflineWallProps {
  onLogIn?: () => void
}

export function OfflineWall({ onLogIn }: OfflineWallProps) {
  return (
    <OfflineStateCard
      gapClassName="gap-4"
      cardPadding="2rem 1.5rem"
      icon={<IconLock />}
      iconColor="var(--ma-fg-muted)"
      iconWrapperStyle={{
        height: '2.75rem',
        width: '2.75rem',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--ma-icon-bg)',
      }}
      title="Account required"
      description="The Lobby and Versus mode require a free account. Log in to challenge friends and join ranked matches."
      action={
        <button
          type="button"
          onClick={onLogIn}
          className={[
            'flex h-11 w-full items-center justify-center',
            'text-[14px] font-semibold',
            'transition-transform duration-[var(--ma-duration-micro)] active:scale-[0.97]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
          ].join(' ')}
          style={{
            borderRadius: 'var(--radius-2xl)',
            background: 'var(--ma-brand)',
            color: 'var(--ma-brand-fg)',
          }}
        >
          Log In / Sign Up
        </button>
      }
    />
  )
}
