import { IconChevronLeft, IconPlay } from './icons'
import { OverlayBackdrop } from '@/components/ui/overlay'
import type { RoundMode } from '@/services/versus-gameplay/versus-gameplay.interface'
import { useTranslation } from '@/i18n/useTranslation'

function IconTrophy() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 21h8M12 17v4M17 3H7L5 8c0 3.866 3.134 7 7 7s7-3.134 7-7l-2-5z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 8H3a2 2 0 000 4h2M19 8h2a2 2 0 010 4h-2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

export function ResultTransition({
  playerScore, opponentScore,
  playerName, opponentName,
  won, roundMode, eloDelta,
  onContinue, onQuit,
}: {
  playerScore: number; opponentScore: number
  playerName: string; opponentName: string
  won: boolean | null; roundMode: RoundMode
  eloDelta?: number | null
  onContinue: () => void; onQuit: () => void
}) {
  const { t } = useTranslation()
  const isDraw = won === null
  const authoritativeEloDelta = roundMode === 'versus-ranked' ? eloDelta ?? null : null

  const outcomeColor = won ? 'var(--ma-success)' : isDraw ? 'var(--ma-fg-muted)' : 'var(--ma-danger)'
  const outcomeLabel = won ? t.versusGameplay.youWin : isDraw ? t.versusGameplay.draw : t.versusGameplay.youLose
  const outcomeBg    = won
    ? 'oklch(0.70 0.15 145 / 0.12)'
    : isDraw
    ? 'var(--ma-surface-raised)'
    : 'oklch(0.62 0.19 22 / 0.10)'

  return (
    <OverlayBackdrop ariaLabel={t.versusGameplay.matchResultAria} dim={0.70} blur={8}>
      <div
        className="w-full max-w-sm mb-6 mx-4 flex flex-col gap-5 rounded-3xl p-6"
        style={{ background: 'var(--ma-surface)', border: '1px solid var(--ma-border)', boxShadow: 'var(--ma-shadow-lg)' }}
      >
        {/* Outcome badge */}
        <div
          className="flex items-center justify-center gap-3 rounded-2xl py-4"
          style={{ background: outcomeBg, border: `1px solid ${outcomeColor}30` }}
        >
          <span style={{ color: outcomeColor }}>
            <IconTrophy />
          </span>
          <span className="text-[22px] font-bold" style={{ color: outcomeColor }}>
            {outcomeLabel}
          </span>
        </div>

        {/* Score breakdown */}
        <div
          className="flex items-center justify-around rounded-2xl py-4"
          style={{ background: 'var(--ma-surface-raised)', border: '1px solid var(--ma-border)' }}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: 'var(--ma-fg-subtle)' }}>{t.versusGameplay.you}</span>
            <span className="text-[13px] font-semibold" style={{ color: 'var(--ma-fg-muted)' }}>{playerName}</span>
            <span className="text-[28px] font-bold tabular-nums" style={{ color: 'var(--ma-fg)' }}>{playerScore}</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[14px] font-bold" style={{ color: 'var(--ma-fg-subtle)' }}>–</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: 'var(--ma-fg-subtle)' }}>{t.versusGameplay.opponent}</span>
            <span className="text-[13px] font-semibold" style={{ color: 'var(--ma-fg-muted)' }}>{opponentName}</span>
            <span className="text-[28px] font-bold tabular-nums" style={{ color: 'var(--ma-fg)' }}>{opponentScore}</span>
          </div>
        </div>

        {/* Elo delta — ranked only */}
        {authoritativeEloDelta !== null && (
          <div
            className="flex items-center justify-center gap-2 rounded-xl py-2.5"
            style={{
              background: authoritativeEloDelta > 0 ? 'oklch(0.70 0.15 145 / 0.10)' : authoritativeEloDelta < 0 ? 'oklch(0.62 0.19 22 / 0.10)' : 'var(--ma-surface-raised)',
              border: '1px solid var(--ma-border)',
            }}
          >
            <span className="text-[13px] font-semibold" style={{ color: 'var(--ma-fg-muted)' }}>{t.statRow.elo}</span>
            <span
              className="text-[15px] font-bold tabular-nums"
              style={{ color: authoritativeEloDelta > 0 ? 'var(--ma-success)' : authoritativeEloDelta < 0 ? 'var(--ma-danger)' : 'var(--ma-fg-muted)' }}
            >
              {authoritativeEloDelta > 0
                ? `+${authoritativeEloDelta}`
                : authoritativeEloDelta === 0 ? '±0' : authoritativeEloDelta}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onContinue}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
            style={{ background: 'var(--ma-brand)', color: 'var(--ma-brand-fg)', boxShadow: 'var(--ma-shadow-md)' }}
          >
            <IconPlay />
            {t.result.playAgain}
          </button>
          <button
            type="button"
            onClick={onQuit}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
            style={{
              background: 'var(--ma-surface-raised)',
              border: '1px solid var(--ma-border)',
              color: 'var(--ma-fg-muted)',
            }}
          >
            <IconChevronLeft />
            {t.result.backToLobby}
          </button>
        </div>
      </div>
    </OverlayBackdrop>
  )
}
