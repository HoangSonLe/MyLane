import { useCallback, useEffect, useState } from 'react'

import { BottomNavBar } from '@/components/ui/BottomNavBar'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { ScreenShell, ScreenOfflineBanner, ScreenMain } from '@/components/ui/layout'
import { BackRow } from './components/BackRow'
import { GameCard } from './components/GameCard'
import { ModeChip } from './components/ModeChip'
import { DifficultyChip } from './components/DifficultyChip'
import { StartButton } from './components/StartButton'
import { GuestNudge } from './components/GuestNudge'
import { GAMES, MODES, DIFFICULTIES } from '@/services/game-select/game-select.mock'
import { gameSelectService } from '@/services/game-select/game-select.service'
import type { GameStats } from '@/services/game-select/game-select.interface'
import { GameId, ModeId, DifficultyId, EntryPoint } from '@/configs/enum'
import { useNetworkStatus } from '@/lib/hooks/useNetworkStatus'
import { useAuthStore } from '@/stores/auth.store'
import { useTranslation } from '@/i18n/useTranslation'
import {
  getDifficultyLabels,
  getGameLabels,
  getModeLabels,
} from '@/services/gameplay/gameplay-screen.types'

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
  const { isOffline } = useNetworkStatus()
  const user = useAuthStore((s) => s.user)
  const isGuest = user?.isGuest ?? true
  const { t } = useTranslation()

  const [selectedGame, setSelectedGame] = useState<GameId>(GameId.COLOR)
  const [selectedMode, setSelectedMode] = useState<ModeId>(ModeId.SOLO_PRACTICE)
  const [selectedDiff, setSelectedDiff] = useState<DifficultyId>(DifficultyId.MEDIUM)

  const [stats, setStats] = useState<GameStats[] | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [statsError, setStatsError] = useState(false)

  const loadStats = useCallback(async () => {
    setIsLoadingStats(true)
    setStatsError(false)
    try {
      setStats(await gameSelectService.getStats())
    } catch {
      setStatsError(true)
    } finally {
      setIsLoadingStats(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const gameLabels = getGameLabels(t)
  const modeLabels = getModeLabels(t)
  const difficultyLabels = getDifficultyLabels(t)
  const localizedGames = GAMES.map((game) => ({ ...game, label: gameLabels[game.id] }))
  const localizedModes = MODES.map((mode) => ({ ...mode, label: modeLabels[mode.id] }))
  const localizedDifficulties = DIFFICULTIES.map((difficulty) => ({
    ...difficulty,
    label: difficultyLabels[difficulty.id],
  }))
  const currentMode = localizedModes.find((mode) => mode.id === selectedMode) ?? localizedModes[0]
  const canStart = !isLoadingStats && !isOffline

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
    <ScreenShell>
      {/* Offline banner — above the back row */}
      <ScreenOfflineBanner show={isOffline} message={t.gameSelect.offlineBanner} />

      <ScreenMain bottomPadding="pb-32" offline={isOffline}>
        {/* Back row + title */}
        <BackRow
          skeleton={isLoadingStats}
          entryPoint={entryPoint}
          onBack={onBack}
        />

        {/* ── Game cards ── */}
        <div className="flex flex-col gap-3">
          {isLoadingStats ? (
            <div
              className="skeleton mx-4"
              style={{ height: '0.75rem', width: '4rem', borderRadius: 'var(--radius-sm)' }}
            />
          ) : (
            <SectionLabel label={t.gameSelect.chooseGame} />
          )}
          <div className="flex flex-col gap-2.5 px-4">
            {localizedGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                stats={stats?.find((s) => s.id === game.id) ?? null}
                statsError={statsError}
                onRetryStats={loadStats}
                selected={!isLoadingStats && selectedGame === game.id}
                isGuest={isGuest}
                skeleton={isLoadingStats}
                onSelect={() => setSelectedGame(game.id)}
              />
            ))}
          </div>
        </div>

        {/* ── Mode selector ── */}
        <div className="flex flex-col gap-3">
          {isLoadingStats ? (
            <div
              className="skeleton mx-4"
              style={{ height: '0.75rem', width: '4rem', borderRadius: 'var(--radius-sm)' }}
            />
          ) : (
            <SectionLabel label={t.gameSelect.mode} />
          )}
          <div className="flex gap-2 px-4">
            {localizedModes.map((mode) => (
              <ModeChip
                key={mode.id}
                mode={mode}
                selected={!isLoadingStats && selectedMode === mode.id}
                isGuest={isGuest}
                skeleton={isLoadingStats}
                onLogIn={() => onNavigate?.('login')}
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
          {isLoadingStats ? (
            <div
              className="skeleton mx-4"
              style={{ height: '0.75rem', width: '5rem', borderRadius: 'var(--radius-sm)' }}
            />
          ) : (
            <SectionLabel label={t.gameSelect.difficulty} />
          )}
          <div className="flex gap-2 px-4">
            {localizedDifficulties.map((diff) => (
              <DifficultyChip
                key={diff.id}
                difficulty={diff}
                selected={!isLoadingStats && selectedDiff === diff.id}
                skeleton={isLoadingStats}
                onSelect={() => setSelectedDiff(diff.id)}
              />
            ))}
          </div>
        </div>

        {/* Guest nudge — shown when logged in as guest */}
        {isGuest && !isLoadingStats && (
          <GuestNudge onLogIn={() => onNavigate?.('login')} />
        )}

        {/* ── Start button ── */}
        <StartButton
          skeleton={isLoadingStats}
          selectedMode={currentMode}
          disabled={!canStart}
          onClick={handleStart}
        />
      </ScreenMain>

      {/* Bottom nav */}
      <BottomNavBar active="play" onNavigate={onNavigate} />
    </ScreenShell>
  )
}
