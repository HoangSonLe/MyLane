import { IconChevronRight14 as IconChevronRight } from '@/components/ui/icons'
import { CardButton } from '@/components/ui/card'

import type { EntryPoint } from '@/services/result/result.interface'

function IconHome() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 12L12 3l9 9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SecondaryActions({
  entryPoint,
  onHome,
  onViewDetail,
}: {
  entryPoint: EntryPoint
  onHome?: () => void
  onViewDetail?: () => void
}) {
  const homeLabel = entryPoint === 'lobby' ? 'Back to Lobby' : 'Back to Home'

  return (
    <div className="mx-4 flex gap-3">
      {/* Home / Lobby */}
      <CardButton
        onClick={onHome}
        className={[
          'flex flex-1 h-12 items-center justify-center gap-2',
          'text-[14px] font-semibold',
          'transition-transform duration-[var(--ma-duration-micro)] active:scale-95',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
        ].join(' ')}
        style={{ color: 'var(--ma-fg-muted)' }}
        aria-label={homeLabel}
      >
        <IconHome />
        {homeLabel}
      </CardButton>

      {/* View Detail */}
      <CardButton
        onClick={onViewDetail}
        className={[
          'flex h-12 items-center justify-center gap-1.5 px-4',
          'text-[13px] font-semibold',
          'transition-transform duration-[var(--ma-duration-micro)] active:scale-95',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
        ].join(' ')}
        style={{ color: 'var(--ma-fg-muted)' }}
        aria-label="View match detail"
      >
        Detail
        <IconChevronRight />
      </CardButton>
    </div>
  )
}
