import { useEffect, useRef } from 'react'

import type { BoardType } from '@/services/leaderboard/leaderboard.interface'
import { BOARD_TABS } from '@/services/leaderboard/leaderboard.mock'

export function BoardTabs({
  active,
  onChange,
  skeleton,
}: {
  active: BoardType
  onChange: (b: BoardType) => void
  skeleton?: boolean
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Keep active tab scrolled into view
  useEffect(() => {
    if (!scrollRef.current) return
    const activeEl = scrollRef.current.querySelector('[data-active="true"]') as HTMLElement | null
    activeEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [active])

  if (skeleton) {
    return (
      <div className="flex gap-2 overflow-hidden px-4">
        {BOARD_TABS.map((t) => (
          <div
            key={t.id}
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
      aria-label="Board type"
      className="flex gap-2 overflow-x-auto px-4"
      style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
    >
      {BOARD_TABS.map((tab) => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            data-active={isActive}
            onClick={() => onChange(tab.id)}
            className={[
              'shrink-0 rounded-[var(--radius-xl)] px-3.5 py-1.5',
              'text-[12px] font-semibold whitespace-nowrap',
              'transition-colors duration-[var(--ma-duration-micro)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
            ].join(' ')}
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
            {tab.short}
          </button>
        )
      })}
    </div>
  )
}
