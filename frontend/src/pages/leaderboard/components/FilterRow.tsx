import type { BoardType, Category, SortMetric } from '@/services/leaderboard/leaderboard.interface'
import { CATEGORIES } from '@/services/leaderboard/leaderboard.mock'

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

  return (
    <div className="flex flex-col gap-2">
      {/* Category chips */}
      {showCategory && (
        <div
          role="group"
          aria-label="Category filter"
          className="flex gap-2 overflow-x-auto px-4"
          style={{ scrollbarWidth: 'none' } as React.CSSProperties}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                aria-pressed={isActive}
                className={[
                  'shrink-0 rounded-[var(--radius-xl)] px-3 py-1',
                  'text-[12px] font-medium whitespace-nowrap',
                  'transition-colors duration-[var(--ma-duration-micro)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
                ].join(' ')}
                style={
                  isActive
                    ? {
                        background: 'var(--ma-brand-soft)',
                        color: 'var(--ma-brand)',
                        border: '1px solid oklch(0.76 0.14 74 / 0.25)',
                      }
                    : {
                        background: 'var(--ma-surface-raised)',
                        color: 'var(--ma-fg-subtle)',
                        border: '1px solid var(--ma-border)',
                      }
                }
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Score vs Elo metric toggle — only for applicable boards */}
      {showMetricToggle && (
        <div
          role="group"
          aria-label="Sort metric"
          className="flex gap-2 px-4"
        >
          {(['score', 'elo'] as SortMetric[]).map((m) => {
            const isActive = activeMetric === m
            const label = m === 'score' ? 'By Score' : 'By Elo'
            return (
              <button
                key={m}
                onClick={() => onMetricChange(m)}
                aria-pressed={isActive}
                className={[
                  'rounded-[var(--radius-xl)] px-3 py-1',
                  'text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap',
                  'transition-colors duration-[var(--ma-duration-micro)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
                ].join(' ')}
                style={
                  isActive
                    ? {
                        background: 'var(--ma-active-soft)',
                        color: 'var(--ma-active)',
                        border: '1px solid oklch(0.58 0.11 230 / 0.3)',
                      }
                    : {
                        background: 'transparent',
                        color: 'var(--ma-fg-subtle)',
                      }
                }
              >
                {label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
