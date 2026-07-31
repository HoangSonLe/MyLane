import { IconUser } from '@/components/ui/icons'
import { Card } from '@/components/ui/card'

interface EloContextBadgeProps {
  skeleton?: boolean
  elo: number
  name: string
}

export function EloContextBadge({ skeleton, elo, name }: EloContextBadgeProps) {
  if (skeleton) {
    return (
      <div
        className="skeleton mx-4"
        style={{ height: '3.25rem', borderRadius: 'var(--radius-2xl)' }}
      />
    )
  }

  return (
    <Card className="mx-4 flex items-center justify-between" padding="0.75rem 1rem">
      <div className="flex items-center gap-2.5">
        {/* Avatar */}
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
          <IconUser />
        </div>
        <div>
          <p className="text-[13px] font-semibold leading-none" style={{ color: 'var(--ma-fg)' }}>
            {name}
          </p>
          <p className="mt-0.5 text-[11px]" style={{ color: 'var(--ma-fg-muted)' }}>
            Versus · Ranked
          </p>
        </div>
      </div>
      {/* Elo */}
      <div className="flex flex-col items-end">
        <span
          className="text-[16px] font-bold tabular-nums leading-none"
          style={{ color: 'var(--ma-progress)' }}
        >
          {elo}
        </span>
        <span
          className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--ma-fg-subtle)' }}
        >
          Elo
        </span>
      </div>
    </Card>
  )
}
