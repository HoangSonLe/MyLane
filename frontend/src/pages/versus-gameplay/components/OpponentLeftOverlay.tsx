import { IconX } from './icons'
import { OverlayBackdrop } from '@/components/ui/overlay'
import { useTranslation } from '@/i18n/useTranslation'

/**
 * Shown once the opponent has been absent for the full 60s reconnect window
 * (docs/gameplay/README.md "Technical Rules"). A client can't award itself
 * the win (known-gaps.md §5), so the only action here is to leave *without*
 * a forfeit — `onLeave` must not call forfeit_versus_match.
 */
export function OpponentLeftOverlay({ onLeave }: { onLeave: () => void }) {
  const { t } = useTranslation()
  return (
    <OverlayBackdrop ariaLabel={t.versusGameplay.opponentLeftTitle} dim={0.65} blur={6}>
      <div
        className="w-full max-w-sm mb-6 mx-4 flex flex-col items-center gap-5 rounded-3xl p-6 text-center"
        style={{ background: 'var(--ma-surface)', border: '1px solid var(--ma-border)', boxShadow: 'var(--ma-shadow-lg)' }}
      >
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: 'oklch(0.76 0.14 74 / 0.12)', color: 'var(--ma-warning)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M8.5 16.5a5 5 0 017 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            <path d="M5 13a9 9 0 0114 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            <path d="M2 9.5a13 13 0 0120 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            <circle cx="12" cy="20" r="1" fill="currentColor" />
            <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p className="text-[17px] font-bold" style={{ color: 'var(--ma-fg)' }}>{t.versusGameplay.opponentLeftTitle}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: 'var(--ma-fg-muted)' }}>
            {t.versusGameplay.opponentLeftDesc}
          </p>
        </div>
        <button
          type="button"
          onClick={onLeave}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
          style={{ background: 'var(--ma-brand)', color: 'var(--ma-brand-fg)', boxShadow: 'var(--ma-shadow-md)' }}
        >
          <IconX />
          {t.versusGameplay.leaveToLobby}
        </button>
      </div>
    </OverlayBackdrop>
  )
}
