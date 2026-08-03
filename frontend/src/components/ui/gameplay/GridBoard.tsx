import type { Phase } from './board.types'
import { hapticFeedback } from '@/lib/utils/haptics'
import { soundEffects } from '@/lib/utils/audio'

export function GridBoard({
  xAxis,
  yAxis,
  litTiles,
  tappedTiles,
  wrongTile,
  onTap,
  phase,
}: {
  /** Grid columns — docs/gameplay/grid-memory.md "x_Axis × y_Axis" (not always square). */
  xAxis: number
  /** Grid rows. */
  yAxis: number
  /**
   * Cell indices carrying numbers 1..beginCount, IN THAT ORDER — litTiles[0]
   * is the cell labeled "1", litTiles[1] is "2", etc. (docs: "some cells
   * contain numbers 1 through beginCount; the rest are empty"). Every other
   * cell renders blank, not its own grid position.
   */
  litTiles: number[]
  tappedTiles: number[]
  /** Tile just tapped incorrectly — flashes an error effect, doesn't block further taps. */
  wrongTile?: number | null
  onTap: (i: number) => void
  phase: Phase
}) {
  const total = xAxis * yAxis
  const isAnswering = phase === 'answering'

  return (
    <div
      className="grid gap-2 w-full"
      style={{ gridTemplateColumns: `repeat(${xAxis}, 1fr)` }}
      role="group"
      aria-label="Grid memory board"
    >
      {Array.from({ length: total }).map((_, i) => {
        const litOrder = litTiles.indexOf(i)
        const isLit    = litOrder !== -1
        const isTapped = tappedTiles.includes(i)
        const isWrong  = wrongTile === i
        const tapIdx   = tappedTiles.indexOf(i)
        const showAssignedNumber = isLit && (phase === 'viewing' || phase === 'correct')

        let bg     = 'var(--ma-surface-raised)'
        let border = '1px solid var(--ma-border)'
        let textColor = 'var(--ma-fg-subtle)'

        if (isWrong) {
          bg = 'oklch(0.62 0.19 22 / 0.18)'
          border = '2px solid var(--ma-danger)'
          textColor = 'var(--ma-danger)'
        } else if (isLit && phase === 'viewing') {
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
            onClick={() => {
              if (isAnswering && !isTapped) {
                hapticFeedback.light()
                soundEffects.tap()
                onTap(i)
              }
            }}
            aria-label={`Tile${isTapped ? `, tapped ${tapIdx + 1}` : showAssignedNumber ? ` ${litOrder + 1}` : ''}`}
            className={[
              'aspect-square flex items-center justify-center rounded-xl text-[13px] font-bold',
              'transition-all duration-[var(--ma-duration-base)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
              isAnswering && !isTapped ? 'active:scale-[0.92] cursor-pointer' : 'cursor-default',
            ].join(' ')}
            style={{ background: bg, border, color: textColor, borderRadius: 'var(--radius-xl)' }}
          >
            {isTapped ? tapIdx + 1 : showAssignedNumber ? litOrder + 1 : ''}
          </button>
        )
      })}
    </div>
  )
}
