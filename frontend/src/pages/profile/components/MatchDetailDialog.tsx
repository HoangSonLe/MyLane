import { Card, CardButton } from '@/components/ui/card'
import { useTranslation } from '@/i18n/useTranslation'
import type { MatchEntry } from '@/services/profile/profile.interface'
import {
  getLocalizedGameLabel,
  getLocalizedModeLabel,
} from '@/services/gameplay/gameplay-screen.types'
import { formatMatchPlayedAt } from '@/lib/utils/match-time'

export function MatchDetailDialog({
  match,
  onClose,
}: {
  match: MatchEntry | null
  onClose: () => void
}) {
  const { t, locale } = useTranslation()
  if (!match) return null
  const categoryLabel = getLocalizedGameLabel(t, match.category)
  const modeLabel = getLocalizedModeLabel(t, match.mode)
  const playedAtLabel = formatMatchPlayedAt(match.playedAt, locale)
  const playerRoundScore = match.playerRoundScore
  const opponentRoundScore = match.opponentRoundScore
  const matchScoreValue = playerRoundScore !== undefined && opponentRoundScore !== undefined
    ? `${playerRoundScore} – ${opponentRoundScore}`
    : undefined
  const matchScoreLabel = playerRoundScore !== undefined && opponentRoundScore !== undefined
    ? t.profile.historyMatchScore(playerRoundScore, opponentRoundScore)
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

  const outcomeLabel =
    match.outcome === 'win' ? t.profile.victory : match.outcome === 'loss' ? t.profile.defeat : t.profile.draw

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'oklch(0 0 0 / 0.60)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Match detail: ${categoryLabel} ${modeLabel}`}
        className="fixed bottom-0 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 flex flex-col gap-0"
        style={{
          borderRadius: 'var(--radius-3xl) var(--radius-3xl) 0 0',
          background: 'var(--ma-bg)',
          border: '1px solid var(--ma-border)',
          boxShadow: 'var(--ma-shadow-lg)',
          paddingBottom: 'env(safe-area-inset-bottom, 1.5rem)',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
          <div style={{ height: '4px', width: '2.5rem', borderRadius: '2px', background: 'var(--ma-border)' }} />
        </div>

        {/* Outcome hero */}
        <div
          className="mx-4 mt-2 mb-4 flex flex-col items-center gap-2 py-5"
          style={{
            borderRadius: 'var(--radius-2xl)',
            background: outcomeBg,
            border: `1px solid ${match.outcome === 'win' ? 'oklch(0.70 0.15 145 / 0.25)' : match.outcome === 'loss' ? 'oklch(0.62 0.19 22 / 0.25)' : 'var(--ma-border)'}`,
          }}
        >
          <p className="text-[13px] font-semibold uppercase tracking-widest" style={{ color: outcomeColor }}>
            {outcomeLabel}
          </p>
          <p className="text-[42px] font-bold tabular-nums leading-none" style={{ color: 'var(--ma-fg)' }}>
            {match.score.toLocaleString()}
          </p>
          <p className="text-[12px]" style={{ color: 'var(--ma-fg-muted)' }}>
            {categoryLabel} · {modeLabel}
          </p>
          {(match.opponentName || matchScoreLabel) && (
            <p className="text-[12px]" style={{ color: 'var(--ma-fg-subtle)' }}>
              {match.opponentName ? `${t.profile.vs} ${match.opponentName}` : ''}
              {match.opponentName && matchScoreLabel ? ' · ' : ''}
              {matchScoreLabel || ''}
            </p>
          )}
        </div>

        {/* Detail rows */}
        <Card className="mx-4 mb-4 overflow-hidden">
          {[
            { label: t.profile.detailCategory, value: categoryLabel },
            { label: t.profile.detailMode, value: modeLabel },
            { label: t.profile.detailScore, value: match.score.toLocaleString() },
            ...(matchScoreValue
              ? [{ label: t.profile.detailMatchScore, value: matchScoreValue }]
              : []),
            ...(match.eloChange !== undefined
              ? [{ label: t.profile.detailEloChange, value: `${match.eloChange >= 0 ? '+' : ''}${match.eloChange}` }]
              : []),
            { label: t.profile.detailPlayed, value: playedAtLabel },
          ].map((row, i) => (
            <div
              key={row.label}
              className="flex items-center justify-between px-4 py-3"
              style={{ borderTop: i > 0 ? '1px solid var(--ma-border-subtle)' : undefined }}
            >
              <span className="text-[13px]" style={{ color: 'var(--ma-fg-muted)' }}>
                {row.label}
              </span>
              <span
                className="text-[13px] font-semibold tabular-nums"
                style={{
                  color:
                    row.label === t.profile.detailEloChange && match.eloChange !== undefined
                      ? match.eloChange >= 0 ? 'var(--ma-success)' : 'var(--ma-danger)'
                      : 'var(--ma-fg)',
                }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </Card>

        {/* Close button */}
        <CardButton
          onClick={onClose}
          className={[
            'mx-4 mb-2 flex h-12 items-center justify-center',
            'text-[14px] font-semibold',
            'transition-transform duration-[var(--ma-duration-micro)] active:scale-[0.97]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
          ].join(' ')}
          style={{ color: 'var(--ma-fg-muted)' }}
        >
          {t.profile.close}
        </CardButton>
      </div>
    </>
  )
}
