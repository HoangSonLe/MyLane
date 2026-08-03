import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { SettingsRow } from '@/components/ui/settings'
import { IconPlay, IconRefresh } from './icons'
import { getGameLabels, getModeLabels } from '@/services/gameplay/gameplay-screen.types'
import { GameId, ModeId } from '@/configs/enum'
import { useTranslation } from '@/i18n/useTranslation'
import { useSoundsStore } from '@/stores/sounds.store'
import { useHapticsStore } from '@/stores/haptics.store'

function IconX() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}

function IconVolume() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M11 5L6 9H3v6h3l5 4V5zM15 9a4 4 0 010 6M18 6a8 8 0 010 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconVibrate() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="7" y="4" width="10" height="16" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M4 8v8M20 8v8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

export function PauseOverlay({
  gameType,
  mode,
  onResume,
  onReset,
  onQuit,
}: {
  gameType: GameId
  mode: ModeId
  onResume: () => void
  onReset: () => void
  onQuit: () => void
}) {
  const { t } = useTranslation()
  const gameLabels = getGameLabels(t)
  const modeLabels = getModeLabels(t)
  const isSolo = mode === ModeId.SOLO_PRACTICE || mode === ModeId.SOLO_RANKED
  const [confirmation, setConfirmation] = useState<'reset' | 'quit' | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const soundsEnabled = useSoundsStore((state) => state.enabled)
  const setSoundsEnabled = useSoundsStore((state) => state.setEnabled)
  const hapticsEnabled = useHapticsStore((state) => state.enabled)
  const setHapticsEnabled = useHapticsStore((state) => state.setEnabled)

  if (showSettings) {
    return (
      <div
        className="fixed inset-0 z-40 flex items-end justify-center"
        style={{ background: 'oklch(0 0 0 / 0.6)', backdropFilter: 'blur(6px)' }}
        role="dialog"
        aria-modal="true"
        aria-label={t.settings.title}
      >
        <Card className="w-full max-w-sm mb-6 mx-4 overflow-hidden p-0" radius="3xl" shadow="lg">
          <div className="flex items-center justify-between border-b border-[var(--ma-border)] px-5 py-4">
            <p className="text-[17px] font-bold" style={{ color: 'var(--ma-fg)' }}>{t.settings.title}</p>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              aria-label={t.common.close}
              className="flex h-9 w-9 items-center justify-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
              style={{ background: 'var(--ma-surface-raised)', color: 'var(--ma-fg-muted)' }}
            >
              <IconX />
            </button>
          </div>
          <SettingsRow
            icon={<IconVolume />}
            label={t.settings.soundEffects}
            description={t.settings.soundEffectsDesc}
            checked={soundsEnabled}
            onToggle={setSoundsEnabled}
          />
          <div className="mx-4 h-px bg-[var(--ma-border)]" />
          <SettingsRow
            icon={<IconVibrate />}
            label={t.settings.hapticFeedback}
            description={t.settings.hapticFeedbackDesc}
            checked={hapticsEnabled}
            onToggle={setHapticsEnabled}
          />
        </Card>
      </div>
    )
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 flex items-end justify-center"
        style={{ background: 'oklch(0 0 0 / 0.6)', backdropFilter: 'blur(6px)' }}
        role="dialog"
        aria-modal="true"
        aria-label={t.pauseOverlay.gamePaused}
      >
        <Card className="w-full max-w-sm mb-6 mx-4 flex flex-col gap-3 p-5" radius="3xl" shadow="lg">
        {/* Header */}
        <div className="flex items-center justify-between pb-1">
          <div>
            <p className="text-[17px] font-bold" style={{ color: 'var(--ma-fg)' }}>{t.pauseOverlay.paused}</p>
            <p className="text-[12px]" style={{ color: 'var(--ma-fg-muted)' }}>
              {gameLabels[gameType]} &middot; {modeLabels[mode]}
            </p>
          </div>
          <button
            type="button"
            onClick={onResume}
            aria-label={t.pauseOverlay.closePauseMenu}
            className="flex h-9 w-9 items-center justify-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
            style={{ background: 'var(--ma-surface-raised)', color: 'var(--ma-fg-muted)' }}
          >
            <IconX />
          </button>
        </div>

        {/* Resume */}
        <button
          type="button"
          onClick={onResume}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
          style={{
            background: 'var(--ma-brand)',
            color: 'var(--ma-brand-fg)',
            boxShadow: 'var(--ma-shadow-md)',
          }}
        >
          <IconPlay />
          {t.pauseOverlay.resume}
        </button>

        {/* Reset */}
        <button
          type="button"
          onClick={() => setConfirmation('reset')}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
          style={{
            background: 'var(--ma-surface-raised)',
            border: '1px solid var(--ma-border)',
            color: 'var(--ma-fg)',
          }}
        >
          <IconRefresh />
          {t.pauseOverlay.resetRound}
        </button>

        {/* Settings — Solo only */}
        {isSolo && (
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
            style={{
              background: 'var(--ma-surface-raised)',
              border: '1px solid var(--ma-border)',
              color: 'var(--ma-fg)',
            }}
          >
            <IconSettings />
            {t.pauseOverlay.settings}
          </button>
        )}

        {/* Quit */}
        <button
          type="button"
          onClick={() => setConfirmation('quit')}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
          style={{
            background: 'oklch(0.62 0.19 22 / 0.10)',
            border: '1px solid oklch(0.62 0.19 22 / 0.25)',
            color: 'var(--ma-danger)',
          }}
        >
          <IconX />
          {t.pauseOverlay.quitGame}
        </button>
        </Card>
      </div>
      <ConfirmDialog
        open={confirmation !== null}
        variant="danger"
        title={confirmation === 'reset' ? t.pauseOverlay.resetConfirmTitle : t.pauseOverlay.quitConfirmTitle}
        message={confirmation === 'reset' ? t.pauseOverlay.resetConfirmMessage : t.pauseOverlay.quitConfirmMessage}
        confirmLabel={confirmation === 'reset' ? t.pauseOverlay.resetRound : t.pauseOverlay.quitGame}
        cancelLabel={t.pauseOverlay.keepPlaying}
        onConfirm={() => {
          const action = confirmation
          setConfirmation(null)
          if (action === 'reset') onReset()
          if (action === 'quit') onQuit()
        }}
        onCancel={() => setConfirmation(null)}
      />
    </>
  )
}
