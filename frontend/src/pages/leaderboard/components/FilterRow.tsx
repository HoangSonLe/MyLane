import { FilterPills } from '@/components/ui/controls'
import type { BoardType, Category, SortMetric } from '@/services/leaderboard/leaderboard.interface'
import { CATEGORIES } from '@/services/leaderboard/leaderboard.mock'
import { useTranslation } from '@/i18n/useTranslation'

export function FilterRow({
  activeCategory,
  activeMetric,
  onCategoryChange,
  onMetricChange,
  boardType,
  skeleton,
}: {
  activeCategory: Category
  activeMetric: SortMetric
  onCategoryChange: (c: Category) => void
  onMetricChange: (m: SortMetric) => void
  boardType: BoardType
  skeleton?: boolean
}) {
  const { t } = useTranslation()
  // Endless board has no category split (it's one unified board)
  const showCategory = boardType !== 'endless'
  // Elo metric only relevant for ranked/global; Endless is always score
  const showMetricToggle = boardType === 'global-alltime' || boardType === 'top100'

  if (skeleton) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 overflow-hidden px-4">
          {CATEGORIES.map((c) => (
            <div
              key={c.id}
              className="skeleton shrink-0"
              style={{ height: '1.875rem', width: '4.5rem', borderRadius: 'var(--radius-xl)' }}
            />
          ))}
        </div>
      </div>
    )
  }

  const categoryItems = CATEGORIES.map((cat) => ({
    id: cat.id,
    label: cat.label,
  }))

  const metricItems = [
    { id: 'score' as SortMetric, label: t.leaderboard.byScore },
    { id: 'elo' as SortMetric, label: t.leaderboard.byElo },
  ]

  return (
    <div className="flex flex-col gap-2">
      {/* Category chips */}
      {showCategory && (
        <FilterPills
          items={categoryItems}
          value={activeCategory}
          onChange={onCategoryChange}
          ariaLabel={t.leaderboard.categoryFilterAria}
        />
      )}

      {/* Score vs Elo metric toggle — only for applicable boards */}
      {showMetricToggle && (
        <FilterPills
          items={metricItems}
          value={activeMetric}
          onChange={onMetricChange}
          ariaLabel={t.leaderboard.sortMetricAria}
        />
      )}
    </div>
  )
}
