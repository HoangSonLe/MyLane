import type { BoardType, Category, SortMetric } from '@/services/leaderboard/leaderboard.interface'
import { BOARD_TABS, CATEGORIES } from '@/services/leaderboard/leaderboard.mock'
import { useTranslation } from '@/i18n/useTranslation'

export function ListHeader({
  metric,
  boardType,
  category,
}: {
  metric: SortMetric
  boardType: BoardType
  category: Category
}) {
  const { t } = useTranslation()
  const boardLabel = BOARD_TABS.find((b) => b.id === boardType)?.label ?? boardType
  const categoryLabel = boardType !== 'endless'
    ? (CATEGORIES.find((c) => c.id === category)?.label ?? category) + ' · '
    : ''
  const metricLabel = metric === 'score' ? t.leaderboard.scoreCol : t.leaderboard.eloCol

  return (
    <div
      className="flex items-center justify-between px-4 py-2.5"
      style={{
        borderBottom: '1px solid var(--ma-border-subtle)',
        borderLeft: '2px solid transparent',
      }}
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
