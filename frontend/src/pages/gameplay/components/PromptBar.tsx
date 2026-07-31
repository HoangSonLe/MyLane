import { Card } from '@/components/ui/card'
import { IconPlay, IconRefresh } from './icons'
import { Phase, GameId, ModeId } from '@/configs/enum'

function IconSpinner() {
  return (
    <svg className="animate-spin" width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function PromptBar({
  phase,
  onStart,
  gameType,
  mode,
  onGameOver,
}: {
  phase: Phase
  onStart: () => void
  gameType: GameId
  mode: ModeId
  onGameOver?: () => void
}) {
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
      <Card
        className="flex w-full items-center justify-center gap-3 py-4 text-[15px] font-semibold"
        style={{ color: 'var(--ma-fg-muted)' }}
        aria-live="polite"
      >
        <IconSpinner />
        <span>Memorise the pattern…</span>
      </Card>
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
      >
        Correct — next round loading…
      </div>
    )
  }
  if (phase === Phase.WRONG) {
    // Ranked runs end on the first mistake — score is final, go to Result.
    // Practice has "no pressure" (docs/gameplay/README.md) — retry the level instead.
    if (mode === ModeId.SOLO_RANKED && onGameOver) {
      return (
        <button
          type="button"
          onClick={onGameOver}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
          style={{ background: 'var(--ma-brand)', color: 'var(--ma-brand-fg)', boxShadow: 'var(--ma-shadow-md)' }}
        >
          See result
        </button>
      )
    }
    return (
      <button
        type="button"
        onClick={onStart}
        className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
        style={{ background: 'var(--ma-brand)', color: 'var(--ma-brand-fg)', boxShadow: 'var(--ma-shadow-md)' }}
      >
        <IconRefresh />
        Try again
      </button>
    )
  }
  return null
}
