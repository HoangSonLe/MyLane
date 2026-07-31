import { Phase, GameId } from '@/configs/enum'
import { IconPlay, IconSpinner } from './icons'

export function PromptBar({
  phase, onStart, gameType,
}: { phase: Phase; onStart: () => void; gameType: GameId }) {
  if (phase === Phase.IDLE) {
    return (
      <button
        type="button"
        onClick={onStart}
        className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
        style={{ background: 'var(--ma-brand)', color: 'var(--ma-brand-fg)', boxShadow: 'var(--ma-shadow-md)' }}
      >
        <IconPlay />
        Start round
      </button>
    )
  }
  if (phase === Phase.VIEWING) {
    return (
      <div
        className="flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-[15px] font-semibold"
        style={{ background: 'var(--ma-surface)', border: '1px solid var(--ma-border)', color: 'var(--ma-fg-muted)' }}
        aria-live="polite"
      >
        <IconSpinner />
        <span>Memorise the pattern…</span>
      </div>
    )
  }
  if (phase === Phase.ANSWERING) {
    const hint: Record<GameId, string> = {
      [GameId.NUMBER]:   'Type the number sequence',
      [GameId.ALPHABET]: 'Type the letter sequence',
      [GameId.GRID]:     'Tap tiles in ascending order',
      [GameId.SEQUENCE]: 'Tap tiles in the order they flashed',
    }
    return (
      <div
        className="flex w-full items-center justify-center rounded-2xl py-4 text-[15px] font-semibold"
        style={{
          background: 'oklch(0.76 0.14 74 / 0.10)',
          border: '1px solid oklch(0.76 0.14 74 / 0.25)',
          color: 'var(--ma-brand)',
        }}
        aria-live="polite"
      >
        {hint[gameType]}
      </div>
    )
  }
  if (phase === Phase.CORRECT) {
    return (
      <div
        className="flex w-full items-center justify-center rounded-2xl py-4 text-[15px] font-semibold"
        style={{ background: 'oklch(0.70 0.15 145 / 0.12)', border: '1px solid oklch(0.70 0.15 145 / 0.25)', color: 'var(--ma-success)' }}
        aria-live="polite"
      >
        Point scored — waiting for opponent…
      </div>
    )
  }
  if (phase === Phase.WRONG) {
    return (
      <div
        className="flex w-full items-center justify-center rounded-2xl py-4 text-[15px] font-semibold"
        style={{ background: 'oklch(0.62 0.19 22 / 0.10)', border: '1px solid oklch(0.62 0.19 22 / 0.25)', color: 'var(--ma-danger)' }}
        aria-live="polite"
      >
        Wrong — opponent still answering…
      </div>
    )
  }
  return null
}
