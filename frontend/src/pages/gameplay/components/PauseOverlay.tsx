import { Card } from '@/components/ui/card'
import { IconPlay, IconRefresh } from './icons'
import { GAME_LABELS, MODE_LABELS } from '@/services/gameplay/gameplay-screen.types'
import { GameId, ModeId } from '@/configs/enum'

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

export function PauseOverlay({
  gameType,
  mode,
  onResume,
  onReset,
  onSettings,
  onQuit,
}: {
  gameType: GameId
  mode: ModeId
  onResume: () => void
  onReset: () => void
  onSettings: () => void
  onQuit: () => void
}) {
  const isSolo = mode === ModeId.SOLO_PRACTICE || mode === ModeId.SOLO_RANKED
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center"
      style={{ background: 'oklch(0 0 0 / 0.6)', backdropFilter: 'blur(6px)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Game paused"
    >
      <Card className="w-full max-w-sm mb-6 mx-4 flex flex-col gap-3 p-5" radius="3xl" shadow="lg">
        {/* Header */}
        <div className="flex items-center justify-between pb-1">
          <div>
            <p className="text-[17px] font-bold" style={{ color: 'var(--ma-fg)' }}>Paused</p>
            <p className="text-[12px]" style={{ color: 'var(--ma-fg-muted)' }}>
              {GAME_LABELS[gameType]} &middot; {MODE_LABELS[mode]}
            </p>
          </div>
          <button
            type="button"
            onClick={onResume}
            aria-label="Close pause menu"
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
          Resume
        </button>

        {/* Reset */}
        <button
          type="button"
          onClick={onReset}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
          style={{
            background: 'var(--ma-surface-raised)',
            border: '1px solid var(--ma-border)',
            color: 'var(--ma-fg)',
          }}
        >
          <IconRefresh />
          Reset round
        </button>

        {/* Settings — Solo only */}
        {isSolo && (
          <button
            type="button"
            onClick={onSettings}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
            style={{
              background: 'var(--ma-surface-raised)',
              border: '1px solid var(--ma-border)',
              color: 'var(--ma-fg)',
            }}
          >
            <IconSettings />
            Settings
          </button>
        )}

        {/* Quit */}
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
          Quit game
        </button>
      </Card>
    </div>
  )
}
