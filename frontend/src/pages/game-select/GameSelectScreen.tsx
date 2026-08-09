import { useCallback, useEffect, useState } from 'react'

import { BottomNavBar } from '@/components/ui/BottomNavBar'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { ScreenShell, ScreenOfflineBanner, ScreenMain } from '@/components/ui/layout'
import { BackRow } from './components/BackRow'
import { GameCard, ModeChip, DifficultyChip } from '@/components/ui/game'
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
  onNavigate?: (id: string, meta?: { game: GameId; mode: ModeId; difficulty: DifficultyId; startLevel?: number }) => void
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

  const selectedGameStats = stats?.find((s) => s.id === selectedGame)
  const maxUnlockedLevel = Math.max(1, selectedGameStats?.highestLevel ?? 1)
  const [selectedStartLevel, setSelectedStartLevel] = useState<number>(1)
  // Endless's own Level-10 unlock, for the currently selected game — guests
  // are blocked separately via `requiresAccount`, not this check. Recomputed
  // from `selectedGame`'s own data, so switching game cards while Endless is
  // selected re-evaluates it (a mode picked for one game can be locked for
  // another).
  const isEndlessLevelLocked = !isGuest && (selectedGameStats?.highestLevel ?? 1) < 10
  const isSelectedModeLocked = selectedMode === ModeId.SOLO_ENDLESS && isEndlessLevelLocked

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

  useEffect(() => {
    setSelectedStartLevel(maxUnlockedLevel)
  }, [selectedGame, maxUnlockedLevel])

  // Switching games while Endless is selected can make it locked for the new
  // game (highestLevel is per-game) — fall back to Practice rather than
  // leaving a locked mode selected (and startable, see canStart below).
  useEffect(() => {
    if (isSelectedModeLocked) {
      setSelectedMode(ModeId.SOLO_PRACTICE)
    }
  }, [isSelectedModeLocked])

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
  const canStart = !isLoadingStats && !isOffline && !isSelectedModeLocked

  function handleStart() {
    if (!canStart) return
    const meta = { game: selectedGame, mode: selectedMode, difficulty: selectedDiff, startLevel: selectedStartLevel }
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
            {localizedModes
              .filter((mode) => !(mode.id === ModeId.SOLO_ENDLESS && isEndlessLevelLocked))
              .map((mode) => {
                const modeLocked = mode.id === ModeId.SOLO_ENDLESS && isEndlessLevelLocked
                return (
                  <ModeChip
                    key={mode.id}
                    mode={mode}
                    selected={!isLoadingStats && selectedMode === mode.id}
                    isGuest={isGuest}
                    customLocked={modeLocked ? true : undefined}
                    currentLevel={selectedGameStats?.highestLevel ?? 1}
                    skeleton={isLoadingStats}
                    onLogIn={() => onNavigate?.('login')}
                    onSelect={() => {
                      if (!modeLocked && (!isGuest || !mode.requiresAccount)) {
                        setSelectedMode(mode.id)
                      }
                    }}
                  />
                )
              })}
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

        {/* ── Starting Level selector — solo only; not wired into the Versus flow yet ── */}
        {selectedMode !== ModeId.SOLO_ENDLESS && !currentMode.versusFlow && (
          <div className="flex flex-col gap-3">
            {isLoadingStats ? (
              <div
                className="skeleton mx-4"
                style={{ height: '0.75rem', width: '6rem', borderRadius: 'var(--radius-sm)' }}
              />
            ) : (
              <SectionLabel label={t.gameSelect.startingLevel} />
            )}
            <div className="flex flex-wrap gap-2 px-4">
              {Array.from({ length: maxUnlockedLevel }, (_, i) => i + 1).map((lvl) => {
                const isSelected = selectedStartLevel === lvl
                const isMax = lvl === maxUnlockedLevel && maxUnlockedLevel > 1
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedStartLevel(lvl)}
                    className={[
                      'flex items-center gap-1 px-3 py-1.5 text-[12px] font-semibold rounded-xl transition-all',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
                      isSelected
                        ? 'bg-[var(--ma-active)] text-white shadow-sm'
                        : 'bg-[var(--ma-surface-raised)] text-[var(--ma-fg-muted)] border border-[var(--ma-border)] hover:border-[var(--ma-active-soft)]',
                    ].join(' ')}
                  >
                    <span>{t.gameSelect.levelValue(lvl)}</span>
                    {isMax && <span className="text-[10px] opacity-80">{t.gameSelect.recordBadge}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

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
