import { GameId } from '@/configs/enum'

/** Prototype game-type switcher — dev-only tooling, not product UI. */
export function GameTypePill({ current, onChange }: { current: GameId; onChange: (g: GameId) => void }) {
  const types: GameId[] = [GameId.NUMBER, GameId.ALPHABET, GameId.GRID, GameId.SEQUENCE]
  return (
    <div className="fixed bottom-3 left-1/2 z-50 -translate-x-1/2" aria-label="Game type switcher — prototype only">
      <div className="flex gap-1 rounded-2xl p-1" style={{ background: 'var(--ma-surface)', boxShadow: 'var(--ma-shadow-md)' }}>
        {types.map((g) => (
          <button
            key={g}
            onClick={() => onChange(g)}
            className={[
              'rounded-xl px-2.5 py-1 text-[11px] font-semibold transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
              current === g
                ? 'bg-[var(--ma-active)] text-white'
                : 'text-[var(--ma-fg-muted)] hover:text-[var(--ma-fg)]',
            ].join(' ')}
          >
            {g}
          </button>
        ))}
      </div>
    </div>
  )
}
