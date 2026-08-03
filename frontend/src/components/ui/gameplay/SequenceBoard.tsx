import type { Phase } from './board.types'
import { hapticFeedback } from '@/lib/utils/haptics'
import { soundEffects } from '@/lib/utils/audio'

/**
 * docs/gameplay/sequence-memory.md: "3×3 grid of blank, identical tiles (no
 * numbers or labels)". Previously this was 4 tiles, each a distinct color —
 * a different game (remembering which of 4 colors) than the documented one
 * (remembering positions among 9 visually-identical tiles).
 */
const TILE_COUNT = 9

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
      className="grid grid-cols-3 gap-3 w-full max-w-xs"
      role="group"
      aria-label="Sequence memory board"
    >
      {Array.from({ length: TILE_COUNT }, (_, id) => {
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
            aria-label={`Tile ${id + 1}`}
            className={[
              'aspect-square w-full rounded-2xl',
              'transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-4',
              isAnswering ? 'cursor-pointer active:scale-[0.93]' : 'cursor-default',
            ].join(' ')}
            style={{
              background: active ? 'var(--ma-brand)' : 'var(--ma-surface-raised)',
              border: `2px solid ${active ? 'var(--ma-brand)' : 'var(--ma-border)'}`,
              boxShadow: active ? '0 0 24px oklch(0.78 0.16 75 / 0.5)' : '0 2px 8px oklch(0 0 0 / 0.25)',
              borderRadius: 'var(--radius-2xl)',
            }}
          />
        )
      })}
    </div>
  )
}
