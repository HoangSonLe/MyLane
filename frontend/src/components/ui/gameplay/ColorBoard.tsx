import type { Phase } from './board.types'
import { hapticFeedback } from '@/lib/utils/haptics'
import { soundEffects } from '@/lib/utils/audio'

/**
 * docs/gameplay/color-memory.md — Simon-style board: colorCount distinct
 * tiles (4-6 depending on level) flash one at a time, player repeats the
 * order. This is the original 4-color board design that used to live in
 * SequenceBoard before that component was corrected to match Sequence
 * Memory's actual "3x3 identical blank tiles" spec — kept alive here as its
 * own game per explicit request.
 */
const TILE_COLORS = [
  { base: 'oklch(0.78 0.16 75)', dim: 'oklch(0.78 0.16 75 / 0.14)', glow: '0 0 28px oklch(0.78 0.16 75 / 0.5)' },   // amber
  { base: 'oklch(0.72 0.16 175)', dim: 'oklch(0.72 0.16 175 / 0.14)', glow: '0 0 28px oklch(0.72 0.16 175 / 0.5)' }, // teal
  { base: 'oklch(0.72 0.18 10)', dim: 'oklch(0.72 0.18 10 / 0.14)', glow: '0 0 28px oklch(0.72 0.18 10 / 0.5)' },   // rose
  { base: 'oklch(0.70 0.18 280)', dim: 'oklch(0.70 0.18 280 / 0.14)', glow: '0 0 28px oklch(0.70 0.18 280 / 0.5)' }, // violet
  { base: 'oklch(0.76 0.19 130)', dim: 'oklch(0.76 0.19 130 / 0.14)', glow: '0 0 28px oklch(0.76 0.19 130 / 0.5)' }, // lime
  { base: 'oklch(0.68 0.15 230)', dim: 'oklch(0.68 0.15 230 / 0.14)', glow: '0 0 28px oklch(0.68 0.15 230 / 0.5)' }, // sky
] as const

export function ColorBoard({
  colorCount,
  litTile,
  pressedTile,
  onTap,
  phase,
}: {
  /** 4-6, per the current level (docs/gameplay/color-memory.md level table). */
  colorCount: number
  litTile: number | null
  pressedTile: number | null
  onTap: (id: number) => void
  phase: Phase
}) {
  const isAnswering = phase === 'answering'
  const cols = Math.ceil(Math.sqrt(colorCount))

  return (
    <div
      className="grid gap-3 w-full max-w-xs"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      role="group"
      aria-label="Color memory board"
    >
      {TILE_COLORS.slice(0, colorCount).map((color, id) => {
        const isLit = litTile === id
        const isPressed = pressedTile === id
        const active = isLit || isPressed
        return (
          <button
            key={id}
            type="button"
            disabled={!isAnswering}
            onClick={() => {
              if (isAnswering) {
                hapticFeedback.light()
                soundEffects.tap()
                onTap(id)
              }
            }}
            aria-label={`Color tile ${id + 1}`}
            className={[
              'aspect-square w-full rounded-2xl',
              'transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-4',
              isAnswering ? 'cursor-pointer active:scale-[0.93]' : 'cursor-default',
            ].join(' ')}
            style={{
              background: active ? color.base : color.dim,
              border: `2px solid ${active ? color.base : 'transparent'}`,
              boxShadow: active ? color.glow : '0 2px 8px oklch(0 0 0 / 0.3)',
              borderRadius: 'var(--radius-2xl)',
            }}
          />
        )
      })}
    </div>
  )
}
