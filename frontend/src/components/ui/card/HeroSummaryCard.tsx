import type { ReactNode } from 'react'

import { CardButton } from './Card'

export interface HeroSummaryCardProps {
  skeleton?: boolean
  subtitle?: ReactNode
  title: string
  icon?: ReactNode
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
  icon,
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
        <div className="flex items-center gap-3">
          <div className="skeleton h-11 w-11 shrink-0 rounded-2xl" />
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <div className="skeleton h-3 w-16 rounded" />
            <div className="skeleton h-5 w-36 rounded" />
            <div className="skeleton h-3.5 w-24 rounded" />
          </div>
          <div className="skeleton h-8 w-14 shrink-0 rounded-full" />
        </div>
        {progressPct !== undefined && (
          <div className="mt-3.5">
            <div className="skeleton h-1.5 w-full rounded-full" />
          </div>
        )}
      </div>
    )
  }

  return (
    <CardButton
      onClick={onClick}
      className={[
        'mx-4 w-[calc(100%-2rem)] text-left group relative overflow-hidden',
        'transition-all duration-[var(--ma-duration-micro)] active:scale-[0.985]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      shadow="sm"
      padding="1rem"
      aria-label={ariaLabel ?? title}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center text-lg rounded-2xl transition-transform duration-[var(--ma-duration-micro)] group-hover:scale-105"
            style={{
              background: 'var(--ma-brand-soft)',
              color: 'var(--ma-brand)',
              border: '1px solid var(--ma-border-subtle)',
            }}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          {subtitle && (
            <div
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
              style={{ color: 'var(--ma-brand)' }}
            >
              {subtitle}
            </div>
          )}
          <h3
            className="mt-0.5 truncate text-[15px] font-bold leading-tight"
            style={{ color: 'var(--ma-fg)' }}
          >
            {title}
          </h3>
          {detail && (
            <div className="mt-1 text-[12px]" style={{ color: 'var(--ma-fg-muted)' }}>
              {detail}
            </div>
          )}
        </div>
        {trailing && <div className="shrink-0 self-center">{trailing}</div>}
      </div>

      {/* Progress bar */}
      {progressPct !== undefined && (
        <div
          className="mt-3.5 overflow-hidden"
          style={{
            height: '5px',
            borderRadius: '9999px',
            background: 'var(--ma-progress-soft, rgba(0,0,0,0.06))',
          }}
          aria-hidden="true"
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, Math.max(0, progressPct))}%`,
              borderRadius: '9999px',
              background: progressColor,
              transition: 'width var(--ma-duration-expand) var(--ma-ease-standard)',
            }}
          />
        </div>
      )}
    </CardButton>
  )
}
