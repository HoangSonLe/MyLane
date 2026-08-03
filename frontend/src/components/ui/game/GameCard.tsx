import { IconTrophy16 as IconTrophy } from '@/components/ui/icons'
import { Card, StatCell } from '@/components/ui/card'
import type { GameMeta, GameStats } from '@/services/game-select/game-select.interface'
import { useTranslation } from '@/i18n/useTranslation'

function IconStar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconLayers() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function GameCard({
  game,
  stats,
  statsError,
  onRetryStats,
  selected,
  isGuest,
  skeleton,
  onSelect,
}: {
  game: GameMeta
  stats?: GameStats | null
  statsError?: boolean
  onRetryStats?: () => void
  selected: boolean
  isGuest: boolean
  skeleton?: boolean
  onSelect?: () => void
}) {
  const { t } = useTranslation()
  if (skeleton) {
    return (
      <Card padding="1rem">
        <div className="flex items-center gap-3">
          <div className="skeleton shrink-0" style={{ height: '2.5rem', width: '2.5rem', borderRadius: 'var(--radius-xl)' }} />
          <div className="flex flex-col gap-2 flex-1">
            <div className="skeleton" style={{ height: '1rem', width: '7rem', borderRadius: 'var(--radius-sm)' }} />
            <div className="skeleton" style={{ height: '0.75rem', width: '10rem', borderRadius: 'var(--radius-sm)' }} />
          </div>
        </div>
        <div
          className="mt-3 flex gap-3"
          style={{
            borderTop: '1px solid var(--ma-border-subtle)',
            paddingTop: '0.75rem',
          }}
        >
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="skeleton" style={{ height: '0.6rem', width: '2.5rem', borderRadius: 'var(--radius-sm)' }} />
              <div className="skeleton" style={{ height: '0.875rem', width: '3rem', borderRadius: 'var(--radius-sm)' }} />
            </div>
          ))}
        </div>
      </Card>
    )
  }

  const showStats = !isGuest && !statsError && !!stats

  return (
    <div
      style={{
        borderRadius: 'var(--radius-2xl)',
        background: selected ? 'var(--ma-active-soft)' : 'var(--ma-surface)',
        border: `1px solid ${selected ? 'var(--ma-active)' : 'var(--ma-border)'}`,
        boxShadow: selected ? 'var(--ma-shadow-md)' : 'var(--ma-shadow-sm)',
      }}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`${game.label} — ${game.description}${selected ? t.gameSelect.selectedSuffix : ''}`}
        className={[
          'w-full text-left',
          'transition-all duration-[var(--ma-duration-base)]',
          'active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
        ].join(' ')}
        style={{ borderRadius: 'var(--radius-2xl)', padding: '1rem' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center text-lg"
            style={{
              borderRadius: 'var(--radius-xl)',
              background: selected ? 'var(--ma-active)' : 'var(--ma-icon-bg)',
              color: selected ? '#fff' : 'var(--ma-icon-fg)',
            }}
            aria-hidden="true"
          >
            {game.icon}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-bold" style={{ color: 'var(--ma-fg)' }}>
              {game.label}
            </h2>
            <p className="mt-0.5 text-[12px] leading-tight" style={{ color: 'var(--ma-fg-muted)' }}>
              {game.description}
            </p>
          </div>

          <div
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
            style={{
              border: `2px solid ${selected ? 'var(--ma-active)' : 'var(--ma-border)'}`,
              background: selected ? 'var(--ma-active)' : 'transparent',
            }}
            aria-hidden="true"
          >
            {selected && <div className="h-2 w-2 rounded-full bg-white" />}
          </div>
        </div>

        {showStats && stats && (
          <div
            className="mt-3 grid grid-cols-3 gap-2 text-center"
            style={{
              borderTop: '1px solid var(--ma-border-subtle)',
              paddingTop: '0.75rem',
            }}
          >
            <StatCell
              icon={<IconTrophy />}
              label={t.gameSelect.bestScore}
              value={stats.bestScore != null ? stats.bestScore.toLocaleString() : '—'}
            />
            <StatCell
              icon={<IconStar />}
              label="Elo"
              value={stats.elo.toLocaleString()}
            />
            <StatCell
              icon={<IconLayers />}
              label={t.gameSelect.maxLevel}
              value={t.gameSelect.levelValue(stats.highestLevel ?? 1)}
            />
          </div>
        )}
      </button>

      {statsError && !isGuest && (
        <div
          className="flex items-center justify-between gap-2 px-4 pb-3 pt-1"
          style={{ borderTop: '1px solid var(--ma-border-subtle)' }}
        >
          <span className="text-[11px]" style={{ color: 'var(--ma-fg-muted)' }}>
            {t.gameSelect.statsErrorNote}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRetryStats?.()
            }}
            className="text-[11px] font-semibold text-[var(--ma-brand)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)] rounded"
          >
            {t.common.retry}
          </button>
        </div>
      )}
    </div>
  )
}
