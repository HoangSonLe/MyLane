import type { Phase } from './board.types'

export function GridBoard({
  level,
  litTiles,
  tappedTiles,
  onTap,
  phase,
}: {
  level: number
  litTiles: number[]
  tappedTiles: number[]
  onTap: (i: number) => void
  phase: Phase
}) {
  const cols  = Math.min(3 + Math.floor(level / 4), 5)
  const total = cols * cols
  const isAnswering = phase === 'answering'

  return (
    <div
      className="grid gap-2 w-full"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      role="group"
      aria-label="Grid memory board"
    >
      {Array.from({ length: total }).map((_, i) => {
        const isLit    = litTiles.includes(i)
        const isTapped = tappedTiles.includes(i)
        const tapIdx   = tappedTiles.indexOf(i)

        let bg     = 'var(--ma-surface-raised)'
        let border = '1px solid var(--ma-border)'
        let textColor = 'var(--ma-fg-subtle)'

        if (isLit && phase === 'viewing') {
          bg = 'var(--ma-active-soft)'
          border = '2px solid var(--ma-active)'
          textColor = 'var(--ma-active)'
        } else if (isTapped) {
          bg = 'oklch(0.76 0.14 74 / 0.12)'
          border = '2px solid var(--ma-brand)'
          textColor = 'var(--ma-brand)'
        } else if (phase === 'correct' && isLit) {
          bg = 'oklch(0.70 0.15 145 / 0.12)'
          border = '2px solid var(--ma-success)'
          textColor = 'var(--ma-success)'
        }

        return (
          <button
            key={i}
            type="button"
            disabled={!isAnswering || isTapped}
            onClick={() => isAnswering && !isTapped && onTap(i)}
            aria-label={`Tile ${i + 1}${isTapped ? `, tapped ${tapIdx + 1}` : ''}`}
            className={[
              'aspect-square flex items-center justify-center rounded-xl text-[13px] font-bold',
              'transition-all duration-[var(--ma-duration-base)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
              isAnswering && !isTapped ? 'active:scale-[0.92] cursor-pointer' : 'cursor-default',
            ].join(' ')}
            style={{ background: bg, border, color: textColor, borderRadius: 'var(--radius-xl)' }}
          >
            {isTapped ? tapIdx + 1 : i + 1}
          </button>
        )
      })}
    </div>
  )
}
