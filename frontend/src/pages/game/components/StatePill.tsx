import { ScreenState } from '@/configs/enum'

export { ScreenState }

/**
 * Prototype state switcher for SequenceMemoryScreen — dev-only tooling.
 * Kept local (not the shared `components/ui/StatePill`): different color
 * tokens, no border on the wrapper, and `transition-all duration-150`
 * instead of `transition-colors duration-[var(--ma-duration-micro)]` — a
 * genuine variant, not a duplicate (same reasoning as Gameplay/Result's
 * local StatePills).
 */
export function StatePill({
  current,
  onChange,
  states,
}: {
  current: ScreenState
  onChange: (s: ScreenState) => void
  states?: ScreenState[]
}) {
  const pills: ScreenState[] = states ?? [ScreenState.NORMAL, ScreenState.LOADING, ScreenState.EMPTY, ScreenState.ERROR, ScreenState.OFFLINE]
  return (
    <div
      aria-label="State switcher — prototype only"
      className="fixed left-1/2 top-3 z-50 -translate-x-1/2"
    >
      <div
        className="flex gap-1 rounded-2xl bg-[var(--ma-surface)] p-1"
        style={{ boxShadow: 'var(--ma-shadow-md)' }}
      >
        {pills.map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={[
              'rounded-xl px-2.5 py-1 text-[11px] font-semibold transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
              current === s
                ? 'bg-[var(--ma-brand)] text-[var(--ma-brand-fg)]'
                : 'text-[var(--ma-fg-muted)] hover:text-[var(--ma-fg)]',
            ].join(' ')}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
