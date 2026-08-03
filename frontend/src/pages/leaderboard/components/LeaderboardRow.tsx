import { IconChevronRight14 as IconChevronRight } from '@/components/ui/icons'

import type { LeaderboardEntry, SortMetric } from '@/services/leaderboard/leaderboard.interface'
import { RankBadge } from './RankBadge'
import { InitialsAvatar } from './InitialsAvatar'
import { useTranslation } from '@/i18n/useTranslation'

export function LeaderboardRow({
  entry,
  metric,
  isCurrentUser,
  onPress,
}: {
  entry: LeaderboardEntry
  metric: SortMetric
  isCurrentUser: boolean
  onPress?: () => void
}) {
  const { t } = useTranslation()
  const value = metric === 'score'
    ? entry.score.toLocaleString()
    : entry.elo.toLocaleString()

  const valueLabel = metric === 'score' ? t.leaderboard.scoreCol : t.leaderboard.eloCol

  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={t.leaderboard.rowAria(entry.username, entry.rank, valueLabel, value, isCurrentUser)}
      className={[
        'flex w-full items-center gap-3 px-4 py-3 text-left',
        'transition-colors duration-[var(--ma-duration-micro)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
        isCurrentUser
          ? 'active:bg-[oklch(0.58_0.11_230_/_0.06)]'
          : 'active:bg-[var(--ma-surface-raised)]',
      ].join(' ')}
      style={{
        borderLeft: isCurrentUser
          ? '2px solid var(--ma-active)'
          : '2px solid transparent',
        ...(isCurrentUser ? { background: 'var(--ma-active-soft)' } : {}),
      }}
    >
      {/* Rank */}
      <RankBadge rank={entry.rank} />

      {/* Avatar */}
      <InitialsAvatar name={entry.username} highlight={isCurrentUser} />

      {/* Name + handle */}
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-[14px] font-semibold leading-tight"
          style={{ color: isCurrentUser ? 'var(--ma-active)' : 'var(--ma-fg)' }}
        >
          {entry.username}
          {isCurrentUser && (
            <span
              className="ml-1.5 text-[11px] font-medium"
              style={{ color: 'var(--ma-active)', opacity: 0.8 }}
            >
              {t.leaderboard.youSuffix}
            </span>
          )}
        </p>
        <p className="truncate text-[12px]" style={{ color: 'var(--ma-fg-subtle)' }}>
          @{entry.handle}
        </p>
      </div>

      {/* Score / Elo + chevron */}
      <div className="flex shrink-0 items-center gap-1.5">
        <span
          className="text-[14px] font-bold tabular-nums"
          style={{ color: isCurrentUser ? 'var(--ma-active)' : 'var(--ma-fg-muted)' }}
          aria-label={t.leaderboard.valueAria(valueLabel, value)}
        >
          {value}
        </span>
        <span style={{ color: 'var(--ma-fg-subtle)', opacity: 0.7 }}>
          <IconChevronRight />
        </span>
      </div>
    </button>
  )
}
