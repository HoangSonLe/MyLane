import type { ReactNode } from 'react'

import { CardButton } from './Card'

export interface HeroSummaryCardProps {
  skeleton?: boolean
  subtitle?: string
  title: string
  detail?: ReactNode
  progressPct?: number
  progressColor?: string
  trailing?: ReactNode
  onClick?: () => void
  ariaLabel?: string
  className?: string
}

export function HeroSummaryCard({
  skeleton,
  subtitle,
  title,
  detail,
  progressPct,
  progressColor = 'var(--ma-progress)',
  trailing,
  onClick,
  ariaLabel,
  className = '',
}: HeroSummaryCardProps) {
  if (skeleton) {
    return (
      <div className={['mx-4 rounded-2xl bg-[var(--ma-surface)] p-4 shadow-sm', className].join(' ')}>
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            {subtitle && (
              <div className="skeleton h-3.5 w-20 rounded" />
            )}
            <div className="skeleton h-5 w-36 rounded" />
            {detail && <div className="skeleton h-3.5 w-24 rounded" />}
          </div>
          <div className="skeleton h-8 w-18 rounded-xl" />
        </div>
        {progressPct !== undefined && (
          <div className="mt-4">
            <div className="skeleton h-1 w-full rounded" />
          </div>
        )}
      </div>
    )
  }

  return (
    <CardButton
      onClick={onClick}
      className={[
        'mx-4 w-[calc(100%-2rem)] text-left',
        'transition-transform duration-[var(--ma-duration-micro)] active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      shadow="sm"
      padding="1rem"
      aria-label={ariaLabel ?? title}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {subtitle && (
            <p
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: 'var(--ma-fg-subtle)' }}
            >
              {subtitle}
            </p>
          )}
          <p
            className="mt-0.5 truncate text-[15px] font-semibold leading-snug"
            style={{ color: 'var(--ma-fg)' }}
          >
            {title}
          </p>
          {detail && (
            <div className="text-[12px]" style={{ color: 'var(--ma-fg-muted)' }}>
              {detail}
            </div>
          )}
        </div>
        {trailing && <div className="mt-0.5 shrink-0 self-start">{trailing}</div>}
      </div>

      {/* Progress bar */}
      {progressPct !== undefined && (
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
              width: `${Math.min(100, Math.max(0, progressPct))}%`,
              borderRadius: 'var(--radius-sm)',
              background: progressColor,
              transition: 'width var(--ma-duration-expand) var(--ma-ease-standard)',
            }}
          />
        </div>
      )}
    </CardButton>
  )
}
