import { Card } from '@/components/ui/card'
import { useTranslation } from '@/i18n/useTranslation'

function IconX() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconWifiOff() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8.5 16.5a5 5 0 017 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M5 13a9 9 0 0114 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M2 9.5a13 13 0 0120 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="12" cy="20" r="1" fill="currentColor" />
      <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Shown when the network drops mid-answering. Not a real server-controlled
 * timer (docs/technical/README.md's requirement — see
 * docs/technical/known-gaps.md "Gameplay — timer vẫn client-side") — this
 * only reacts to the real navigator online/offline signal
 * (useNetworkStatus). The answering countdown is paused (not reset) while
 * this is up and resumes automatically once back online; see the timer
 * effect in GameplayScreen.tsx.
 */
export function OfflinePauseOverlay({ onQuit }: { onQuit: () => void }) {
  const { t } = useTranslation()
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center"
      style={{ background: 'oklch(0 0 0 / 0.6)', backdropFilter: 'blur(6px)' }}
      role="dialog"
      aria-modal="true"
      aria-label={t.offlinePauseOverlay.connectionLost}
    >
      <Card className="w-full max-w-sm mb-6 mx-4 flex flex-col items-center gap-4 p-6 text-center" radius="3xl" shadow="lg">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: 'oklch(0.76 0.14 74 / 0.12)', color: 'var(--ma-warning)' }}
        >
          <IconWifiOff />
        </div>

        <div>
          <p className="text-[17px] font-bold" style={{ color: 'var(--ma-fg)' }}>{t.offlinePauseOverlay.offlineTitle}</p>
          <p className="mt-1 text-[13px] leading-relaxed" style={{ color: 'var(--ma-fg-muted)' }}>
            {t.offlinePauseOverlay.offlineBody}
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
          {t.offlinePauseOverlay.quitGame}
        </button>
      </Card>
    </div>
  )
}
