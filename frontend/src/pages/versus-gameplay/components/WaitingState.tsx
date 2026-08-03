import { useEffect, useState } from 'react'

import { IconSpinner, IconX } from './icons'
import { useTranslation } from '@/i18n/useTranslation'

export function WaitingState({ opponentName, onQuit }: { opponentName: string; onQuit: () => void }) {
  const { t } = useTranslation()
  const [dots, setDots] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d + 1) % 4), 500)
    return () => clearInterval(id)
  }, [])
  const dotStr = '.'.repeat(dots)

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-2xl"
        style={{ background: 'var(--ma-surface)' }}
        aria-live="polite"
      >
        <IconSpinner />
      </div>
      <div>
        <p className="text-[16px] font-bold" style={{ color: 'var(--ma-fg)' }}>
          {t.versusGameplay.waitingForOpponentName(opponentName)}{dotStr}
        </p>
        <p className="mt-1 text-[13px] leading-relaxed" style={{ color: 'var(--ma-fg-muted)' }}>
          {t.versusGameplay.bothPlayersReady}
        </p>
      </div>
      <button
        type="button"
        onClick={onQuit}
        className="flex items-center gap-2 rounded-2xl px-6 py-3 text-[14px] font-semibold transition-all active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
        style={{
          background: 'oklch(0.62 0.19 22 / 0.10)',
          border: '1px solid oklch(0.62 0.19 22 / 0.25)',
          color: 'var(--ma-danger)',
        }}
      >
        <IconX />
        {t.versusGameplay.cancel}
      </button>
    </div>
  )
}
