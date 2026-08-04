import {
  IconChevronRight14 as IconChevronRight,
  IconCategoryNumber,
  IconCategoryAlphabet,
  IconCategoryGrid,
  IconCategorySequence,
  IconCategoryColor,
} from '@/components/ui/icons'
import { useTranslation } from '@/i18n/useTranslation'
import type { MatchEntry } from '@/services/profile/profile.interface'
import {
  getLocalizedGameLabel,
  getLocalizedModeLabel,
} from '@/services/gameplay/gameplay-screen.types'
import { formatMatchPlayedAt } from '@/lib/utils/match-time'

function MatchCategoryIcon({ category, size = 16 }: { category: string; size?: number }) {
  switch (category) {
    case 'number':
      return <IconCategoryNumber width={size} height={size} />
    case 'alphabet':
      return <IconCategoryAlphabet width={size} height={size} />
    case 'grid':
      return <IconCategoryGrid width={size} height={size} />
    case 'sequence':
      return <IconCategorySequence width={size} height={size} />
    case 'color':
      return <IconCategoryColor width={size} height={size} />
    default:
      return <IconCategoryGrid width={size} height={size} />
  }
}

export function MatchRow({
  match,
  onOpen,
}: {
  match: MatchEntry
  onOpen: (match: MatchEntry) => void
}) {
  const { t, locale } = useTranslation()
  const categoryLabel = getLocalizedGameLabel(t, match.category)
  const modeLabel = getLocalizedModeLabel(t, match.mode)
  const playedAtLabel = formatMatchPlayedAt(match.playedAt, locale)
  const pointsLabel = t.profile.historyPoints(match.score.toLocaleString(locale))
  const matchScoreLabel = match.playerRoundScore !== undefined && match.opponentRoundScore !== undefined
    ? t.profile.historyMatchScore(match.playerRoundScore, match.opponentRoundScore)
    : undefined
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

  const rowBg =
    match.outcome === 'win'
      ? 'oklch(0.70 0.15 145 / 0.05)'
      : match.outcome === 'loss'
      ? 'oklch(0.62 0.19 22 / 0.04)'
      : 'transparent'

  const borderLeft =
    match.outcome === 'win'
      ? '3px solid var(--ma-success)'
      : match.outcome === 'loss'
      ? '3px solid var(--ma-danger)'
      : '3px solid transparent'

  return (
    <button
      type="button"
      onClick={() => onOpen(match)}
      className={[
        'w-full flex items-center gap-3 px-4 py-3 text-left',
        'transition-colors duration-[var(--ma-duration-micro)] hover:bg-[var(--ma-surface-raised)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ma-ring)]',
      ].join(' ')}
      style={{
        background: rowBg,
        borderLeft,
      }}
      aria-label={`${categoryLabel} ${modeLabel} — ${match.outcome}, ${pointsLabel}${matchScoreLabel ? `, ${matchScoreLabel}` : ''}, ${playedAtLabel}`}
    >
      {/* Category icon badge with outcome color coding */}
      <div
        className="shrink-0 flex items-center justify-center"
        style={{
          height: '2.25rem',
          width: '2.25rem',
          borderRadius: 'var(--radius-xl)',
          background: outcomeBg,
          color: outcomeColor,
        }}
        aria-hidden="true"
      >
        <MatchCategoryIcon category={match.category} size={18} />
      </div>

      {/* Category + mode */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[13px] font-semibold" style={{ color: 'var(--ma-fg)' }}>
            {categoryLabel}
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
            {modeLabel}
          </span>
          <span style={{ color: 'var(--ma-border)', fontSize: '10px' }} aria-hidden="true">·</span>
          <span className="text-[11px]" style={{ color: 'var(--ma-fg-subtle)' }}>
            {playedAtLabel}
          </span>
        </div>
      </div>

      {/* Score + elo delta */}
      <div className="shrink-0 flex flex-col items-end gap-0.5">
        <span className="text-[14px] font-bold tabular-nums" style={{ color: 'var(--ma-fg)' }}>
          {pointsLabel}
        </span>
        {(matchScoreLabel || match.eloChange !== undefined) && (
          <div className="flex items-center gap-1.5 text-[11px] font-semibold tabular-nums">
            {matchScoreLabel && (
              <span style={{ color: 'var(--ma-fg-muted)' }}>{matchScoreLabel}</span>
            )}
            {matchScoreLabel && match.eloChange !== undefined && (
              <span style={{ color: 'var(--ma-border)' }} aria-hidden="true">·</span>
            )}
            {match.eloChange !== undefined && (
              <span style={{ color: match.eloChange >= 0 ? 'var(--ma-success)' : 'var(--ma-danger)' }}>
                {match.eloChange >= 0 ? '+' : ''}{match.eloChange}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Chevron */}
      <span className="shrink-0 ml-0.5" style={{ color: 'var(--ma-fg-subtle)' }} aria-hidden="true">
        <IconChevronRight />
      </span>
    </button>
  )
}
