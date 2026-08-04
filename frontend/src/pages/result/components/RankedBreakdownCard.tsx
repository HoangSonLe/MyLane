import { Card } from '@/components/ui/card'
import { IconInfoCircle } from '@/components/ui/icons'
import type { ResultData } from '@/services/result/result.interface'
import { useTranslation } from '@/i18n/useTranslation'
import type { ScoringSectionId } from '@/components/ui/modal/ScoringRulesModal'

export function RankedBreakdownCard({
  data,
  onOpenScoringRules,
}: {
  data: ResultData
  onOpenScoringRules?: (section?: ScoringSectionId) => void
}) {
  const { t } = useTranslation()
  const isRanked =
    data.mode === 'solo-ranked' || data.mode === 'versus-ranked'
  if (!isRanked || !data.rankedBreakdown) return null

  const b = data.rankedBreakdown
  const rows: { sectionId: ScoringSectionId; label: string; value: string; note?: string; highlight: boolean }[] = [
    { sectionId: 'base', label: t.result.baseScore, value: b.baseScore.toLocaleString(), highlight: false },
    { sectionId: 'speed', label: t.result.speedBonus, value: `+${b.speedBonus.toLocaleString()}`, highlight: b.speedBonus > 0 },
    { sectionId: 'difficulty', label: t.result.difficulty, value: `×${b.difficultyMultiplier.toFixed(1)}`, note: t.result.multiplier, highlight: b.difficultyMultiplier !== 1 },
    { sectionId: 'perfect', label: t.result.perfectBonus, value: `×${b.perfectBonus.toFixed(2)}`, note: t.result.multiplier, highlight: b.perfectBonus !== 1 },
    { sectionId: 'completion', label: t.result.completion, value: `×${b.completionMultiplier.toFixed(1)}`, note: t.result.multiplier, highlight: b.completionMultiplier !== 1 },
  ]

  return (
    <div className="mx-4 flex flex-col gap-0">
      <Card className="overflow-hidden" shadow="sm">
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid var(--ma-border-subtle)' }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ma-fg-subtle)' }}>
            {t.result.scoreBreakdown}
          </p>
          <button
            type="button"
            onClick={() => onOpenScoringRules?.()}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--ma-brand)] hover:underline active:scale-95 transition-all"
            title={t.scoringRulesModal?.viewFullRules || 'Thông tin tính điểm'}
          >
            <IconInfoCircle size={13} />
            <span>{t.scoringRulesModal?.viewFullRules || 'Thông tin'}</span>
          </button>
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
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-medium" style={{ color: 'var(--ma-fg)' }}>
                    {row.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenScoringRules?.(row.sectionId)}
                    className="flex h-4 w-4 items-center justify-center rounded-full text-[var(--ma-fg-subtle)] hover:text-[var(--ma-brand)] hover:bg-[var(--ma-brand-soft)] active:scale-95 transition-all"
                    title={t.scoringRulesModal?.viewFullRules || 'Thông tin tính điểm'}
                    aria-label={`Giải thích ${row.label}`}
                  >
                    <IconInfoCircle size={13} />
                  </button>
                </div>
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
