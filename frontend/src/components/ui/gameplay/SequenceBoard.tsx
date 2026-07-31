import type { Phase } from './board.types'

const SEQ_COLORS = ['amber', 'teal', 'rose', 'violet'] as const
type SeqColor = typeof SEQ_COLORS[number]

const SEQ_BASE: Record<SeqColor, string> = {
  amber:  'oklch(0.78 0.16 75)',
  teal:   'oklch(0.72 0.16 175)',
  rose:   'oklch(0.72 0.18 10)',
  violet: 'oklch(0.70 0.18 280)',
}
const SEQ_DIM: Record<SeqColor, string> = {
  amber:  'oklch(0.78 0.16 75 / 0.14)',
  teal:   'oklch(0.72 0.16 175 / 0.14)',
  rose:   'oklch(0.72 0.18 10 / 0.14)',
  violet: 'oklch(0.70 0.18 280 / 0.14)',
}
const SEQ_GLOW: Record<SeqColor, string> = {
  amber:  '0 0 28px oklch(0.78 0.16 75 / 0.5)',
  teal:   '0 0 28px oklch(0.72 0.16 175 / 0.5)',
  rose:   '0 0 28px oklch(0.72 0.18 10 / 0.5)',
  violet: '0 0 28px oklch(0.70 0.18 280 / 0.5)',
}

const SEQ_TILES: { id: number; color: SeqColor }[] = [
  { id: 0, color: 'amber' },
  { id: 1, color: 'teal' },
  { id: 2, color: 'rose' },
  { id: 3, color: 'violet' },
]

export function SequenceBoard({
  litTile,
  pressedTile,
  onTap,
  phase,
}: {
  litTile: number | null
  pressedTile: number | null
  onTap: (id: number) => void
  phase: Phase
}) {
  const isAnswering = phase === 'answering'
  return (
    <div
      className="grid grid-cols-2 gap-4 w-full"
      role="group"
      aria-label="Sequence memory board"
    >
      {SEQ_TILES.map((tile) => {
        const isLit     = litTile === tile.id
        const isPressed = pressedTile === tile.id
        const lit = isLit || isPressed
        return (
          <button
            key={tile.id}
            type="button"
            disabled={!isAnswering}
            onClick={() => isAnswering && onTap(tile.id)}
            aria-label={`${tile.color} tile`}
            className={[
              'aspect-square w-full rounded-2xl',
              'transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-4',
              isAnswering ? 'cursor-pointer active:scale-[0.93]' : 'cursor-default',
            ].join(' ')}
            style={{
              background: lit ? SEQ_BASE[tile.color] : SEQ_DIM[tile.color],
              border: `2px solid ${lit ? SEQ_BASE[tile.color] : 'transparent'}`,
              boxShadow: lit ? SEQ_GLOW[tile.color] : '0 2px 8px oklch(0 0 0 / 0.3)',
              transform: isLit && !isAnswering ? 'scale(1.04)' : undefined,
              borderRadius: 'var(--radius-2xl)',
            }}
          />
        )
      })}
    </div>
  )
}
