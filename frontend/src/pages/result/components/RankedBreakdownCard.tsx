import { Card } from '@/components/ui/card'

import type { ResultData } from '@/services/result/result.interface'
import { useTranslation } from '@/i18n/useTranslation'

export function RankedBreakdownCard({ data }: { data: ResultData }) {
  const { t } = useTranslation()
  const isRanked =
    data.mode === 'solo-ranked' || data.mode === 'versus-ranked'
  if (!isRanked || !data.rankedBreakdown) return null

  const b = data.rankedBreakdown
  // docs/gameplay/README.md § Scoring Formula: Perfect Bonus is a
  // multiplier (×1.25 zero-mistake / ×1.0 otherwise), not an additive line
  // — despite the doc's own field name "Perfect Bonus".
  const rows: { label: string; value: string; note?: string; highlight: boolean }[] = [
    { label: t.result.baseScore, value: b.baseScore.toLocaleString(), highlight: false },
    { label: t.result.speedBonus, value: `+${b.speedBonus.toLocaleString()}`, highlight: b.speedBonus > 0 },
    { label: t.result.difficulty, value: `×${b.difficultyMultiplier.toFixed(1)}`, note: t.result.multiplier, highlight: b.difficultyMultiplier !== 1 },
    { label: t.result.perfectBonus, value: `×${b.perfectBonus.toFixed(2)}`, note: t.result.multiplier, highlight: b.perfectBonus !== 1 },
    { label: t.result.completion, value: `×${b.completionMultiplier.toFixed(1)}`, note: t.result.multiplier, highlight: b.completionMultiplier !== 1 },
  ]

  return (
    <div className="mx-4 flex flex-col gap-0">
      <Card className="overflow-hidden" shadow="sm">
        {/* Header */}
        <div
          className="px-4 py-3"
          style={{ borderBottom: '1px solid var(--ma-border-subtle)' }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ma-fg-subtle)' }}>
            {t.result.scoreBreakdown}
          </p>
        </div>

        {/* Rows */}
        <div className="flex flex-col">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className="flex items-center justify-between px-4 py-3"
              style={{
                borderTop: i > 0 ? '1px solid var(--ma-border-subtle)' : undefined,
              }}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-medium" style={{ color: 'var(--ma-fg)' }}>
                  {row.label}
                </span>
                {row.note && (
                  <span className="text-[11px]" style={{ color: 'var(--ma-fg-subtle)' }}>
                    {row.note}
                  </span>
                )}
              </div>
              <span
                className="text-[14px] font-semibold tabular-nums"
                style={{
                  color: !row.highlight
                    ? 'var(--ma-fg)'
                    : row.value.startsWith('+')
                    ? 'var(--ma-success)'
                    : 'var(--ma-brand)',
                }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div
          className="flex items-center justify-between px-4 py-3.5"
          style={{
            borderTop: '1px solid var(--ma-border)',
            background: 'var(--ma-surface-raised)',
          }}
        >
          <span className="text-[13px] font-bold" style={{ color: 'var(--ma-fg)' }}>
            {t.result.total}
          </span>
          <span
            className="text-[16px] font-bold tabular-nums"
            style={{ color: 'var(--ma-fg)' }}
          >
            {data.score.toLocaleString()}
          </span>
        </div>
      </Card>
    </div>
  )
}
