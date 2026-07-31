import type { ReactNode } from 'react'

export interface ShortcutItem {
  id: string
  label: string
  icon: ReactNode
  disabled?: boolean
  disabledHint?: string
}

/**
 * ShortcutGrid — the icon-tile-then-external-label grid repeated in Home's
 * and Lobby's NavShortcuts (4 and 3 columns). Column count varies per call
 * site, so `columns` sets `gridTemplateColumns` via inline style rather
 * than a Tailwind `grid-cols-N` class — Tailwind's JIT can't see a
 * dynamically built class name.
 */
export function ShortcutGrid({
  items,
  columns,
  onSelect,
  skeleton,
  skeletonLabelWidth = '3rem',
  className = 'px-4',
}: {
  items: ShortcutItem[]
  columns: number
  onSelect?: (id: string) => void
  skeleton?: boolean
  skeletonLabelWidth?: string
  className?: string
}) {
  const gridStyle = { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }

  if (skeleton) {
    return (
      <div className={['grid gap-2', className].filter(Boolean).join(' ')} style={gridStyle}>
        {items.map((item) => (
          <div key={item.id} className="flex flex-col items-center gap-2">
            <div
              className="skeleton"
              style={{ height: '3.5rem', width: '100%', borderRadius: 'var(--radius-xl)' }}
            />
            <div
              className="skeleton"
              style={{ height: '0.75rem', width: skeletonLabelWidth, borderRadius: 'var(--radius-sm)' }}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={['grid gap-2', className].filter(Boolean).join(' ')} style={gridStyle}>
      {items.map((item) => (
        <div key={item.id} className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={() => !item.disabled && onSelect?.(item.id)}
            disabled={item.disabled}
            title={item.disabledHint}
            aria-label={item.disabledHint ? `${item.label} — ${item.disabledHint}` : item.label}
            className={[
              'flex w-full items-center justify-center',
              'transition-transform duration-[var(--ma-duration-micro)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
              item.disabled ? 'cursor-not-allowed opacity-40' : 'active:scale-95',
            ].join(' ')}
            style={{
              height: '3.5rem',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--ma-surface-raised)',
              border: '1px solid var(--ma-border)',
              color: 'var(--ma-fg-muted)',
            }}
          >
            {item.icon}
          </button>
          <span className="text-[11px] font-medium" style={{ color: 'var(--ma-fg-muted)' }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}
