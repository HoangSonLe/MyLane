import { Card, StatCell, CollapsibleCard } from '@/components/ui/card'
import { useTranslation } from '@/i18n/useTranslation'
import type { ProfileData } from '@/services/profile/profile.interface'

export function RecordStatsCard({
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
          <div className="skeleton" style={{ height: '0.75rem', width: '3rem', borderRadius: 'var(--radius-sm)' }} />
        </div>
        <div className="flex">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2 py-4" style={{ borderLeft: i > 0 ? '1px solid var(--ma-border-subtle)' : undefined }}>
              <div className="skeleton" style={{ height: '0.75rem', width: '2.5rem', borderRadius: 'var(--radius-sm)' }} />
              <div className="skeleton" style={{ height: '1.5rem', width: '3rem', borderRadius: 'var(--radius-sm)' }} />
            </div>
          ))}
        </div>
        <div className="px-4 pb-3 pt-1">
          <div className="skeleton" style={{ height: '0.5rem', width: '100%', borderRadius: 'var(--radius-sm)' }} />
        </div>
      </Card>
    )
  }

  const winRate = data.totalGames > 0
    ? Math.round((data.wins / data.totalGames) * 100)
    : 0

  const stats = [
    { label: t.profile.games,  value: data.totalGames.toLocaleString(), color: 'var(--ma-fg)' },
    { label: t.profile.wins,   value: data.wins.toLocaleString(),       color: 'var(--ma-success)' },
    { label: t.profile.losses, value: data.losses.toLocaleString(),     color: 'var(--ma-danger)' },
    { label: t.profile.draws,  value: data.draws.toLocaleString(),      color: 'var(--ma-fg-muted)' },
  ]

  return (
    <CollapsibleCard
      title={t.profile.record}
      subtitle={t.profile.winRate(winRate)}
    >
      {/* Stats row */}
      <div className="flex">
        {stats.map((s, i) => (
          <StatCell
            key={s.label}
            className="flex flex-1 flex-col items-center gap-0.5 py-3.5"
            style={{ borderLeft: i > 0 ? '1px solid var(--ma-border-subtle)' : undefined }}
            valueClassName="text-[18px] font-bold tabular-nums"
            label={s.label}
            value={s.value}
            valueColor={s.color}
            ariaLabel={`${s.label}: ${s.value}`}
          />
        ))}
      </div>

      {/* Win/loss/draw bar */}
      <div className="flex overflow-hidden mx-4 mb-3" style={{ height: '4px', borderRadius: 'var(--radius-sm)', gap: '2px' }} aria-hidden="true">
        {data.wins > 0 && (
          <div
            style={{
              flex: data.wins,
              background: 'var(--ma-success)',
              borderRadius: 'var(--radius-sm)',
            }}
          />
        )}
        {data.draws > 0 && (
          <div
            style={{
              flex: data.draws,
              background: 'var(--ma-fg-subtle)',
              borderRadius: 'var(--radius-sm)',
            }}
          />
        )}
        {data.losses > 0 && (
          <div
            style={{
              flex: data.losses,
              background: 'var(--ma-danger)',
              borderRadius: 'var(--radius-sm)',
            }}
          />
        )}
      </div>
    </CollapsibleCard>
  )
}
