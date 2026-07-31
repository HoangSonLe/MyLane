import { IconPlay, IconSwords } from '@/components/ui/icons'

import type { ModeMeta } from '@/services/game-select/game-select.interface'

export function StartButton({
  skeleton,
  selectedMode,
  disabled,
  onClick,
}: {
  skeleton?: boolean
  selectedMode: ModeMeta | null
  disabled?: boolean
  onClick?: () => void
}) {
  if (skeleton) {
    return (
      <div
        className="skeleton mx-4"
        style={{ height: '3.5rem', borderRadius: 'var(--radius-2xl)' }}
      />
    )
  }

  const isVersus = selectedMode?.versusFlow

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'mx-4 flex h-14 w-[calc(100%-2rem)] items-center justify-center gap-2.5',
        'text-[15px] font-semibold',
        'transition-transform duration-[var(--ma-duration-micro)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
        disabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-[0.97]',
      ].join(' ')}
      style={{
        borderRadius: 'var(--radius-2xl)',
        background: 'var(--ma-brand)',
        color: 'var(--ma-brand-fg)',
        boxShadow: disabled ? 'none' : '0 4px 24px oklch(0.78 0.16 75 / 0.28)',
      }}
      aria-label={
        isVersus
          ? `Find a match — ${selectedMode?.label}`
          : `Start ${selectedMode?.label ?? ''}`
      }
    >
      {isVersus ? (
        <span style={{ color: 'var(--ma-brand-fg)' }}>
          <IconSwords />
        </span>
      ) : (
        <span style={{ color: 'var(--ma-brand-fg)' }}>
          <IconPlay />
        </span>
      )}
      {isVersus ? 'Find Match' : 'Start'}
    </button>
  )
}
