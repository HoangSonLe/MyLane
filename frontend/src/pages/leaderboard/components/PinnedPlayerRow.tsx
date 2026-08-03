import type { LeaderboardEntry, SortMetric } from '@/services/leaderboard/leaderboard.interface'
import { LeaderboardRow } from './LeaderboardRow'
import { useTranslation } from '@/i18n/useTranslation'

export function PinnedPlayerRow({
  entry,
  metric,
  onPress,
}: {
  entry: LeaderboardEntry
  metric: SortMetric
  onPress?: () => void
}) {
  const { t } = useTranslation()
  return (
    <div>
      {/* Divider with label */}
      <div className="flex items-center gap-2 px-4 py-1.5">
        <div style={{ flex: 1, height: '1px', background: 'var(--ma-border-subtle)' }} aria-hidden="true" />
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ma-fg-subtle)' }}>
          {t.leaderboard.pinned}
        </span>
        <div style={{ flex: 1, height: '1px', background: 'var(--ma-border-subtle)' }} aria-hidden="true" />
      </div>

      <LeaderboardRow
        entry={entry}
        metric={metric}
        isCurrentUser
        onPress={onPress}
      />
    </div>
  )
}
