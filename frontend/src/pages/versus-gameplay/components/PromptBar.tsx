import { Phase, GameId } from '@/configs/enum'
import { IconSpinner } from './icons'
import { useTranslation } from '@/i18n/useTranslation'

export function PromptBar({
  phase, gameType,
}: { phase: Phase; gameType: GameId }) {
  const { t } = useTranslation()
  if (phase === Phase.IDLE) {
    return (
      <div
        className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-semibold"
        style={{ background: 'var(--ma-surface)', border: '1px solid var(--ma-border)', color: 'var(--ma-fg-muted)' }}
        aria-live="polite"
      >
        <IconSpinner />
        {t.versusGameplay.roundBanner.idleLabel}
      </div>
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
        <span>{t.promptBar.memorise}</span>
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
        aria-live="polite"
      >
        {t.versusGameplay.correctWaitingOpponent}
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
        {t.versusGameplay.wrongOpponentAnswering}
      </div>
    )
  }
  return null
}
