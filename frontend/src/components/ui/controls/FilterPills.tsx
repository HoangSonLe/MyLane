import type { ReactNode } from 'react'

export interface FilterPillItem<T extends string | number> {
  id: T
  label: ReactNode
}

export function FilterPills<T extends string | number>({
  items,
  value,
  onChange,
  ariaLabel,
  className = '',
}: {
  items: FilterPillItem<T>[]
  value: T
  onChange: (val: T) => void
  ariaLabel?: string
  className?: string
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={['flex items-center gap-1.5 overflow-x-auto px-4', className]
        .filter(Boolean)
        .join(' ')}
      style={{ scrollbarWidth: 'none' }}
    >
      {items.map((item) => {
        const isActive = value === item.id
        return (
          <button
            key={String(item.id)}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(item.id)}
            className={[
              'shrink-0 rounded-[var(--radius-lg)] px-2.5 py-1 text-[11px] font-semibold',
              'transition-colors duration-[var(--ma-duration-micro)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
            ].join(' ')}
            style={
              isActive
                ? {
                    background: 'var(--ma-surface-raised)',
                    color: 'var(--ma-fg)',
                    border: '1px solid var(--ma-border-strong)',
                  }
                : {
                    background: 'transparent',
                    color: 'var(--ma-fg-subtle)',
                    border: '1px solid transparent',
                  }
            }
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
