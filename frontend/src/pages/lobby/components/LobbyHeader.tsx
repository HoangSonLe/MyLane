import { ScreenHeaderWithBack, ScreenHeaderAction } from '@/components/ui/layout'
import { IconUser } from '@/components/ui/icons'
import { useTranslation } from '@/i18n/useTranslation'

interface LobbyHeaderProps {
  skeleton?: boolean
  onBack?: () => void
  onProfile?: () => void
  unreadNotificationsCount?: number
}

export function LobbyHeader({
  skeleton,
  onBack,
  onProfile,
  unreadNotificationsCount = 0,
}: LobbyHeaderProps) {
  const { t } = useTranslation()

  return (
    <ScreenHeaderWithBack
      skeleton={skeleton}
      onBack={onBack}
      title={t.lobby.title}
      trailing={
        onProfile ? (
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
        ) : undefined
      }
    />
  )
}
