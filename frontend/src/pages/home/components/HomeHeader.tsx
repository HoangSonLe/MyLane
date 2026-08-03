import { IconUser } from '@/components/ui/icons'
import { ScreenHeader, ScreenHeaderAction } from '@/components/ui/layout'
import { useTranslation } from '@/i18n/useTranslation'

interface HomeHeaderProps {
  skeleton?: boolean
  isGuest: boolean
  playerName?: string
  onProfile?: () => void
  unreadNotificationsCount?: number
}

export function HomeHeader({
  skeleton,
  isGuest,
  playerName,
  onProfile,
  unreadNotificationsCount = 0,
}: HomeHeaderProps) {
  const { t } = useTranslation()
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? t.home.goodMorning : hour < 18 ? t.home.goodAfternoon : t.home.goodEvening

  return (
    <ScreenHeader className="relative">
      {/* Greeting */}
      {skeleton ? (
        <div className="flex flex-col gap-2">
          <div className="skeleton" style={{ height: '1.125rem', width: '7rem', borderRadius: 'var(--radius-sm)' }} />
          <div className="skeleton" style={{ height: '1.5rem', width: '10rem', borderRadius: 'var(--radius-sm)' }} />
        </div>
      ) : (
        <div>
          <p className="text-[12px] font-medium" style={{ color: 'var(--ma-fg-muted)' }}>
            {greeting}
          </p>
          <h1 className="text-[20px] font-bold leading-tight" style={{ color: 'var(--ma-fg)' }}>
            {isGuest ? t.home.guest : (playerName ?? 'Player')}
          </h1>
        </div>
      )}

      {/* Profile Avatar Button (All actions consolidated into Avatar dropdown menu) */}
      <div className="relative">
        <ScreenHeaderAction
          skeleton={skeleton}
          onClick={onProfile}
          ariaLabel={t.home.goToProfile}
          icon={
            <span aria-hidden="true" style={{ color: 'var(--ma-fg-muted)' }}>
              <IconUser />
            </span>
          }
        />
        {unreadNotificationsCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadNotificationsCount}
          </span>
        )}
      </div>
    </ScreenHeader>
  )
}
