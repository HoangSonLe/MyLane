import { IconDelete } from './icons'
import type { Phase } from './board.types'

const QWERTY_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M'],
]

/**
 * Shared by solo `GameplayScreen` and `VersusGameplayScreen` — logic is
 * identical, but Versus uses a smaller display box / tighter letter-spacing
 * to leave room for its extra header/prompt chrome. `size="compact"`
 * recreates Versus's exact original values; the default recreates solo's.
 */
const SIZES = {
  default: { containerClassName: 'flex flex-col gap-3', minHeight: '60px', letterSpacing: '0.25em' },
  compact: { containerClassName: 'flex w-full flex-col gap-3', minHeight: '56px', letterSpacing: '0.22em' },
} as const

export function AlphabetBoard({
  viewingValue,
  answer,
  onKey,
  onDelete,
  phase,
  size = 'default',
}: {
  viewingValue: string
  answer: string
  onKey: (k: string) => void
  onDelete: () => void
  phase: Phase
  size?: keyof typeof SIZES
}) {
  const isViewing   = phase === 'viewing'
  const isAnswering = phase === 'answering'
  const isCorrect   = phase === 'correct'
  const isWrong     = phase === 'wrong'
  const { containerClassName, minHeight, letterSpacing } = SIZES[size]

  const displayBorder = isCorrect ? '2px solid var(--ma-success)' : isWrong ? '2px solid var(--ma-danger)' : '1px solid var(--ma-border)'
  const displayBg     = isCorrect ? 'oklch(0.70 0.15 145 / 0.08)' : isWrong ? 'oklch(0.62 0.19 22 / 0.08)' : 'var(--ma-surface)'

  return (
    <div className={containerClassName}>
      <div
        className="flex items-center justify-center rounded-2xl px-4"
        style={{ minHeight, background: displayBg, border: displayBorder, boxShadow: 'var(--ma-shadow-sm)' }}
        aria-live="polite"
        aria-label={isViewing ? `Letters: ${viewingValue}` : `Your answer: ${answer || 'empty'}`}
      >
        <span
          className="text-[28px] font-bold"
          style={{
            letterSpacing,
            color: isViewing
              ? 'var(--ma-progress)'
              : isCorrect ? 'var(--ma-success)' : isWrong ? 'var(--ma-danger)' : answer ? 'var(--ma-fg)' : 'var(--ma-fg-subtle)',
          }}
        >
          {isViewing ? viewingValue : (answer || (isAnswering ? '—' : ''))}
        </span>
      </div>

      {/* QWERTY keyboard */}
      <div className="flex flex-col items-center gap-1.5" role="group" aria-label="Alphabet keyboard">
        {QWERTY_ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-1">
            {row.map((k) => (
              <button
                key={k}
                type="button"
                disabled={!isAnswering}
                onClick={() => onKey(k)}
                aria-label={k}
                className={[
                  'flex h-11 w-9 items-center justify-center rounded-lg text-[13px] font-semibold',
                  'transition-all duration-[var(--ma-duration-micro)] active:scale-[0.90]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
                  !isAnswering ? 'opacity-40 cursor-default' : 'cursor-pointer',
                ].join(' ')}
                style={{
                  background: 'var(--ma-surface-raised)',
                  border: '1px solid var(--ma-border)',
                  color: 'var(--ma-fg)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                {k}
              </button>
            ))}
            {ri === 2 && (
              <button
                type="button"
                disabled={!isAnswering}
                onClick={onDelete}
                aria-label="Delete"
                className={[
                  'flex h-11 w-12 items-center justify-center rounded-lg',
                  'transition-all duration-[var(--ma-duration-micro)] active:scale-[0.90]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
                  !isAnswering ? 'opacity-40 cursor-default' : 'cursor-pointer text-[var(--ma-fg-muted)]',
                ].join(' ')}
                style={{
                  background: 'var(--ma-surface-raised)',
                  border: '1px solid var(--ma-border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <IconDelete />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
