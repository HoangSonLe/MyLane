import { IconX } from './icons'
import { useTranslation } from '@/i18n/useTranslation'

export function ReconnectingOverlay({
  countdown, onQuit,
}: { countdown: number; onQuit: () => void }) {
  const { t } = useTranslation()
  const r = 22
  const circ = 2 * Math.PI * r
  const maxSecs = 60
  const offset = circ * (1 - Math.max(0, countdown / maxSecs))

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center"
      style={{ background: 'oklch(0 0 0 / 0.65)', backdropFilter: 'blur(6px)' }}
      role="dialog"
      aria-modal="true"
      aria-label={t.versusGameplay.opponentDisconnectedAria}
    >
      <div
        className="w-full max-w-sm mb-6 mx-4 flex flex-col items-center gap-5 rounded-3xl p-6 text-center"
        style={{ background: 'var(--ma-surface)', border: '1px solid var(--ma-border)', boxShadow: 'var(--ma-shadow-lg)' }}
      >
        {/* Countdown ring */}
        <div
          className="relative flex h-20 w-20 items-center justify-center"
          aria-label={t.versusGameplay.forfeitCountdownAria(countdown)}
        >
          <svg width="80" height="80" viewBox="0 0 50 50" className="-rotate-90" aria-hidden="true">
            <circle cx="25" cy="25" r={r} strokeWidth="3" fill="none" stroke="var(--ma-border)" />
            <circle
              cx="25" cy="25" r={r} strokeWidth="3" fill="none"
              stroke={countdown <= 10 ? 'var(--ma-danger)' : 'var(--ma-warning)'}
              strokeDasharray={circ}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
            />
          </svg>
          <span
            className="absolute text-[20px] font-bold tabular-nums"
            style={{ color: countdown <= 10 ? 'var(--ma-danger)' : 'var(--ma-warning)' }}
          >
            {countdown}
          </span>
        </div>

        <div>
          <p className="text-[17px] font-bold" style={{ color: 'var(--ma-fg)' }}>{t.versusGameplay.opponentDisconnectedTitle}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: 'var(--ma-fg-muted)' }}>
            {t.versusGameplay.opponentDisconnectedDesc}
          </p>
        </div>

        <button
          type="button"
          onClick={onQuit}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
          style={{
            background: 'oklch(0.62 0.19 22 / 0.10)',
            border: '1px solid oklch(0.62 0.19 22 / 0.25)',
            color: 'var(--ma-danger)',
          }}
        >
          <IconX />
          {t.versusGameplay.quitMatch}
        </button>
      </div>
    </div>
  )
}
