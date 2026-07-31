import { IconTrophy16 as IconTrophy } from '@/components/ui/icons'
import { Card, StatCell } from '@/components/ui/card'

import type { GameMeta } from '@/services/game-select/game-select.interface'

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
  selected,
  isGuest,
  skeleton,
  onSelect,
}: {
  game: GameMeta
  selected: boolean
  isGuest: boolean
  skeleton?: boolean
  onSelect?: () => void
}) {
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

  const showStats = !isGuest

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${game.label} — ${game.description}${selected ? ', selected' : ''}`}
      className={[
        'w-full text-left',
        'transition-all duration-[var(--ma-duration-base)]',
        'active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
      ].join(' ')}
      style={{
        borderRadius: 'var(--radius-2xl)',
        background: selected ? 'var(--ma-active-soft)' : 'var(--ma-surface)',
        border: `1px solid ${selected ? 'var(--ma-active)' : 'var(--ma-border)'}`,
        boxShadow: selected ? 'var(--ma-shadow-md)' : 'var(--ma-shadow-sm)',
        padding: '1rem',
      }}
    >
      {/* Top row: icon + name + description */}
      <div className="flex items-center gap-3">
        <div
          className="shrink-0 flex items-center justify-center"
          style={{
            height: '2.5rem',
            width: '2.5rem',
            borderRadius: 'var(--radius-xl)',
            background: selected ? 'var(--ma-active)' : 'var(--ma-icon-bg)',
            transition: `background var(--ma-duration-base) var(--ma-ease-standard)`,
          }}
          aria-hidden="true"
        >
          <span
            style={{
              color: selected ? '#fff' : 'var(--ma-icon-fg)',
              transition: `color var(--ma-duration-base) var(--ma-ease-standard)`,
            }}
          >
            {game.icon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-[14px] font-semibold leading-snug"
            style={{ color: 'var(--ma-fg)' }}
          >
            {game.label}
          </p>
          <p
            className="text-[12px] leading-snug truncate"
            style={{ color: 'var(--ma-fg-muted)' }}
          >
            {game.description}
          </p>
        </div>
      </div>

      {/* Stats row — only for logged-in users */}
      {showStats && (
        <div
          className="mt-3 flex gap-4"
          style={{
            borderTop: '1px solid var(--ma-border-subtle)',
            paddingTop: '0.75rem',
          }}
        >
          <StatCell icon={<IconTrophy />} label="Elo" value={game.elo.toLocaleString()} />
          <StatCell icon={<IconStar />} label="Best" value={game.bestScore ?? '—'} />
          <StatCell icon={<IconLayers />} label="Level" value={game.highestLevel ?? '—'} />
        </div>
      )}
    </button>
  )
}
