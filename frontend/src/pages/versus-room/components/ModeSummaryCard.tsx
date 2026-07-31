import { IconSwords } from '@/components/ui/icons'
import { Card } from '@/components/ui/card'

import type { GameCategory, RoomMode } from '@/services/versus-room/versus-room.interface'

export function ModeSummaryCard({
  skeleton,
  mode,
  category,
}: {
  skeleton?: boolean
  mode: RoomMode
  category: GameCategory | null
}) {
  if (skeleton) {
    return (
      <div
        className="skeleton mx-4"
        style={{ height: '3.5rem', borderRadius: 'var(--radius-2xl)' }}
      />
    )
  }

  const isRanked = mode === 'versus-ranked'

  return (
    <Card className="mx-4 flex items-center justify-between" padding="0.875rem 1rem">
      <div className="flex items-center gap-2.5">
        <div
          className="flex shrink-0 items-center justify-center"
          style={{
            height: '2rem',
            width: '2rem',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--ma-icon-bg)',
            border: '1px solid var(--ma-border)',
            color: 'var(--ma-fg-muted)',
          }}
          aria-hidden="true"
        >
          <IconSwords />
        </div>
        <div>
          <p className="text-[13px] font-semibold leading-none" style={{ color: 'var(--ma-fg)' }}>
            {category ? category.label : 'No game selected'}
          </p>
          <p className="mt-0.5 text-[11px]" style={{ color: 'var(--ma-fg-muted)' }}>
            Versus &middot; {isRanked ? 'Ranked' : 'Unranked'}
          </p>
        </div>
      </div>
      <span
        className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5"
        style={{
          borderRadius: 'var(--radius-md)',
          background: isRanked ? 'var(--ma-progress-soft)' : 'var(--ma-surface-raised)',
          color: isRanked ? 'var(--ma-progress)' : 'var(--ma-fg-muted)',
          border: `1px solid ${isRanked ? 'var(--ma-progress-soft)' : 'var(--ma-border)'}`,
        }}
      >
        {isRanked ? 'Ranked' : 'Unranked'}
      </span>
    </Card>
  )
}
