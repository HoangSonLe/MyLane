import { ScreenHeaderWithBack } from '@/components/ui/layout'
import { useTranslation } from '@/i18n/useTranslation'

export function LeaderboardHeader({
  skeleton,
  onBack,
}: {
  skeleton?: boolean
  onBack?: () => void
}) {
  const { t } = useTranslation()
  return (
    <ScreenHeaderWithBack
      skeleton={skeleton}
      onBack={onBack}
      ariaLabel={t.common.back}
      title={t.leaderboard.title}
      titleSkeletonWidth="7rem"
      iconOnly
    />
  )
}
