import { IconChevronRight14 as IconChevronRight } from '@/components/ui/icons'

import type { LeaderboardEntry, SortMetric } from '@/services/leaderboard/leaderboard.interface'
import { RankBadge } from './RankBadge'
import { InitialsAvatar } from './InitialsAvatar'

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
  const value = metric === 'score'
    ? entry.score.toLocaleString()
    : entry.elo.toLocaleString()

  const valueLabel = metric === 'score' ? 'score' : 'Elo'

  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={`${entry.username} — rank ${entry.rank}, ${valueLabel} ${value}${isCurrentUser ? ' (you)' : ''}`}
      className={[
        'flex w-full items-center gap-3 px-4 py-3 text-left',
        'transition-colors duration-[var(--ma-duration-micro)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
        isCurrentUser
          ? 'active:bg-[oklch(0.58_0.11_230_/_0.06)]'
          : 'active:bg-[var(--ma-surface-raised)]',
      ].join(' ')}
      style={
        isCurrentUser
          ? {
              background: 'var(--ma-active-soft)',
              borderLeft: '2px solid var(--ma-active)',
            }
          : {}
      }
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
              (you)
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
          aria-label={`${valueLabel}: ${value}`}
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
