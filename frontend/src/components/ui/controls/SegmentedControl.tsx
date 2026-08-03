import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

export interface SegmentedOption<T extends string | number> {
  id: T
  label: ReactNode
  disabled?: boolean
  ariaLabel?: string
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
  skeleton,
  className = '',
}: {
  options: SegmentedOption<T>[]
  value: T
  onChange: (val: T) => void
  ariaLabel?: string
  skeleton?: boolean
  className?: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scrollRef.current) return
    const activeEl = scrollRef.current.querySelector('[data-active="true"]') as HTMLElement | null
    activeEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [value])

  if (skeleton) {
    return (
      <div className={['flex gap-2 overflow-hidden px-4', className].filter(Boolean).join(' ')}>
        {options.map((opt) => (
          <div
            key={String(opt.id)}
            className="skeleton shrink-0"
            style={{ height: '2rem', width: '5rem', borderRadius: 'var(--radius-xl)' }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      role="tablist"
      aria-label={ariaLabel}
      className={['flex gap-2 overflow-x-auto px-4', className].filter(Boolean).join(' ')}
      style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as CSSProperties}
    >
      {options.map((opt) => {
        const isActive = value === opt.id
        return (
          <button
            key={String(opt.id)}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={opt.ariaLabel}
            data-active={isActive}
            disabled={opt.disabled}
            onClick={() => !opt.disabled && onChange(opt.id)}
            className={[
              'shrink-0 rounded-[var(--radius-xl)] px-3.5 py-1.5',
              'text-[12px] font-semibold whitespace-nowrap',
              'transition-colors duration-[var(--ma-duration-micro)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
              opt.disabled ? 'cursor-not-allowed opacity-40' : 'active:scale-95',
            ]
              .filter(Boolean)
              .join(' ')}
            style={
              isActive
                ? {
                    background: 'var(--ma-active)',
                    color: '#fff',
                  }
                : {
                    background: 'var(--ma-surface-raised)',
                    color: 'var(--ma-fg-muted)',
                    border: '1px solid var(--ma-border)',
                  }
            }
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
