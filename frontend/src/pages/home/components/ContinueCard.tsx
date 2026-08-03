import { IconChevronRight16 as IconChevronRight } from '@/components/ui/icons'
import { HeroSummaryCard } from '@/components/ui/card'
import type { LastPlayed } from '@/services/home/home.interface'
import { useTranslation } from '@/i18n/useTranslation'

interface ContinueCardProps {
  skeleton?: boolean
  last: LastPlayed | null
  onResume?: () => void
}

export function ContinueCard({ skeleton, last, onResume }: ContinueCardProps) {
  const { t } = useTranslation()

  if (!skeleton && !last) return null

  const pct = last ? Math.round((last.score / last.maxScore) * 100) : 0

  return (
    <HeroSummaryCard
      skeleton={skeleton}
      onClick={onResume}
      subtitle={t.home.continue}
      title={last?.game ?? ''}
      detail={`${last?.mode ?? ''} · ${t.home.round} ${last?.score ?? 0}`}
      progressPct={pct}
      ariaLabel={last ? `Resume ${last.game} — ${last.mode} mode, round ${last.score} of ${last.maxScore}` : undefined}
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
