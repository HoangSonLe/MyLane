import { IconSparkles } from '@/components/ui/icons'
import { ScreenHeader, ScreenHeaderAction } from '@/components/ui/layout'
import { Avatar } from '@/components/ui/Avatar'
import { useTranslation } from '@/i18n/useTranslation'

interface HomeHeaderProps {
  skeleton?: boolean
  isGuest: boolean
  playerName?: string
  playerAvatarUrl?: string
  onProfile?: () => void
  unreadNotificationsCount?: number
}

export function HomeHeader({
  skeleton,
  isGuest,
  playerName,
  playerAvatarUrl,
  onProfile,
  unreadNotificationsCount = 0,
}: HomeHeaderProps) {
  const { t } = useTranslation()
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? t.home.goodMorning : hour < 18 ? t.home.goodAfternoon : t.home.goodEvening

  return (
    <ScreenHeader className="relative pb-1">
      {/* Brand Header & Player Greeting */}
      {skeleton ? (
        <div className="flex flex-col gap-2">
          <div className="skeleton" style={{ height: '2.5rem', width: '12rem', borderRadius: 'var(--radius-md)' }} />
          <div className="skeleton" style={{ height: '1.25rem', width: '9rem', borderRadius: 'var(--radius-sm)' }} />
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 min-w-0">
          {/* Brand Logo Header */}
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: 'var(--ma-brand-soft)',
                color: 'var(--ma-brand)',
                border: '1px solid oklch(0.76 0.14 74 / 0.25)',
              }}
            >
              <IconSparkles width={20} height={20} />
            </div>

            <div className="flex flex-col min-w-0">
              <h1
                className="text-[22px] sm:text-[24px] font-black tracking-tight leading-none uppercase"
                style={{
                  color: 'var(--ma-fg)',
                  letterSpacing: '-0.02em',
                }}
              >
                MY LANE
              </h1>
              <span
                className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.22em] leading-tight mt-0.5"
                style={{ color: 'var(--ma-brand)' }}
              >
                GAMEBOARD
              </span>
            </div>
          </div>

          {/* Player Welcome Line */}
          <p className="text-[13px] font-medium flex items-center gap-1 mt-0.5" style={{ color: 'var(--ma-fg-muted)' }}>
            <span>{greeting},</span>
            <strong className="font-bold" style={{ color: 'var(--ma-fg)' }}>
              {isGuest ? t.home.guest : (playerName ?? 'Player')}
            </strong>
            <span aria-hidden="true">👋</span>
          </p>
        </div>
      )}

      {/* Profile Avatar Button */}
      <div className="relative shrink-0">
        <ScreenHeaderAction
          skeleton={skeleton}
          onClick={onProfile}
          ariaLabel={t.home.goToProfile}
          icon={
            <Avatar name={playerName ?? 'Player'} imageUrl={playerAvatarUrl} size="2.5rem" fontSize="14px" />
          }
        />
        {unreadNotificationsCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm animate-pulse z-10">
            {unreadNotificationsCount}
          </span>
        )}
      </div>
    </ScreenHeader>
  )
}
