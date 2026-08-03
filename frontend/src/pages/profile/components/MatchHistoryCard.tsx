import { useState } from 'react'

import { Card, CollapsibleCard } from '@/components/ui/card'
import { useTranslation } from '@/i18n/useTranslation'
import type { MatchEntry, ProfileData } from '@/services/profile/profile.interface'
import { MatchRow } from './MatchRow'

const MAX_VISIBLE = 5

export function MatchHistoryCard({
  skeleton,
  data,
  onOpenMatch,
}: {
  skeleton?: boolean
  data: ProfileData
  onOpenMatch: (match: MatchEntry) => void
}) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

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

  const visible = expanded ? data.matchHistory : data.matchHistory.slice(0, MAX_VISIBLE)
  const hasMore = data.matchHistory.length > MAX_VISIBLE

  return (
    <CollapsibleCard
      title={t.profile.matchHistory}
      subtitle={`${data.matchHistory.length} ${t.profile.recent}`}
    >
      {visible.map((match, i) => (
        <div
          key={match.id}
          style={{ borderTop: i > 0 ? '1px solid var(--ma-border-subtle)' : undefined }}
        >
          <MatchRow match={match} onOpen={onOpenMatch} />
        </div>
      ))}

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="w-full py-2.5 text-[12px] font-semibold transition-opacity hover:opacity-70 active:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
          style={{
            borderTop: '1px solid var(--ma-border-subtle)',
            color: 'var(--ma-brand)',
          }}
        >
          {expanded
            ? t.profile.showLess
            : t.profile.seeAllMatches(data.matchHistory.length)}
        </button>
      )}
    </CollapsibleCard>
  )
}
