import type { GamePhase } from '@/services/game/game-screen.types'

export function PhaseLabel({ phase, inputLeft, inputTotal }: {
  phase: GamePhase
  inputLeft: number
  inputTotal: number
}) {
  const label = {
    idle:     { text: 'Get ready…',       sub: 'Watch the sequence' },
    watching: { text: 'Watch carefully',  sub: 'Remember the order' },
    input:    { text: 'Your turn',        sub: `${inputLeft} of ${inputTotal} taps left` },
    success:  { text: 'Correct!',         sub: 'Great memory!' },
    fail:     { text: 'Not quite',        sub: 'Try again' },
  }[phase]

  const accent = phase === 'success'
    ? 'text-[var(--ma-success)]'
    : phase === 'fail'
    ? 'text-[var(--ma-danger)]'
    : phase === 'input'
    ? 'text-[var(--ma-brand)]'
    : 'text-[var(--ma-fg)]'

  return (
    <div className="text-center" aria-live="polite" aria-atomic="true">
      <p className={`text-[22px] font-bold leading-tight ${accent}`}>{label.text}</p>
      <p className="mt-0.5 text-[13px] text-[var(--ma-fg-muted)]">{label.sub}</p>
    </div>
  )
}
