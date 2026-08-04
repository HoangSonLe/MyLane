import { Card } from '@/components/ui/card'
import { IconInfoCircle } from '@/components/ui/icons'
import { IconTrophy } from './icons'
import type { ResultData } from '@/services/result/result.interface'
import { useTranslation } from '@/i18n/useTranslation'
import type { ScoringSectionId } from '@/components/ui/modal/ScoringRulesModal'

export function EloChangeCard({
  data,
  onOpenScoringRules,
}: {
  data: ResultData
  onOpenScoringRules?: (section?: ScoringSectionId) => void
}) {
  const { t } = useTranslation()
  if (data.mode !== 'versus-ranked' || data.eloChange === undefined) return null

  const gained = data.eloChange >= 0
  const prevElo = data.previousElo ?? 1000
  const newElo = prevElo + data.eloChange

  return (
    <Card className="mx-4 flex items-center justify-between gap-3 px-4 py-3.5" shadow="sm">
      {/* Label + icon */}
      <div className="flex items-center gap-2.5">
        <div
          className="shrink-0 flex items-center justify-center"
          style={{
            height: '2.25rem',
            width: '2.25rem',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--ma-icon-bg)',
          }}
          aria-hidden="true"
        >
          <span style={{ color: 'var(--ma-progress)' }}>
            <IconTrophy />
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <p className="text-[13px] font-semibold" style={{ color: 'var(--ma-fg)' }}>
              {t.result.eloRating}
            </p>
            <button
              type="button"
              onClick={() => onOpenScoringRules?.('elo')}
              className="flex h-4 w-4 items-center justify-center rounded-full text-[var(--ma-fg-subtle)] hover:text-[var(--ma-brand)] hover:bg-[var(--ma-brand-soft)] active:scale-95 transition-all"
              title={t.scoringRulesModal?.viewFullRules || 'Thông tin Elo'}
              aria-label={`Giải thích ${t.result.eloRating}`}
            >
              <IconInfoCircle size={13} />
            </button>
          </div>
          <p className="text-[11px]" style={{ color: 'var(--ma-fg-muted)' }}>
            {prevElo} → {newElo}
          </p>
        </div>
      </div>

      {/* Delta */}
      <span
        className="text-[17px] font-bold tabular-nums"
        style={{ color: gained ? 'var(--ma-success)' : 'var(--ma-danger)' }}
        aria-label={t.result.eloChangeAria(`${gained ? '+' : ''}${data.eloChange}`)}
      >
        {gained ? '+' : ''}{data.eloChange}
      </span>
    </Card>
  )
}
