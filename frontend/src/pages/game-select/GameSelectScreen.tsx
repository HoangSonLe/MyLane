import { useState } from 'react'

import { BottomNavBar } from '@/components/ui/BottomNavBar'
import { StatusBanner } from '@/components/ui/StatusBanner'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { StatePill } from '@/components/ui/StatePill'
import { BackRow } from './components/BackRow'
import { GameCard } from './components/GameCard'
import { ModeChip } from './components/ModeChip'
import { DifficultyChip } from './components/DifficultyChip'
import { StartButton } from './components/StartButton'
import { GuestNudge } from './components/GuestNudge'
import { GAMES, MODES, DIFFICULTIES } from '@/services/game-select/game-select.mock'
import { ScreenState, GameId, ModeId, DifficultyId, EntryPoint } from '@/configs/enum'

// ─── Main component ──────────────────────────────────────────────
export function GameSelectScreen({
  entryPoint = EntryPoint.HOME,
  onBack,
  onNavigate,
}: {
  entryPoint?: EntryPoint
  onBack?: () => void
  onNavigate?: (id: string, meta?: { game: GameId; mode: ModeId; difficulty: DifficultyId }) => void
}) {
  const [screenState, setScreenState]       = useState<ScreenState>(ScreenState.NORMAL)
  const [selectedGame, setSelectedGame]     = useState<GameId>(GameId.SEQUENCE)
  const [selectedMode, setSelectedMode]     = useState<ModeId>(ModeId.SOLO_PRACTICE)
  const [selectedDiff, setSelectedDiff]     = useState<DifficultyId>(DifficultyId.MEDIUM)

  const isLoading = screenState === ScreenState.LOADING
  const isOffline = screenState === ScreenState.OFFLINE

  // In offline / logged-out states show as guest
  const isGuest = isOffline

  const currentMode = MODES.find((m) => m.id === selectedMode) ?? MODES[0]
  const canStart = !isLoading && !isOffline

  function handleStart() {
    if (!canStart) return
    const meta = { game: selectedGame, mode: selectedMode, difficulty: selectedDiff }
    if (currentMode.versusFlow) {
      onNavigate?.('matchmaking', meta)
    } else {
      onNavigate?.('game', meta)
    }
  }

  return (
    <div
      className="relative flex min-h-dvh flex-col"
      style={{ background: 'var(--ma-bg)' }}
    >
      {/* Offline banner — above the back row */}
      {isOffline && (
        <div className="pt-16">
          <StatusBanner
            variant="offline"
            message="You're offline. Only Solo Practice is available."
          />
        </div>
      )}

      <main
        id="main-content"
        className={[
          'flex flex-1 flex-col gap-5 pb-32',
          isOffline ? '' : 'pt-16',
        ].join(' ')}
      >
        {/* Back row + title */}
        <BackRow
          skeleton={isLoading}
          entryPoint={entryPoint}
          onBack={onBack}
        />

        {/* ── Game cards ── */}
        <div className="flex flex-col gap-3">
          {isLoading ? (
            <div
              className="skeleton mx-4"
              style={{ height: '0.75rem', width: '4rem', borderRadius: 'var(--radius-sm)' }}
            />
          ) : (
            <SectionLabel label="Choose a game" />
          )}
          <div className="flex flex-col gap-2.5 px-4">
            {GAMES.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                selected={!isLoading && selectedGame === game.id}
                isGuest={isGuest}
                skeleton={isLoading}
                onSelect={() => setSelectedGame(game.id)}
              />
            ))}
          </div>
        </div>

        {/* ── Mode selector ── */}
        <div className="flex flex-col gap-3">
          {isLoading ? (
            <div
              className="skeleton mx-4"
              style={{ height: '0.75rem', width: '4rem', borderRadius: 'var(--radius-sm)' }}
            />
          ) : (
            <SectionLabel label="Mode" />
          )}
          <div className="flex gap-2 px-4">
            {MODES.map((mode) => (
              <ModeChip
                key={mode.id}
                mode={mode}
                selected={!isLoading && selectedMode === mode.id}
                isGuest={isGuest}
                skeleton={isLoading}
                onSelect={() => {
                  if (!isGuest || !mode.requiresAccount) {
                    setSelectedMode(mode.id)
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Difficulty selector ── */}
        <div className="flex flex-col gap-3">
          {isLoading ? (
            <div
              className="skeleton mx-4"
              style={{ height: '0.75rem', width: '5rem', borderRadius: 'var(--radius-sm)' }}
            />
          ) : (
            <SectionLabel label="Difficulty" />
          )}
          <div className="flex gap-2 px-4">
            {DIFFICULTIES.map((diff) => (
              <DifficultyChip
                key={diff.id}
                difficulty={diff}
                selected={!isLoading && selectedDiff === diff.id}
                skeleton={isLoading}
                onSelect={() => setSelectedDiff(diff.id)}
              />
            ))}
          </div>
        </div>

        {/* Guest nudge — shown when offline/guest */}
        {isGuest && !isLoading && (
          <GuestNudge onLogIn={() => onNavigate?.('login')} />
        )}

        {/* ── Start button ── */}
        <StartButton
          skeleton={isLoading}
          selectedMode={currentMode}
          disabled={!canStart}
          onClick={handleStart}
        />
      </main>

      {/* Bottom nav */}
      <BottomNavBar active="play" onNavigate={onNavigate} />

      {/* State switcher — prototype only */}
      <StatePill current={screenState} onChange={setScreenState} states={[ScreenState.NORMAL, ScreenState.LOADING, ScreenState.OFFLINE]} />
    </div>
  )
}
