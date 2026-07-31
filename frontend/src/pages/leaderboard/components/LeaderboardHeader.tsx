import { ScreenHeaderWithBack } from '@/components/ui/layout'

export function LeaderboardHeader({
  skeleton,
  onBack,
}: {
  skeleton?: boolean
  onBack?: () => void
}) {
  return (
    <ScreenHeaderWithBack
      skeleton={skeleton}
      onBack={onBack}
      ariaLabel="Back"
      title="Leaderboard"
      titleSkeletonWidth="7rem"
      trailing={<div style={{ width: '5.5rem' }} aria-hidden="true" />}
    />
  )
}
