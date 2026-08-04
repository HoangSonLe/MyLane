import { useTranslation } from '@/i18n/useTranslation'
import type { UserSession } from '@/services/auth/auth.service'

interface ProfileCardProps {
  skeleton?: boolean
  user?: UserSession | null
}

export function ProfileCard({ skeleton, user }: ProfileCardProps) {
  const { t } = useTranslation()
  const isGuest = user?.isGuest ?? true
  const name = user ? (isGuest ? t.home.guest : user.name) : t.home.guest
  const initial = (name[0] ?? 'G').toUpperCase()
  const eloFormatted = (user?.elo ?? 1000).toLocaleString()
  const subtext = isGuest
    ? t.settings.guestAccountSubtext
    : user?.email
      ? `${user.email} · Elo: ${eloFormatted}`
      : `Elo: ${eloFormatted}`

  return (
    <div
      className="overflow-hidden rounded-2xl bg-[var(--ma-surface)]"
      style={{ boxShadow: 'var(--ma-shadow-sm)' }}
    >
      {/* Top band */}
      <div
        className="h-14 w-full"
        style={{
          background: `repeating-linear-gradient(
            60deg,
            var(--ma-surface-raised) 0px,
            var(--ma-surface-raised) 1px,
            var(--ma-surface) 1px,
            var(--ma-surface) 13px
          )`,
        }}
        aria-hidden="true"
      />

      <div className="px-4 pb-4 pt-0">
        {/* Avatar overlapping the band */}
        <div className="-mt-7 mb-3 flex items-end justify-between">
          <div className="relative">
            <div
              className={[
                'h-14 w-14 rounded-2xl ring-2 ring-[var(--ma-surface)]',
                skeleton ? 'skeleton' : 'bg-[var(--ma-surface-raised)]',
              ].join(' ')}
            >
              {!skeleton && (
                user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={name}
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl font-bold text-[var(--ma-fg-muted)]">
                    {initial}
                  </div>
                )
              )}
            </div>
            {!skeleton && (
              <span
                className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--ma-surface)] bg-[var(--ma-success)]"
                aria-hidden="true"
              />
            )}
          </div>

          {/* Account status badge */}
          {!skeleton && (
            <div className="flex items-center gap-1.5 rounded-xl bg-[var(--ma-surface-raised)] px-3 py-1.5">
              <span className="text-[11px] font-medium text-[var(--ma-fg-muted)]">
                {isGuest ? t.settings.guestBadgeLabel : 'ELO'}
              </span>
              <span className="text-[13px] font-semibold text-[var(--ma-fg)]">
                {isGuest ? t.settings.guestBadgeValue : (user?.elo ?? 1000).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Name + info */}
        {skeleton ? (
          <>
            <div className="skeleton mb-1.5 h-4 w-28 rounded" />
            <div className="skeleton h-3 w-36 rounded" />
          </>
        ) : (
          <>
            <p className="text-[15px] font-semibold text-[var(--ma-fg)]">{name}</p>
            <p className="mt-0.5 text-[12px] text-[var(--ma-fg-muted)]">{subtext}</p>
          </>
        )}
      </div>
    </div>
  )
}
