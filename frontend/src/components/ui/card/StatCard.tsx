import type { CSSProperties, ReactNode } from 'react'

/**
 * StatCell — the "uppercase muted label (+ optional icon) over bold value"
 * pair repeated across GameSelect's GameCard stats row, Result's score
 * chips, and Profile's RecordStatsCard row. The surrounding row container
 * differs too much per call site (border-top vs per-cell border-left vs
 * individually-Carded chips) to share safely, so callers keep their own
 * row div and render one StatCell per column.
 */
export interface StatCellProps {
  icon?: ReactNode
  label: ReactNode
  value: ReactNode
  valueColor?: string
  ariaLabel?: string
  className?: string
  style?: CSSProperties
  labelClassName?: string
  valueClassName?: string
}

export function StatCell({
  icon,
  label,
  value,
  valueColor = 'var(--ma-fg)',
  ariaLabel,
  className = 'flex flex-col items-center justify-center gap-0.5 text-center',
  style,
  labelClassName = 'text-[10px] font-semibold uppercase tracking-widest',
  valueClassName = 'text-[13px] font-semibold',
}: StatCellProps) {
  return (
    <div className={className} style={style}>
      <span
        className={[
          icon ? 'flex items-center justify-center gap-1' : '',
          labelClassName,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ color: 'var(--ma-fg-subtle)' }}
      >
        {icon}
        {label}
      </span>
      <span className={valueClassName} style={{ color: valueColor }} aria-label={ariaLabel}>
        {value}
      </span>
    </div>
  )
}
