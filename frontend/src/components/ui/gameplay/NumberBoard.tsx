import { IconDelete } from './icons'
import { KeypadButton } from './KeypadButton'
import type { Phase } from './board.types'

/**
 * Shared by solo `GameplayScreen` and `VersusGameplayScreen` — logic is
 * identical, but Versus uses smaller display-box/font/letter-spacing to
 * leave room for its extra header/prompt chrome. `size="compact"` recreates
 * Versus's exact original values; the default recreates solo's.
 */
const SIZES = {
  default: { containerClassName: 'flex w-full flex-col gap-4', minHeight: '72px', fontSize: '36px', letterSpacing: '0.2em' },
  compact: { containerClassName: 'flex w-full flex-col gap-4', minHeight: '64px', fontSize: '34px', letterSpacing: '0.18em' },
} as const

export function NumberBoard({
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
  const { containerClassName, minHeight, fontSize, letterSpacing } = SIZES[size]

  const displayBorder = isCorrect
    ? '2px solid var(--ma-success)'
    : isWrong
    ? '2px solid var(--ma-danger)'
    : '1px solid var(--ma-border)'

  const displayBg = isCorrect
    ? 'oklch(0.70 0.15 145 / 0.08)'
    : isWrong
    ? 'oklch(0.62 0.19 22 / 0.08)'
    : 'var(--ma-surface)'

  return (
    <div className={containerClassName}>
      <div
        className="flex items-center justify-center rounded-2xl px-4"
        style={{ minHeight, background: displayBg, border: displayBorder, boxShadow: 'var(--ma-shadow-sm)' }}
        aria-live="polite"
        aria-label={isViewing ? `Number: ${viewingValue}` : `Your answer: ${answer || 'empty'}`}
      >
        <span
          className="font-bold tabular-nums tracking-widest"
          style={{
            fontSize,
            letterSpacing,
            color: isViewing ? 'var(--ma-progress)'
              : isCorrect ? 'var(--ma-success)' : isWrong ? 'var(--ma-danger)'
              : answer ? 'var(--ma-fg)' : 'var(--ma-fg-subtle)',
          }}
        >
          {isViewing ? viewingValue : (answer || (isAnswering ? '—' : ''))}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Number keypad">
        {['1','2','3','4','5','6','7','8','9'].map((k) => (
          <KeypadButton key={k} label={k} disabled={!isAnswering} onPress={() => onKey(k)} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div />
        <KeypadButton label="⌫" disabled={!isAnswering} onPress={onDelete} isAction ariaLabel="Delete" icon={<IconDelete />} />
        <div />
      </div>
    </div>
  )
}
