import { IconTrophy16 as IconTrophy, IconInfoCircle } from '@/components/ui/icons'
import { Card, CollapsibleCard } from '@/components/ui/card'
import type { ProfileData } from '@/services/profile/profile.interface'
import { useTranslation } from '@/i18n/useTranslation'
import { getLocalizedGameLabel } from '@/services/gameplay/gameplay-screen.types'

import type { ScoringSectionId } from '@/components/ui/modal/ScoringRulesModal'

export function EloCard({
  skeleton,
  data,
  onOpenScoringRules,
}: {
  skeleton?: boolean
  data: ProfileData
  onOpenScoringRules?: (section?: ScoringSectionId) => void
}) {
  const { t } = useTranslation()

  if (skeleton) {
    return (
      <Card className="mx-4 overflow-hidden" shadow="sm">
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--ma-border-subtle)' }}>
          <div className="skeleton" style={{ height: '0.75rem', width: '3.5rem', borderRadius: 'var(--radius-sm)' }} />
        </div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3" style={{ borderTop: i > 0 ? '1px solid var(--ma-border-subtle)' : undefined }}>
            <div className="skeleton" style={{ height: '0.875rem', width: '9rem', borderRadius: 'var(--radius-sm)' }} />
            <div className="skeleton" style={{ height: '0.875rem', width: '3rem', borderRadius: 'var(--radius-sm)' }} />
          </div>
        ))}
      </Card>
    )
  }

  return (
    <CollapsibleCard
      title={t.profile.eloRatingTitle}
      action={
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onOpenScoringRules?.('elo')
          }}
          className="flex h-5 w-5 items-center justify-center rounded-full text-[var(--ma-fg-subtle)] hover:text-[var(--ma-brand)] hover:bg-[var(--ma-brand-soft)] active:scale-95 transition-all"
          title={t.scoringRulesModal?.viewFullRules || 'Thông tin Elo'}
          aria-label={t.scoringRulesModal?.viewFullRules || 'Thông tin Elo'}
        >
          <IconInfoCircle size={14} />
        </button>
      }
    >
      {/* Overall Elo */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--ma-border-subtle)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              height: '2rem',
              width: '2rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--ma-brand-soft)',
            }}
            aria-hidden="true"
          >
            <span style={{ color: 'var(--ma-brand)' }}>
              <IconTrophy />
            </span>
          </div>
          <span className="text-[14px] font-semibold" style={{ color: 'var(--ma-fg)' }}>
            {t.profile.overall}
          </span>
        </div>
        <span
          className="text-[16px] font-bold tabular-nums"
          style={{ color: 'var(--ma-brand)' }}
          aria-label={t.profile.overallEloAria(data.overallElo)}
        >
          {data.overallElo}
        </span>
      </div>

      {/* Per-category rows */}
      {data.categoryElo.map((cat, i) => (
        <div
          key={cat.category}
          className="flex items-center justify-between px-4 py-3"
          style={{ borderTop: i > 0 ? '1px solid var(--ma-border-subtle)' : undefined }}
        >
          <span className="text-[13px] font-medium" style={{ color: 'var(--ma-fg-muted)' }}>
            {getLocalizedGameLabel(t, cat.category)}
          </span>
          <div className="flex items-center gap-2">
            {cat.delta !== 0 && (
              <span
                className="text-[11px] font-semibold tabular-nums"
                style={{ color: cat.delta > 0 ? 'var(--ma-success)' : 'var(--ma-danger)' }}
                aria-label={t.profile.lastMatchChangeAria(`${cat.delta > 0 ? '+' : ''}${cat.delta}`)}
              >
                {cat.delta > 0 ? '+' : ''}{cat.delta}
              </span>
            )}
            <span
              className="text-[14px] font-semibold tabular-nums"
              style={{ color: 'var(--ma-progress)' }}
            >
              {cat.elo}
            </span>
          </div>
        </div>
      ))}
    </CollapsibleCard>
  )
}
