import { IconSwords } from '@/components/ui/icons'

import { IconLock } from './icons'
import type { ModeMeta } from '@/services/game-select/game-select.interface'

export function ModeChip({
  mode,
  selected,
  isGuest,
  skeleton,
  onSelect,
}: {
  mode: ModeMeta
  selected: boolean
  isGuest: boolean
  skeleton?: boolean
  onSelect?: () => void
}) {
  const locked = isGuest && mode.requiresAccount

  if (skeleton) {
    return (
      <div
        className="skeleton flex-1"
        style={{ height: '2.25rem', borderRadius: 'var(--radius-xl)' }}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => !locked && onSelect?.()}
      disabled={locked}
      aria-pressed={selected}
      aria-label={locked ? `${mode.label} — requires account` : mode.label}
      title={locked ? 'Sign in to unlock' : undefined}
      className={[
        'flex flex-1 flex-col items-center justify-center gap-0.5 px-2 py-2.5 text-center',
        'transition-all duration-[var(--ma-duration-micro)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
        locked
          ? 'cursor-not-allowed opacity-40'
          : 'active:scale-95',
      ].join(' ')}
      style={{
        borderRadius: 'var(--radius-xl)',
        background: selected ? 'var(--ma-active)' : 'var(--ma-surface-raised)',
        border: `1px solid ${selected ? 'var(--ma-active)' : 'var(--ma-border)'}`,
      }}
    >
      {locked && (
        <span style={{ color: selected ? '#fff' : 'var(--ma-fg-subtle)' }}>
          <IconLock />
        </span>
      )}
      {mode.versusFlow && !locked && (
        <span style={{ color: selected ? '#fff' : 'var(--ma-fg-subtle)' }}>
          <IconSwords />
        </span>
      )}
      <span
        className="text-[11px] font-semibold leading-snug"
        style={{ color: selected ? '#fff' : locked ? 'var(--ma-fg-muted)' : 'var(--ma-fg-muted)' }}
      >
        {mode.label}
      </span>
    </button>
  )
}
