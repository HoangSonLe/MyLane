import type { DifficultyMeta } from '@/services/game-select/game-select.interface'

export function DifficultyChip({
  difficulty,
  selected,
  skeleton,
  onSelect,
}: {
  difficulty: DifficultyMeta
  selected: boolean
  skeleton?: boolean
  onSelect?: () => void
}) {
  if (skeleton) {
    return (
      <div
        className="skeleton flex-1"
        style={{ height: '2rem', borderRadius: 'var(--radius-xl)' }}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={difficulty.label}
      className={[
        'flex flex-1 items-center justify-center px-2 py-2',
        'text-[11px] font-semibold',
        'transition-all duration-[var(--ma-duration-micro)] active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
      ].join(' ')}
      style={{
        borderRadius: 'var(--radius-xl)',
        background: selected ? 'var(--ma-brand)' : 'var(--ma-surface-raised)',
        border: `1px solid ${selected ? 'var(--ma-brand)' : 'var(--ma-border)'}`,
        color: selected ? 'var(--ma-brand-fg)' : 'var(--ma-fg-muted)',
      }}
    >
      {difficulty.label}
    </button>
  )
}
