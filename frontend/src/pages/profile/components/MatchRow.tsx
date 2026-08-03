import { IconChevronRight14 as IconChevronRight } from '@/components/ui/icons'
import { useTranslation } from '@/i18n/useTranslation'
import type { MatchEntry } from '@/services/profile/profile.interface'

export function MatchRow({
  match,
  onOpen,
}: {
  match: MatchEntry
  onOpen: (match: MatchEntry) => void
}) {
  const { t } = useTranslation()
  const outcomeColor =
    match.outcome === 'win'
      ? 'var(--ma-success)'
      : match.outcome === 'loss'
      ? 'var(--ma-danger)'
      : 'var(--ma-fg-muted)'

  const outcomeBg =
    match.outcome === 'win'
      ? 'oklch(0.70 0.15 145 / 0.12)'
      : match.outcome === 'loss'
      ? 'oklch(0.62 0.19 22 / 0.12)'
      : 'var(--ma-surface-raised)'

  const outcomeLabel =
    match.outcome === 'win'
      ? t.profile.victory[0]
      : match.outcome === 'loss'
      ? t.profile.defeat[0]
      : t.profile.draw[0]

  return (
    <button
      type="button"
      onClick={() => onOpen(match)}
      className={[
        'w-full flex items-center gap-3 px-4 py-3 text-left',
        'transition-colors duration-[var(--ma-duration-micro)] hover:bg-[var(--ma-surface-raised)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ma-ring)]',
      ].join(' ')}
      aria-label={`${match.categoryLabel} ${match.mode} — ${match.outcome}, score ${match.score.toLocaleString()}, played ${match.playedAt}`}
    >
      {/* Outcome badge */}
      <div
        className="shrink-0 flex items-center justify-center"
        style={{
          height: '2rem',
          width: '2rem',
          borderRadius: 'var(--radius-lg)',
          background: outcomeBg,
        }}
        aria-hidden="true"
      >
        <span className="text-[12px] font-bold" style={{ color: outcomeColor }}>
          {outcomeLabel}
        </span>
      </div>

      {/* Category + mode */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[13px] font-semibold" style={{ color: 'var(--ma-fg)' }}>
            {match.categoryLabel}
          </span>
          {match.opponentName && (
            <>
              <span style={{ color: 'var(--ma-border)', fontSize: '10px' }} aria-hidden="true">{t.profile.vs}</span>
              <span className="truncate text-[12px]" style={{ color: 'var(--ma-fg-muted)' }}>
                {match.opponentName}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px]" style={{ color: 'var(--ma-fg-subtle)' }}>
            {match.mode}
          </span>
          <span style={{ color: 'var(--ma-border)', fontSize: '10px' }} aria-hidden="true">·</span>
          <span className="text-[11px]" style={{ color: 'var(--ma-fg-subtle)' }}>
            {match.playedAt}
          </span>
        </div>
      </div>

      {/* Score + elo delta */}
      <div className="shrink-0 flex flex-col items-end gap-0.5">
        <span className="text-[14px] font-bold tabular-nums" style={{ color: 'var(--ma-fg)' }}>
          {match.score.toLocaleString()}
        </span>
        {match.eloChange !== undefined && (
          <span
            className="text-[11px] font-semibold tabular-nums"
            style={{ color: match.eloChange >= 0 ? 'var(--ma-success)' : 'var(--ma-danger)' }}
          >
            {match.eloChange >= 0 ? '+' : ''}{match.eloChange}
          </span>
        )}
      </div>

      {/* Chevron */}
      <span className="shrink-0 ml-0.5" style={{ color: 'var(--ma-fg-subtle)' }} aria-hidden="true">
        <IconChevronRight />
      </span>
    </button>
  )
}
