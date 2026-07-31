import { ScreenState } from '@/configs/enum'

/**
 * Prototype state switcher for ResultScreen — dev-only tooling. Kept local
 * (not the shared `components/ui/StatePill`): has an extra "versus" toggle
 * button alongside the state list — a genuine variant, not a duplicate.
 */
export function StatePill({
  current,
  onChange,
  showVersus,
  onToggleVersus,
}: {
  current: ScreenState
  onChange: (s: ScreenState) => void
  showVersus: boolean
  onToggleVersus: () => void
}) {
  const states: ScreenState[] = [ScreenState.NORMAL, ScreenState.LOADING, ScreenState.ERROR, ScreenState.GUEST]
  return (
    <div
      aria-label="State switcher — prototype only"
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 flex flex-col items-center gap-2"
    >
      <div
        className="flex gap-1 rounded-2xl p-1"
        style={{
          background: 'var(--ma-surface)',
          boxShadow: 'var(--ma-shadow-md)',
          border: '1px solid var(--ma-border)',
        }}
      >
        {states.map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={[
              'rounded-xl px-2.5 py-1 text-[11px] font-semibold',
              'transition-colors duration-[var(--ma-duration-micro)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
              current === s
                ? 'bg-[var(--ma-brand)] text-[var(--ma-brand-fg)]'
                : 'text-[var(--ma-fg-subtle)] hover:text-[var(--ma-fg-muted)]',
            ].join(' ')}
          >
            {s}
          </button>
        ))}
        <button
          onClick={onToggleVersus}
          className={[
            'rounded-xl px-2.5 py-1 text-[11px] font-semibold',
            'transition-colors duration-[var(--ma-duration-micro)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
            showVersus
              ? 'bg-[var(--ma-active)] text-white'
              : 'text-[var(--ma-fg-subtle)] hover:text-[var(--ma-fg-muted)]',
          ].join(' ')}
        >
          versus
        </button>
      </div>
    </div>
  )
}
