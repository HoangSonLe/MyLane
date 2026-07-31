import { IconChevronRight16 as IconChevronRight } from '@/components/ui/icons'
import { Card, CardButton } from '@/components/ui/card'
import type { LastPlayed } from '@/services/home/home.interface'

interface ContinueCardProps {
  skeleton?: boolean
  last: LastPlayed | null
  onResume?: () => void
}

export function ContinueCard({ skeleton, last, onResume }: ContinueCardProps) {
  if (skeleton) {
    return (
      <Card className="mx-4" shadow="sm" padding="1rem">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <div className="skeleton" style={{ height: '0.875rem', width: '5.5rem', borderRadius: 'var(--radius-sm)' }} />
            <div className="skeleton" style={{ height: '1.25rem', width: '9rem', borderRadius: 'var(--radius-sm)' }} />
            <div className="skeleton" style={{ height: '0.875rem', width: '6rem', borderRadius: 'var(--radius-sm)' }} />
          </div>
          <div className="skeleton" style={{ height: '2rem', width: '4.5rem', borderRadius: 'var(--radius-xl)' }} />
        </div>
        <div className="mt-4">
          <div className="skeleton" style={{ height: '0.5rem', width: '100%', borderRadius: 'var(--radius-sm)' }} />
        </div>
      </Card>
    )
  }

  if (!last) return null

  const pct = Math.round((last.score / last.maxScore) * 100)

  return (
    <CardButton
      onClick={onResume}
      className={[
        'mx-4 w-[calc(100%-2rem)] text-left',
        'transition-transform duration-[var(--ma-duration-micro)] active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
      ].join(' ')}
      shadow="sm"
      padding="1rem"
      aria-label={`Resume ${last.game} — ${last.mode} mode, round ${last.score} of ${last.maxScore}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ma-fg-subtle)' }}>
            Continue
          </p>
          <p className="mt-0.5 text-[15px] font-semibold leading-snug truncate" style={{ color: 'var(--ma-fg)' }}>
            {last.game}
          </p>
          <p className="text-[12px]" style={{ color: 'var(--ma-fg-muted)' }}>
            {last.mode} · Round {last.score}
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 self-start mt-0.5" style={{ color: 'var(--ma-fg-muted)' }}>
          <span className="text-[12px] font-semibold" style={{ color: 'var(--ma-progress)' }}>
            {pct}%
          </span>
          <IconChevronRight />
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="mt-3 overflow-hidden"
        style={{
          height: '4px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--ma-progress-soft)',
        }}
        aria-hidden="true"
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--ma-progress)',
            transition: `width var(--ma-duration-expand) var(--ma-ease-standard)`,
          }}
        />
      </div>
    </CardButton>
  )
}
