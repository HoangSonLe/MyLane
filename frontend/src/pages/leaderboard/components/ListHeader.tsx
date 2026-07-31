import type { BoardType, Category, SortMetric } from '@/services/leaderboard/leaderboard.interface'
import { BOARD_TABS, CATEGORIES } from '@/services/leaderboard/leaderboard.mock'

export function ListHeader({
  metric,
  boardType,
  category,
}: {
  metric: SortMetric
  boardType: BoardType
  category: Category
}) {
  const boardLabel = BOARD_TABS.find((b) => b.id === boardType)?.label ?? boardType
  const categoryLabel = boardType !== 'endless'
    ? (CATEGORIES.find((c) => c.id === category)?.label ?? category) + ' · '
    : ''
  const metricLabel = metric === 'score' ? 'Score' : 'Elo'

  return (
    <div
      className="flex items-center justify-between px-4 py-2"
      style={{ borderBottom: '1px solid var(--ma-border-subtle)' }}
    >
      <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ma-fg-subtle)' }}>
        {categoryLabel}{boardLabel}
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ma-fg-subtle)' }}>
        {metricLabel}
      </span>
    </div>
  )
}
