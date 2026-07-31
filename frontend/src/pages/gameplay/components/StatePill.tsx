import { ScreenState } from '@/configs/enum'

export { ScreenState }

/** Prototype state switcher — dev-only tooling, not product UI. */
export function StatePill({ current, onChange, states }: { current: ScreenState; onChange: (s: ScreenState) => void; states?: ScreenState[] }) {
  const pills: ScreenState[] = states ?? [ScreenState.NORMAL, ScreenState.LOADING, ScreenState.ERROR, ScreenState.OFFLINE]
  return (
    <div className="fixed left-1/2 top-3 z-50 -translate-x-1/2" aria-label="State switcher — prototype only">
      <div className="flex gap-1 rounded-2xl p-1" style={{ background: 'var(--ma-surface)', boxShadow: 'var(--ma-shadow-md)' }}>
        {pills.map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={[
              'rounded-xl px-2.5 py-1 text-[11px] font-semibold transition-all',
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
