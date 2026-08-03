import { Card, CollapsibleCard } from '@/components/ui/card'
import type { ProfileData } from '@/services/profile/profile.interface'
import { useTranslation } from '@/i18n/useTranslation'

export function BestScoresCard({
  skeleton,
  data,
}: {
  skeleton?: boolean
  data: ProfileData
}) {
  const { t } = useTranslation()

  if (skeleton) {
    return (
      <Card className="mx-4 overflow-hidden" shadow="sm">
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--ma-border-subtle)' }}>
          <div className="skeleton" style={{ height: '0.75rem', width: '5rem', borderRadius: 'var(--radius-sm)' }} />
        </div>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="px-4 py-3 flex flex-col gap-2" style={{ borderTop: i > 0 ? '1px solid var(--ma-border-subtle)' : undefined }}>
            <div className="skeleton" style={{ height: '0.875rem', width: '6rem', borderRadius: 'var(--radius-sm)' }} />
            <div className="flex gap-3">
              <div className="skeleton" style={{ height: '2.5rem', flex: 1, borderRadius: 'var(--radius-lg)' }} />
              <div className="skeleton" style={{ height: '2.5rem', flex: 1, borderRadius: 'var(--radius-lg)' }} />
            </div>
          </div>
        ))}
      </Card>
    )
  }

  return (
    <CollapsibleCard title={t.profile.bestScoresTitle}>
      {data.categoryBests.map((cat, i) => (
        <div
          key={cat.category}
          className="px-4 py-3"
          style={{ borderTop: i > 0 ? '1px solid var(--ma-border-subtle)' : undefined }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-semibold" style={{ color: 'var(--ma-fg)' }}>
              {cat.label}
            </p>
            <span
              className="text-[11px] font-semibold"
              style={{ color: 'var(--ma-fg-subtle)' }}
            >
              {t.profile.peakLevel(cat.highestLevel)}
            </span>
          </div>
          <div className="flex gap-2">
            {/* Practice best */}
            <div
              className="flex flex-1 flex-col gap-0.5 px-3 py-2"
              style={{
                borderRadius: 'var(--radius-lg)',
                background: 'var(--ma-surface-raised)',
                border: '1px solid var(--ma-border-subtle)',
              }}
            >
              <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ma-fg-subtle)' }}>
                {t.profile.practice}
              </span>
              <span className="text-[15px] font-bold tabular-nums" style={{ color: 'var(--ma-fg)' }}>
                {cat.practiceScore.toLocaleString()}
              </span>
              <span className="text-[11px]" style={{ color: 'var(--ma-fg-muted)' }}>
                {t.profile.levelPrefix(cat.practiceLevel)}
              </span>
            </div>
            {/* Ranked best */}
            <div
              className="flex flex-1 flex-col gap-0.5 px-3 py-2"
              style={{
                borderRadius: 'var(--radius-lg)',
                background: 'var(--ma-surface-raised)',
                border: '1px solid var(--ma-border-subtle)',
              }}
            >
              <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ma-fg-subtle)' }}>
                {t.profile.ranked}
              </span>
              <span className="text-[15px] font-bold tabular-nums" style={{ color: 'var(--ma-fg)' }}>
                {cat.rankedScore.toLocaleString()}
              </span>
              <span className="text-[11px]" style={{ color: 'var(--ma-fg-muted)' }}>
                {t.profile.levelPrefix(cat.rankedLevel)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </CollapsibleCard>
  )
}
