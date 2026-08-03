import { useEffect, useState } from 'react'

import type { Phase } from '@/components/ui/gameplay'
import { ModalBackdrop } from '@/components/ui/ModalBackdrop'
import { IconRefresh } from './icons'
import { useTranslation } from '@/i18n/useTranslation'

function IconEye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

// Soft "oops" face — squinting eyes + a light frown, in the same
// circle-icon style as the settings Toast's check icon (Toast.tsx), just
// red instead of green. Used for incorrect answers.
function IconOops() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="var(--ma-danger)" />
      <path d="M8 10q1 -1.4 2 0" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14 10q1 -1.4 2 0" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8.5 16q3.5 -2.2 7 0" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

// Clock face, same circle-badge language as IconOops — used for timeout so
// it reads as "ran out of time" rather than "got it wrong" at a glance.
function IconTimeout() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="var(--ma-danger)" />
      <circle cx="12" cy="12" r="5.2" stroke="white" strokeWidth="1.4" />
      <path d="M12 9v3.2l2.2 1.3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconBack() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * Center-screen popup for phase === 'wrong', mounted once at the screen
 * level so it covers every game uniformly (including SequenceBoard/
 * ColorBoard, which have no per-board wrong styling of their own).
 *
 * `onTryAgain` is optional: solo play wires it to retry the round (label
 * flips to "See Result" when `isGameOver`, same rule PromptBar already
 * follows). Versus doesn't pass it — that screen has no manual-retry
 * concept, it auto-advances 'wrong' on its own timer regardless of the
 * opponent — so only the Back button renders there.
 *
 * `onBack` always renders and always means "leave the round/match" (solo:
 * reset + navigate back, same as PauseOverlay's Quit; versus: opens the
 * existing quit-confirm dialog, since quitting mid-match counts as a loss
 * there). Backdrop click / Escape mirror onTryAgain when present, otherwise
 * they just close the popup locally — leaving is never done by accident.
 */
export function WrongToast({
  phase,
  reason = 'incorrect',
  isGameOver = false,
  isPractice = false,
  onTryAgain,
  onRevealAnswer,
  onBack,
}: {
  phase: Phase
  /** Why this round is 'wrong' — same popup/flow either way, just a different line. */
  reason?: 'incorrect' | 'timeout'
  isGameOver?: boolean
  isPractice?: boolean
  onTryAgain?: () => void
  onRevealAnswer?: () => void
  onBack: () => void
}) {
  const { t, locale } = useTranslation()
  const messages: Record<'incorrect' | 'timeout', string[]> = {
    incorrect: t.wrongToast.messagesIncorrect,
    timeout: t.wrongToast.messagesTimeout,
  }

  const isWrong = phase === 'wrong'
  const [dismissed, setDismissed] = useState(false)
  const [message, setMessage] = useState(messages.incorrect[0])

  // New wrong round (or a language switch while visible) → reset local
  // dismissal and re-roll the line.
  useEffect(() => {
    if (isWrong) {
      setDismissed(false)
      const pool = messages[reason]
      setMessage(pool[Math.floor(Math.random() * pool.length)])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWrong, reason, locale])

  const visible = isWrong && !dismissed

  // Backdrop/Escape only ever do the safe, non-destructive thing (continue),
  // never Back — leaving has to be a deliberate tap on its own button.
  function dismiss() {
    setDismissed(true)
    onTryAgain?.()
  }

  useEffect(() => {
    if (!visible) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') dismiss()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  if (!visible) return null

  return (
    <ModalBackdrop show={visible} onClose={dismiss}>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="wrong-pop flex w-full max-w-xs flex-col items-center gap-3 rounded-2xl px-6 py-7 text-center"
        style={{ background: 'var(--ma-surface)', border: '1px solid var(--ma-border)', boxShadow: 'var(--ma-shadow-lg)' }}
      >
        {reason === 'timeout' ? <IconTimeout /> : <IconOops />}
        <p className="text-[15px] font-semibold leading-snug" style={{ color: 'var(--ma-fg)' }}>{message}</p>

        {isPractice && onRevealAnswer && (
          <button
            type="button"
            onClick={() => {
              setDismissed(true)
              onRevealAnswer()
            }}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-semibold transition-all active:scale-[0.98]"
            style={{
              background: 'oklch(0.55 0.12 140 / 0.12)',
              border: '1px solid oklch(0.55 0.12 140 / 0.3)',
              color: 'var(--ma-brand)',
            }}
          >
            <IconEye />
            {t.wrongToast.revealAnswer}
          </button>
        )}

        <div className="mt-1 flex w-full gap-2.5">
          {onTryAgain && (
            <button
              type="button"
              onClick={() => { setDismissed(true); onTryAgain() }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[14px] font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
              style={{ background: 'var(--ma-brand)', color: 'var(--ma-brand-fg)', boxShadow: 'var(--ma-shadow-md)' }}
            >
              {!isGameOver && <IconRefresh />}
              {isGameOver ? t.wrongToast.seeResult : t.wrongToast.tryAgain}
            </button>
          )}

          <button
            type="button"
            onClick={onBack}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[14px] font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
            style={{ background: 'oklch(0.62 0.19 22 / 0.10)', border: '1px solid oklch(0.62 0.19 22 / 0.25)', color: 'var(--ma-danger)' }}
          >
            <IconBack />
            {t.wrongToast.back}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  )
}
