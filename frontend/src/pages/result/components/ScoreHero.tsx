import { Card, StatCell } from '@/components/ui/card'
import { IconInfoCircle } from '@/components/ui/icons'
import { IconTrophy } from './icons'
import type { ResultData } from '@/services/result/result.interface'
import { useTranslation } from '@/i18n/useTranslation'

export function ScoreHero({
  skeleton,
  data,
  onOpenScoringRules,
}: {
  skeleton?: boolean
  data: ResultData
  onOpenScoringRules?: () => void
}) {
  const { t } = useTranslation()
  const isRanked =
    data.mode === 'solo-ranked' || data.mode === 'versus-ranked'

  if (skeleton) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-6">
        <div className="skeleton" style={{ height: '1rem', width: '8rem', borderRadius: 'var(--radius-sm)' }} />
        <div className="skeleton" style={{ height: '4rem', width: '10rem', borderRadius: 'var(--radius-sm)' }} />
        <div className="flex gap-4 mt-1">
          <div className="skeleton" style={{ height: '2.5rem', width: '6rem', borderRadius: 'var(--radius-xl)' }} />
          <div className="skeleton" style={{ height: '2.5rem', width: '6rem', borderRadius: 'var(--radius-xl)' }} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 px-4 pt-4 pb-2">
      {/* Game + mode label */}
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-[12px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ma-fg-subtle)' }}>
          {data.game}
        </p>
        <div
          className="flex items-center gap-1.5 rounded-xl px-3 py-1"
          style={{
            background: isRanked ? 'oklch(0.76 0.14 74 / 0.12)' : 'var(--ma-surface)',
            border: `1px solid ${isRanked ? 'oklch(0.76 0.14 74 / 0.30)' : 'var(--ma-border)'}`,
          }}
        >
          {isRanked && (
            <span style={{ color: 'var(--ma-brand)' }} className="leading-none">
              <IconTrophy />
            </span>
          )}
          <span
            className="text-[12px] font-semibold"
            style={{ color: isRanked ? 'var(--ma-brand)' : 'var(--ma-fg-muted)' }}
          >
            {data.modeLabel}
          </span>
        </div>
      </div>

      {/* Score */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-1.5">
          <p
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--ma-fg-subtle)' }}
          >
            {t.result.finalScore}
          </p>
          <button
            type="button"
            onClick={onOpenScoringRules}
            className="flex h-5 w-5 items-center justify-center rounded-full text-[var(--ma-fg-subtle)] hover:text-[var(--ma-brand)] hover:bg-[var(--ma-brand-soft)] active:scale-95 transition-all"
            title={t.scoringRulesModal?.viewFullRules || 'Thông tin tính điểm'}
            aria-label={t.scoringRulesModal?.viewFullRules || 'Thông tin tính điểm'}
          >
            <IconInfoCircle size={14} />
          </button>
        </div>
        <p
          className="text-[56px] font-bold tabular-nums leading-none"
          style={{ color: 'var(--ma-fg)' }}
          aria-label={t.result.finalScoreAria(data.score.toLocaleString())}
        >
          {data.score.toLocaleString()}
        </p>
      </div>

      {/* Stat chips */}
      <div className="flex gap-3">
        {/* Level reached */}
        <Card className="min-w-[6rem] px-4 py-2.5" radius="xl" shadow="sm">
          <StatCell
            className="flex flex-col items-center gap-0.5"
            valueClassName="text-[18px] font-bold tabular-nums leading-snug"
            label={t.result.level}
            value={data.levelReached}
          />
        </Card>
        {/* Previous best */}
        {data.previousBestScore !== null && (
          <Card className="min-w-[6rem] px-4 py-2.5" radius="xl" shadow="sm">
            <StatCell
              className="flex flex-col items-center gap-0.5"
              valueClassName="text-[18px] font-bold tabular-nums leading-snug"
              label={t.result.prevBest}
              value={data.previousBestScore.toLocaleString()}
              valueColor="var(--ma-fg-muted)"
            />
          </Card>
        )}
      </div>
    </div>
  )
}
