import { EmptyStateCard, ErrorStateCard, OfflineStateCard } from '@/components/ui/card'
import { IconLock } from '@/components/ui/icons'
import { IconUserPlus, IconAlertCircle } from './icons'
import { useTranslation } from '@/i18n/useTranslation'

// ─── EmptyFriends ─────────────────────────────────────────────────

export function EmptyFriends() {
  const { t } = useTranslation()
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
      title={t.lobby.noFriendsTitle}
      description={
        <>
          {t.lobby.noFriendsDesc}
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
  const { t } = useTranslation()
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
      title={t.lobby.friendsErrorTitle}
      description={t.lobby.friendsErrorDesc}
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
          {t.common.retry}
        </button>
      }
    />
  )
}

// ─── GuestWall ────────────────────────────────────────────────────
// Shown when signed in as guest — Lobby/Versus require a real account
// (docs/product/README.md: "Guest mode ... no Versus"). Not network-offline;
// that has its own separate ScreenOfflineBanner in LobbyScreen.

interface GuestWallProps {
  onLogIn?: () => void
}

export function GuestWall({ onLogIn }: GuestWallProps) {
  const { t } = useTranslation()
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
      title={t.lobby.guestWallTitle}
      description={t.lobby.guestWallDesc}
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
          {t.lobby.logInSignUp}
        </button>
      }
    />
  )
}
