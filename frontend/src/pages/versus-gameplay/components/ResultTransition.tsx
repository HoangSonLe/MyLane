import { IconChevronLeft, IconPlay } from './icons'
import type { RoundMode } from '@/services/versus-gameplay/versus-gameplay.interface'

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
  won, roundMode,
  onContinue, onQuit,
}: {
  playerScore: number; opponentScore: number
  playerName: string; opponentName: string
  won: boolean | null; roundMode: RoundMode
  onContinue: () => void; onQuit: () => void
}) {
  const isDraw = won === null
  const eloDelta = roundMode === 'versus-ranked' ? (won ? +18 : isDraw ? 0 : -12) : null

  const outcomeColor = won ? 'var(--ma-success)' : isDraw ? 'var(--ma-fg-muted)' : 'var(--ma-danger)'
  const outcomeLabel = won ? 'You win!' : isDraw ? 'Draw' : 'You lose'
  const outcomeBg    = won
    ? 'oklch(0.70 0.15 145 / 0.12)'
    : isDraw
    ? 'var(--ma-surface-raised)'
    : 'oklch(0.62 0.19 22 / 0.10)'

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center"
      style={{ background: 'oklch(0 0 0 / 0.70)', backdropFilter: 'blur(8px)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Match result"
    >
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
            <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: 'var(--ma-fg-subtle)' }}>You</span>
            <span className="text-[13px] font-semibold" style={{ color: 'var(--ma-fg-muted)' }}>{playerName}</span>
            <span className="text-[28px] font-bold tabular-nums" style={{ color: 'var(--ma-fg)' }}>{playerScore}</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[14px] font-bold" style={{ color: 'var(--ma-fg-subtle)' }}>–</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: 'var(--ma-fg-subtle)' }}>Opponent</span>
            <span className="text-[13px] font-semibold" style={{ color: 'var(--ma-fg-muted)' }}>{opponentName}</span>
            <span className="text-[28px] font-bold tabular-nums" style={{ color: 'var(--ma-fg)' }}>{opponentScore}</span>
          </div>
        </div>

        {/* Elo delta — ranked only */}
        {eloDelta !== null && (
          <div
            className="flex items-center justify-center gap-2 rounded-xl py-2.5"
            style={{
              background: eloDelta > 0 ? 'oklch(0.70 0.15 145 / 0.10)' : eloDelta < 0 ? 'oklch(0.62 0.19 22 / 0.10)' : 'var(--ma-surface-raised)',
              border: '1px solid var(--ma-border)',
            }}
          >
            <span className="text-[13px] font-semibold" style={{ color: 'var(--ma-fg-muted)' }}>Elo</span>
            <span
              className="text-[15px] font-bold tabular-nums"
              style={{ color: eloDelta > 0 ? 'var(--ma-success)' : eloDelta < 0 ? 'var(--ma-danger)' : 'var(--ma-fg-muted)' }}
            >
              {eloDelta > 0 ? `+${eloDelta}` : eloDelta === 0 ? '±0' : eloDelta}
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
            Play again
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
            Back to lobby
          </button>
        </div>
      </div>
    </div>
  )
}
