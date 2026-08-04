import { IconChevronRight16 as IconChevronRight } from '@/components/ui/icons'
import { HeroSummaryCard } from '@/components/ui/card'
import type { LastPlayed } from '@/services/home/home.interface'
import { useTranslation } from '@/i18n/useTranslation'
import { getLocalizedGameLabel, getLocalizedModeLabel } from '@/services/gameplay/gameplay-screen.types'

interface ContinueCardProps {
  skeleton?: boolean
  last: LastPlayed | null
  onResume?: () => void
}

export function ContinueCard({ skeleton, last, onResume }: ContinueCardProps) {
  const { t } = useTranslation()

  if (!skeleton && !last) return null

  const pct = last ? Math.round((last.score / last.maxScore) * 100) : 0
  const gameLabel = last ? getLocalizedGameLabel(t, last.game) : ''
  const modeLabel = last ? getLocalizedModeLabel(t, last.mode) : ''

  const levelVal = last?.level ?? last?.score ?? 1
  const roundVal = last?.roundsPlayed ?? 1

  return (
    <HeroSummaryCard
      skeleton={skeleton}
      onClick={onResume}
      subtitle={t.home.continue}
      title={gameLabel}
      detail={
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span
            className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-md"
            style={{
              background: 'var(--ma-brand-soft)',
              color: 'var(--ma-brand)',
              border: '1px solid var(--ma-border-subtle)',
            }}
          >
            {modeLabel}
          </span>
          <span className="text-[12px]" style={{ color: 'var(--ma-fg-muted)' }}>
            · {t.gameSelect.levelValue(levelVal)} · {t.home.round} {roundVal}
          </span>
        </div>
      }
      progressPct={pct}
      ariaLabel={last ? `Resume ${gameLabel} — ${modeLabel}, Level ${levelVal}, Round ${roundVal}` : undefined}
      trailing={
        <div className="flex items-center gap-1.5" style={{ color: 'var(--ma-fg-muted)' }}>
          <span className="text-[12px] font-semibold" style={{ color: 'var(--ma-progress)' }}>
            {pct}%
          </span>
          <IconChevronRight />
        </div>
      }
    />
  )
}
