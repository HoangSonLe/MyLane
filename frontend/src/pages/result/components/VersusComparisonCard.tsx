import { Card } from '@/components/ui/card'
import type { GameResultInput, MatchFinishReason, VersusComparisonData } from '@/services/result/result.interface'
import { useTranslation } from '@/i18n/useTranslation'

type MatchOutcome = NonNullable<GameResultInput['outcome']>

function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?'
}

export function VersusComparisonCard({
  comparison,
  outcome,
  finishReason,
}: {
  comparison: VersusComparisonData
  outcome?: MatchOutcome
  finishReason?: MatchFinishReason
}) {
  const { t } = useTranslation()
  const resolvedOutcome = outcome ?? (
    comparison.playerScore > comparison.opponentScore
      ? 'win'
      : comparison.playerScore < comparison.opponentScore ? 'loss' : 'draw'
  )

  const playerStatus = resolvedOutcome === 'win'
    ? t.result.winner
    : resolvedOutcome === 'loss' ? t.result.defeated : t.result.draw
  const opponentStatus = resolvedOutcome === 'loss'
    ? t.result.winner
    : resolvedOutcome === 'win' ? t.result.defeated : t.result.draw

  return (
    <Card className="mx-4 overflow-hidden" shadow="sm" aria-label={t.result.versusComparison}>
      <div
        className="flex items-center justify-between gap-3 px-4 py-3"
        style={{ borderBottom: '1px solid var(--ma-border-subtle)' }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ma-fg-subtle)' }}>
          {t.result.versusComparison}
        </p>
        <span
          className="rounded-lg px-2.5 py-1 text-[11px] font-bold"
          style={{
            background: resolvedOutcome === 'win'
              ? 'oklch(0.70 0.15 145 / 0.12)'
              : resolvedOutcome === 'loss' ? 'oklch(0.62 0.19 22 / 0.10)' : 'var(--ma-surface-raised)',
            color: resolvedOutcome === 'win'
              ? 'var(--ma-success)'
              : resolvedOutcome === 'loss' ? 'var(--ma-danger)' : 'var(--ma-fg-muted)',
          }}
        >
          {resolvedOutcome === 'win' ? t.result.youWin : resolvedOutcome === 'loss' ? t.result.youLose : t.result.draw}
        </span>
      </div>

      {finishReason === 'forfeit' && resolvedOutcome === 'win' && (
        <div
          className="px-4 py-2.5 text-center text-[12px] font-semibold"
          style={{
            background: 'oklch(0.70 0.15 145 / 0.10)',
            borderBottom: '1px solid oklch(0.70 0.15 145 / 0.22)',
            color: 'var(--ma-success)',
          }}
        >
          {t.result.forfeitWinSummary}
        </div>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-4 py-5">
        <div className="flex min-w-0 flex-col items-center gap-2 text-center">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full text-[16px] font-bold"
            style={{ background: 'var(--ma-brand)', color: 'var(--ma-brand-fg)' }}
            aria-hidden="true"
          >
            {initial(comparison.playerName)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold" style={{ color: 'var(--ma-fg)' }}>
              {comparison.playerName}
            </p>
            <p className="text-[11px]" style={{ color: 'var(--ma-fg-subtle)' }}>{t.result.you}</p>
          </div>
          <p className="text-[28px] font-bold tabular-nums leading-none" style={{ color: 'var(--ma-fg)' }}>
            {comparison.playerScore}
          </p>
          <span className="text-[11px] font-semibold" style={{ color: resolvedOutcome === 'win' ? 'var(--ma-success)' : 'var(--ma-fg-muted)' }}>
            {playerStatus}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1" aria-hidden="true">
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--ma-fg-subtle)' }}>VS</span>
          <span className="h-8 w-px" style={{ background: 'var(--ma-border-subtle)' }} />
        </div>

        <div className="flex min-w-0 flex-col items-center gap-2 text-center">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full text-[16px] font-bold"
            style={{ background: 'var(--ma-surface-raised)', border: '1px solid var(--ma-border)', color: 'var(--ma-fg-muted)' }}
            aria-hidden="true"
          >
            {initial(comparison.opponentName)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold" style={{ color: 'var(--ma-fg)' }}>
              {comparison.opponentName}
            </p>
            <p className="text-[11px]" style={{ color: 'var(--ma-fg-subtle)' }}>{t.result.opponent}</p>
          </div>
          <p className="text-[28px] font-bold tabular-nums leading-none" style={{ color: 'var(--ma-fg)' }}>
            {comparison.opponentScore}
          </p>
          <span className="text-[11px] font-semibold" style={{ color: resolvedOutcome === 'loss' ? 'var(--ma-success)' : 'var(--ma-fg-muted)' }}>
            {opponentStatus}
          </span>
        </div>
      </div>

      <div
        className="px-4 py-2.5 text-center text-[11px] font-medium"
        style={{ borderTop: '1px solid var(--ma-border-subtle)', color: 'var(--ma-fg-subtle)' }}
      >
        {t.result.correctRounds}: {comparison.playerScore}/{comparison.totalRounds} · {comparison.opponentScore}/{comparison.totalRounds}
      </div>
    </Card>
  )
}
