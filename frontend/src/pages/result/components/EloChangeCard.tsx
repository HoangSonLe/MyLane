import { Card } from '@/components/ui/card'

import { IconTrophy } from './icons'
import type { ResultData } from '@/services/result/result.interface'
import { useTranslation } from '@/i18n/useTranslation'

export function EloChangeCard({ data }: { data: ResultData }) {
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
          <p className="text-[13px] font-semibold" style={{ color: 'var(--ma-fg)' }}>
            {t.result.eloRating}
          </p>
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
