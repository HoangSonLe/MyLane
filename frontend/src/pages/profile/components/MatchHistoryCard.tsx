import { Card } from '@/components/ui/card'

import type { MatchEntry, ProfileData } from '@/services/profile/profile.interface'
import { MatchRow } from './MatchRow'

export function MatchHistoryCard({
  skeleton,
  data,
  onOpenMatch,
}: {
  skeleton?: boolean
  data: ProfileData
  onOpenMatch: (match: MatchEntry) => void
}) {
  if (skeleton) {
    return (
      <Card className="mx-4 overflow-hidden" shadow="sm">
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--ma-border-subtle)' }}>
          <div className="skeleton" style={{ height: '0.75rem', width: '5.5rem', borderRadius: 'var(--radius-sm)' }} />
        </div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: i > 0 ? '1px solid var(--ma-border-subtle)' : undefined }}>
            <div className="skeleton shrink-0" style={{ height: '2rem', width: '2rem', borderRadius: 'var(--radius-lg)' }} />
            <div className="flex flex-1 flex-col gap-2">
              <div className="skeleton" style={{ height: '0.875rem', width: '8rem', borderRadius: 'var(--radius-sm)' }} />
              <div className="skeleton" style={{ height: '0.75rem', width: '5.5rem', borderRadius: 'var(--radius-sm)' }} />
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="skeleton" style={{ height: '0.875rem', width: '3.5rem', borderRadius: 'var(--radius-sm)' }} />
              <div className="skeleton" style={{ height: '0.75rem', width: '2rem', borderRadius: 'var(--radius-sm)' }} />
            </div>
          </div>
        ))}
      </Card>
    )
  }

  return (
    <Card className="mx-4 overflow-hidden" shadow="sm">
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--ma-border-subtle)' }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ma-fg-subtle)' }}>
          Match History
        </p>
        <span className="text-[11px] font-semibold tabular-nums" style={{ color: 'var(--ma-fg-subtle)' }}>
          {data.matchHistory.length} recent
        </span>
      </div>

      {data.matchHistory.map((match, i) => (
        <div
          key={match.id}
          style={{ borderTop: i > 0 ? '1px solid var(--ma-border-subtle)' : undefined }}
        >
          <MatchRow match={match} onOpen={onOpenMatch} />
        </div>
      ))}
    </Card>
  )
}
