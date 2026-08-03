import { Card } from '@/components/ui/card'
import { IconPlay, IconRefresh, IconSkip } from './icons'
import { Phase, GameId } from '@/configs/enum'
import { useTranslation } from '@/i18n/useTranslation'

// docs/gameplay/*.md give Number/Alphabet/Grid Memory a fixed Viewing phase
// with no early-exit control of their own (only Pause/Resume/Reset are
// documented). "Skip" is a documented Secondary Button pattern
// (docs/design/design-bible/08-component-system.md), so this reuses that
// existing UI pattern to let a player who has already memorised the pattern
// move on early — it doesn't touch scoring, timing formulas, or the
// Viewing→Answering flow itself, just fires that same transition sooner.
const SKIPPABLE_VIEWING_GAMES = new Set<GameId>([GameId.NUMBER, GameId.ALPHABET, GameId.GRID])

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
  isGameOver,
  onGameOver,
  onSkip,
}: {
  phase: Phase
  onStart: () => void
  gameType: GameId
  /** Loss-streak at the current level reached its rounds-to-win threshold (docs/gameplay/*.md "Level System"). */
  isGameOver: boolean
  onGameOver?: () => void
  /** Skip the rest of the Viewing phase for Number/Alphabet/Grid Memory. */
  onSkip?: () => void
}) {
  const { t } = useTranslation()
  if (phase === Phase.IDLE) {
    return (
      <button
        type="button"
        onClick={onStart}
        className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
        style={{ background: 'var(--ma-brand)', color: 'var(--ma-brand-fg)', boxShadow: 'var(--ma-shadow-md)' }}
      >
        <IconPlay />
        {t.promptBar.startRound}
      </button>
    )
  }
  if (phase === Phase.VIEWING) {
    const canSkip = SKIPPABLE_VIEWING_GAMES.has(gameType) && !!onSkip
    return (
      <div className="flex w-full flex-col gap-2">
        <Card
          className="flex w-full items-center justify-center gap-3 py-4 text-[15px] font-semibold"
          style={{ color: 'var(--ma-fg-muted)' }}
          aria-live="polite"
        >
          <IconSpinner />
          <span>{t.promptBar.memorise}</span>
        </Card>
        {canSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[14px] font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
            style={{ background: 'var(--ma-surface)', color: 'var(--ma-fg-muted)', boxShadow: 'var(--ma-shadow-sm)' }}
          >
            <IconSkip />
            {t.promptBar.skip}
          </button>
        )}
      </div>
    )
  }
  if (phase === Phase.ANSWERING) {
    const hint: Record<GameId, string> = {
      [GameId.NUMBER]:   t.promptBar.hintNumber,
      [GameId.ALPHABET]: t.promptBar.hintAlphabet,
      [GameId.GRID]:     t.promptBar.hintGrid,
      [GameId.SEQUENCE]: t.promptBar.hintSequence,
      [GameId.COLOR]:    t.promptBar.hintColor,
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
        {t.promptBar.correctNext}
      </div>
    )
  }
  if (phase === Phase.WRONG) {
    // docs/gameplay/*.md "Level System": losing `roundsToWin` rounds at the
    // current level ends the run (Result); otherwise retry the same level.
    if (isGameOver && onGameOver) {
      return (
        <button
          type="button"
          onClick={onGameOver}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
          style={{ background: 'var(--ma-brand)', color: 'var(--ma-brand-fg)', boxShadow: 'var(--ma-shadow-md)' }}
        >
          {t.promptBar.seeResult}
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
        {t.promptBar.tryAgain}
      </button>
    )
  }
  return null
}
