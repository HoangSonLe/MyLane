import { useState, useEffect, useRef } from 'react'
import { hapticFeedback } from '@/lib/utils/haptics'
import { soundEffects } from '@/lib/utils/audio'

import { StatusBanner } from '@/components/ui/StatusBanner'
import { NumberBoard, AlphabetBoard, GridBoard, SequenceBoard, ColorBoard } from '@/components/ui/gameplay'
import { DifficultyId, GameId, ModeId, Phase } from '@/configs/enum'
import { PhaseBanner } from './components/PhaseBanner'
import { WrongToast } from './components/WrongToast'
import { StatRow } from './components/StatRow'
import { PauseOverlay } from './components/PauseOverlay'
import { OfflinePauseOverlay } from './components/OfflinePauseOverlay'
import { TutorialOverlay } from './components/TutorialOverlay'
import { PromptBar } from './components/PromptBar'
import { GameplayHeader } from './components/GameplayHeader'
import { getGameLabels, getModeLabels } from '@/services/gameplay/gameplay-screen.types'
import { useTranslation } from '@/i18n/useTranslation'
import {
  DIFFICULTY_SECONDS,
  GRID_ANSWER_TIME_SECONDS,
  GRID_VIEW_TIME_SECONDS,
  GRID_WRONG_TAP_PENALTY_SECONDS,
  NUMBER_LEVELS,
  ALPHABET_LEVELS,
  SEQUENCE_LEVELS,
  SEQUENCE_FLASH_MS,
  SEQUENCE_GAP_MS,
  SEQUENCE_TILE_COUNT,
  COLOR_FLASH_MS,
  COLOR_GAP_MS,
  clampLevel,
  getColorLevel,
  getGridLevel,
  getLinearLevel,
  getRoundsToWin,
} from '@/services/gameplay/game-rules'
import { useNetworkStatus } from '@/lib/hooks/useNetworkStatus'
import { useAuthStore } from '@/stores/auth.store'
import {
  clearGameplayCheckpoint,
  loadGameplayCheckpoint,
  saveGameplayCheckpoint,
} from '@/lib/utils/gameplay-checkpoint'
import { gameSelectService } from '@/services/game-select/game-select.service'
import { lobbyService } from '@/services/lobby/lobby.service'
import type { GameStats } from '@/services/game-select/game-select.interface'
import type { GameResultInput } from '@/services/result/result.interface'

interface Props {
  gameType?: GameId
  mode?: ModeId
  difficulty?: DifficultyId
  onBack?: () => void
  onQuit?: () => void
  /** Loss-streak at current level reached the level's rounds-to-win threshold — navigate to Result. */
  onGameOver?: (result: GameResultInput) => void
}

interface PausableTimeoutTask {
  id: ReturnType<typeof setTimeout> | null
  callback: () => void
  remainingMs: number
  startedAt: number
}

/**
 * docs/gameplay/README.md: "Viewing/Answering countdowns" name a base
 * `viewTime`/`answerTime` per game, and "Difficulty Modes" always add to
 * both. Number/Alphabet/Sequence's own doc files don't give a concrete
 * default number for either (only Grid Memory's does — see
 * GRID_VIEW_TIME_SECONDS/GRID_ANSWER_TIME_SECONDS) — so for those 3 the
 * pre-existing length-scaled placeholder base is kept, with only the
 * documented difficulty delta newly applied on top of it.
 */
function getAnswerTimeSeconds(gameType: GameId, level: number, difficulty: DifficultyId): number {
  const bonus = DIFFICULTY_SECONDS[difficulty]
  if (gameType === GameId.GRID) return GRID_ANSWER_TIME_SECONDS + bonus
  return 10 + level * 3 + bonus
}

// ─── Main export ───────────────────────────────────────────────────
export function GameplayScreen({
  gameType: initialGameType = GameId.COLOR,
  mode = ModeId.SOLO_PRACTICE,
  difficulty = DifficultyId.MEDIUM,
  onBack,
  onQuit,
  onGameOver,
}: Props) {
  const { isOffline } = useNetworkStatus()
  const { t } = useTranslation()
  const gameLabels = getGameLabels(t)
  const modeLabels = getModeLabels(t)
  const user = useAuthStore((s) => s.user)
  const isGuest = user?.isGuest ?? true
  const gameType = initialGameType
  useEffect(() => {
    lobbyService.updatePresence('in-game').catch(() => {})
    return () => {
      lobbyService.updatePresence('online').catch(() => {})
    }
  }, [])

  const [phase, setPhase]             = useState<Phase>(Phase.IDLE)
  const [paused, setPaused]           = useState(false)
  const tutorialStorageKey = `gb_tutorial_seen_${gameType}_v1`
  const [showTutorial, setShowTutorial] = useState(() => {
    try {
      return localStorage.getItem(tutorialStorageKey) !== 'true'
    } catch {
      return true
    }
  })

  // Old record (highest level reached before this session), shown alongside
  // Level in the stat row so the player has something to beat while playing.
  // Reuses the same per-game stats already fetched on Game Select
  // (game-select.service.ts) rather than inventing a new endpoint/store.
  // undefined = hide the cell (guest / offline / not loaded yet — same
  // "don't show stale numbers" rule GameCard uses); null = loaded, no record yet.
  const [gameStats, setGameStats] = useState<GameStats | null | undefined>(undefined)

  // Resume-on-reload: durable progress only (level/streak/tallies), never
  // mid-round board state — see docs/technical/known-gaps.md "Resume-on-reload".
  // Read once at mount, never updated again; a stale/mismatched checkpoint
  // (different game/mode/difficulty) is ignored by loadGameplayCheckpoint itself.
  const checkpoint = useRef(loadGameplayCheckpoint(gameType, mode, difficulty)).current

  // Shared game state
  const [level, setLevel]         = useState(checkpoint?.level ?? 1)
  // Consecutive wins at the current level (docs: needs `roundsToWin` in a row to advance).
  const [winStreak, setWinStreak] = useState(checkpoint?.winStreak ?? 0)
  // Losses accumulated at the current level, not necessarily consecutive
  // (docs: "losing `times` rounds within the same level → Game Over" — the
  // doc doesn't say "consecutive" for this side, unlike the win-streak
  // wording, so this counts every loss at the level, resetting only when
  // the level changes).
  const [lossCount, setLossCount] = useState(checkpoint?.lossCount ?? 0)
  // Why the current 'wrong' phase happened — same flow/UI either way
  // (WrongToast), just a different reason line (see handleWrong below).
  const [wrongReason, setWrongReason] = useState<'incorrect' | 'timeout'>('incorrect')
  const [isRevealed, setIsRevealed] = useState(false)
  // Elo does not change here — docs/gameplay/README.md: "Elo System ...
  // calculated only for Versus Ranked matches." This screen is Solo only
  // (Versus has its own VersusGameplayScreen). Shown as read-only info.
  const elo = user?.elo ?? 1000
  const [timer, setTimer] = useState(30)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutTaskRef = useRef<PausableTimeoutTask | null>(null)
  const pausedRef = useRef(false)

  function clearScheduledTimeout() {
    const task = timeoutTaskRef.current
    if (task?.id) clearTimeout(task.id)
    timeoutTaskRef.current = null
  }

  function armScheduledTimeout() {
    const task = timeoutTaskRef.current
    if (!task || task.id || pausedRef.current) return
    task.startedAt = Date.now()
    task.id = setTimeout(() => {
      if (timeoutTaskRef.current !== task) return
      task.id = null
      timeoutTaskRef.current = null
      task.callback()
    }, task.remainingMs)
  }

  function scheduleTimeout(callback: () => void, delayMs: number) {
    clearScheduledTimeout()
    timeoutTaskRef.current = {
      id: null,
      callback,
      remainingMs: Math.max(0, delayMs),
      startedAt: Date.now(),
    }
    armScheduledTimeout()
  }

  function pauseGame() {
    pausedRef.current = true
    const task = timeoutTaskRef.current
    if (task?.id) {
      clearTimeout(task.id)
      task.id = null
      task.remainingMs = Math.max(0, task.remainingMs - (Date.now() - task.startedAt))
    }
    setPaused(true)
  }

  function resumeGame() {
    pausedRef.current = false
    setPaused(false)
    armScheduledTimeout()
  }

  // Session-wide tallies for the Scoring Formula (docs/gameplay/README.md §
  // Scoring Formula) — refs, not state, since nothing needs to re-render
  // off these; they're only read once, at game-over, in finishGame().
  const roundsClearedRef = useRef(checkpoint?.roundsCleared ?? 0)
  const maxConsecutiveItemsRef = useRef(checkpoint?.maxConsecutiveItems ?? 0)
  const bonusSecondsRef = useRef(checkpoint?.bonusSeconds ?? 0)
  const perfectRef = useRef(checkpoint?.perfect ?? true)
  const reachedMaxLevelRef = useRef(checkpoint?.reachedMaxLevel ?? false)

  function recordConsecutiveItems(count: number) {
    maxConsecutiveItemsRef.current = Math.max(maxConsecutiveItemsRef.current, count)
  }

  // Number Memory
  const [numSeq, setNumSeq]     = useState('')
  const [numAnswer, setNumAnswer] = useState('')

  // Alphabet Memory
  const [alphaSeq, setAlphaSeq]     = useState('')
  const [alphaAnswer, setAlphaAnswer] = useState('')

  // Grid Memory
  const [gridLit, setGridLit]       = useState<number[]>([])
  const [gridTapped, setGridTapped] = useState<number[]>([])
  const [gridWrongTile, setGridWrongTile] = useState<number | null>(null)
  // Whether any wrong tap happened this round — round is a loss even if
  // every remaining tile then gets tapped correctly (docs "Wrong-Tap Handling").
  const hasWrongSelectRef = useRef(false)

  // Sequence Memory
  const [seqSequence, setSeqSequence]   = useState<number[]>([])
  const [seqLit, setSeqLit]             = useState<number | null>(null)
  const [seqPressed, setSeqPressed]     = useState<number | null>(null)
  const [seqInput, setSeqInput]         = useState<number[]>([])

  // Color Memory
  const [colorSequence, setColorSequence] = useState<number[]>([])
  const [colorLit, setColorLit]           = useState<number | null>(null)
  const [colorPressed, setColorPressed]   = useState<number | null>(null)
  const [colorInput, setColorInput]       = useState<number[]>([])

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current)  clearInterval(timerRef.current)
      clearScheduledTimeout()
    }
  }, [])

  // Checkpoint durable progress at every round boundary (level/streak/loss
  // change together, always after the tally refs above are updated in
  // handleCorrect/handleWrong) so a reload mid-run resumes at the right spot.
  useEffect(() => {
    saveGameplayCheckpoint({
      gameType,
      mode,
      difficulty,
      level,
      winStreak,
      lossCount,
      roundsCleared: roundsClearedRef.current,
      maxConsecutiveItems: maxConsecutiveItemsRef.current,
      bonusSeconds: bonusSecondsRef.current,
      perfect: perfectRef.current,
      reachedMaxLevel: reachedMaxLevelRef.current,
    })
  }, [gameType, mode, difficulty, level, winStreak, lossCount])

  // Fetch this game's best-level record — docs/gameplay/README.md: guests
  // have "no server-side save", so there's nothing to show for them.
  useEffect(() => {
    if (isGuest) { setGameStats(undefined); return }
    let cancelled = false
    gameSelectService.getStats()
      .then((stats) => {
        if (cancelled) return
        setGameStats(stats.find((s) => s.id === gameType) ?? null)
      })
      .catch(() => { if (!cancelled) setGameStats(undefined) })
    return () => { cancelled = true }
  }, [gameType, isGuest])

  // Reset the countdown to the round's max when a new answering phase begins.
  useEffect(() => {
    if (phase === 'answering') {
      setTimer(getAnswerTimeSeconds(gameType, level, difficulty))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // Tick — separate from the reset above so going offline mid-answering
  // pauses the countdown instead of resetting it. Not a real
  // server-controlled timer (see docs/technical/known-gaps.md #3/#10) — this
  // only reacts to the real navigator online/offline signal.
  useEffect(() => {
    if (phase === 'answering' && !isOffline && !paused) {
      timerRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!)
            handleWrong('timeout')
            return 0
          }
          return t - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase, isOffline, paused])

  // ── Number Memory logic ──
  // docs/gameplay/number-memory.md: digits 1-9 (not 0), sampled with replacement.
  function buildNumSeq(len: number) {
    return Array.from({ length: len }, () => 1 + Math.floor(Math.random() * 9)).join('')
  }

  function startNumberRound(lvl: number) {
    const { length } = getLinearLevel(NUMBER_LEVELS, lvl)
    const seq = buildNumSeq(length)
    setNumSeq(seq)
    setNumAnswer('')
    setPhase(Phase.VIEWING)
    const viewMs = Math.max(800, seq.length * 600) + DIFFICULTY_SECONDS[difficulty] * 1000
    scheduleTimeout(() => setPhase(Phase.ANSWERING), viewMs)
  }

  function handleNumKey(k: string) {
    if (phase !== Phase.ANSWERING) return
    const next = numAnswer + k
    setNumAnswer(next)
    if (numAnswer === numSeq.slice(0, numAnswer.length) && k === numSeq[numAnswer.length]) {
      recordConsecutiveItems(next.length)
    }
    if (next.length === numSeq.length) {
      if (next === numSeq) {
        handleCorrect()
      } else {
        handleWrong()
      }
    }
  }

  function handleNumDelete() {
    setNumAnswer((a) => a.slice(0, -1))
  }

  // ── Alphabet Memory logic ──
  // docs/gameplay/alphabet-memory.md: digits 0-9 + letters A-Z (36 chars).
  const ALPHA_CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  function buildAlphaSeq(len: number) {
    return Array.from({ length: len }, () => ALPHA_CHARSET[Math.floor(Math.random() * ALPHA_CHARSET.length)]).join('')
  }

  function startAlphaRound(lvl: number) {
    const { length } = getLinearLevel(ALPHABET_LEVELS, lvl)
    const seq = buildAlphaSeq(length)
    setAlphaSeq(seq)
    setAlphaAnswer('')
    setPhase(Phase.VIEWING)
    const viewMs = Math.max(800, seq.length * 650) + DIFFICULTY_SECONDS[difficulty] * 1000
    scheduleTimeout(() => setPhase(Phase.ANSWERING), viewMs)
  }

  function handleAlphaKey(k: string) {
    if (phase !== Phase.ANSWERING) return
    const next = alphaAnswer + k
    setAlphaAnswer(next)
    if (alphaAnswer === alphaSeq.slice(0, alphaAnswer.length) && k === alphaSeq[alphaAnswer.length]) {
      recordConsecutiveItems(next.length)
    }
    if (next.length === alphaSeq.length) {
      if (next === alphaSeq) {
        handleCorrect()
      } else {
        handleWrong()
      }
    }
  }

  function handleAlphaDelete() {
    setAlphaAnswer((a) => a.slice(0, -1))
  }

  // ── Grid Memory logic ──
  function buildGridLit(beginCount: number, totalCells: number) {
    const tiles: number[] = []
    while (tiles.length < beginCount) {
      const t = Math.floor(Math.random() * totalCells)
      if (!tiles.includes(t)) tiles.push(t)
    }
    return tiles
  }

  function startGridRound(lvl: number) {
    const cfg = getGridLevel(lvl)
    const totalCells = cfg.xAxis * cfg.yAxis
    const lit = buildGridLit(cfg.beginCount, totalCells)
    hasWrongSelectRef.current = false
    setGridLit(lit)
    setGridTapped([])
    setGridWrongTile(null)
    setPhase(Phase.VIEWING)
    const viewMs = (GRID_VIEW_TIME_SECONDS + DIFFICULTY_SECONDS[difficulty]) * 1000
    scheduleTimeout(() => {
      // Numbers are hidden during answering by the render below (passes []
      // to GridBoard while phase === 'answering') — the `gridLit` state
      // itself must stay intact, it's what handleGridTap checks taps against.
      setPhase(Phase.ANSWERING)
    }, viewMs)
  }

  function handleGridTap(i: number) {
    if (phase !== Phase.ANSWERING) return
    const cfg = getGridLevel(level)
    // gridLit[0] is the cell assigned "1", gridLit[1] is "2", etc. (the
    // order the player was shown, not sorted by cell index) — the correct
    // next tap is whichever cell holds the next number.
    const expectedNext = gridLit[gridTapped.length]

    if (i !== expectedNext) {
      // docs/gameplay/grid-memory.md "Wrong-Tap Handling": flash the cell,
      // subtract the penalty from remaining time, flag the round as a loss
      // — but let the player keep going rather than ending immediately.
      hasWrongSelectRef.current = true
      setGridWrongTile(i)
      scheduleTimeout(() => setGridWrongTile(null), 300)
      setTimer((t) => Math.max(0, t - GRID_WRONG_TAP_PENALTY_SECONDS))
      return
    }

    const next = [...gridTapped, i]
    setGridTapped(next)
    recordConsecutiveItems(next.length)
    if (next.length === cfg.beginCount) {
      if (hasWrongSelectRef.current) {
        handleWrong()
      } else {
        handleCorrect()
      }
    }
  }

  // ── Sequence Memory logic ──
  function playSeqSequence(seq: number[], onDone: () => void) {
    setPhase(Phase.VIEWING)
    let i = 0
    function flash() {
      if (i >= seq.length) { setSeqLit(null); scheduleTimeout(onDone, SEQUENCE_GAP_MS); return }
      setSeqLit(seq[i])
      scheduleTimeout(() => {
        setSeqLit(null)
        scheduleTimeout(() => { i++; flash() }, SEQUENCE_GAP_MS)
      }, SEQUENCE_FLASH_MS)
    }
    flash()
  }

  function startSeqRound(lvl: number) {
    const { length } = getLinearLevel(SEQUENCE_LEVELS, lvl)
    const newSeq = Array.from({ length }, () => Math.floor(Math.random() * SEQUENCE_TILE_COUNT))
    setSeqSequence(newSeq)
    setSeqInput([])
    setSeqPressed(null)
    playSeqSequence(newSeq, () => setPhase(Phase.ANSWERING))
  }

  function handleSeqTap(id: number) {
    if (phase !== Phase.ANSWERING) return
    const next = [...seqInput, id]
    const pos = next.length - 1
    setSeqPressed(id)
    scheduleTimeout(() => setSeqPressed(null), 180)

    if (next[pos] !== seqSequence[pos]) {
      handleWrong(); return
    }
    recordConsecutiveItems(next.length)
    setSeqInput(next)
    if (next.length === seqSequence.length) handleCorrect()
  }

  // ── Color Memory logic ──
  // docs/gameplay/color-memory.md — same flash/replay structure as Sequence
  // Memory, but colorCount grows with level too (see game-rules.ts).
  function playColorSequence(seq: number[], onDone: () => void) {
    setPhase(Phase.VIEWING)
    let i = 0
    function flash() {
      if (i >= seq.length) { setColorLit(null); scheduleTimeout(onDone, COLOR_GAP_MS); return }
      setColorLit(seq[i])
      scheduleTimeout(() => {
        setColorLit(null)
        scheduleTimeout(() => { i++; flash() }, COLOR_GAP_MS)
      }, COLOR_FLASH_MS)
    }
    flash()
  }

  function startColorRound(lvl: number) {
    const cfg = getColorLevel(lvl)
    const newSeq = Array.from({ length: cfg.length }, () => Math.floor(Math.random() * cfg.colorCount))
    setColorSequence(newSeq)
    setColorInput([])
    setColorPressed(null)
    playColorSequence(newSeq, () => setPhase(Phase.ANSWERING))
  }

  function handleColorTap(id: number) {
    if (phase !== Phase.ANSWERING) return
    const next = [...colorInput, id]
    const pos = next.length - 1
    setColorPressed(id)
    scheduleTimeout(() => setColorPressed(null), 180)

    if (next[pos] !== colorSequence[pos]) {
      handleWrong(); return
    }
    recordConsecutiveItems(next.length)
    setColorInput(next)
    if (next.length === colorSequence.length) handleCorrect()
  }

  // ── Shared correct / wrong ──
  // Level-advance and Game Over both key off the same per-level
  // `roundsToWin` threshold (docs: N consecutive wins to advance; losing N
  // rounds at the level ends the run).
  function handleCorrect() {
    hapticFeedback.success()
    soundEffects.correct()
    setPhase(Phase.CORRECT)
    roundsClearedRef.current += 1
    bonusSecondsRef.current += Math.max(0, timer)
    const roundsToWin = getRoundsToWin(gameType, level)
    const nextWinStreak = winStreak + 1
    setWinStreak(nextWinStreak)
    scheduleTimeout(() => {
      if (nextWinStreak >= roundsToWin) {
        if (level >= 10) {
          reachedMaxLevelRef.current = true
          finishGame()
          return
        }
        const nextLevel = clampLevel(level + 1)
        setLevel(nextLevel)
        setWinStreak(0)
        setLossCount(0)
        startRound(nextLevel)
      } else {
        startRound(level)
      }
    }, 1200)
  }

  function handleWrong(reason: 'incorrect' | 'timeout' = 'incorrect') {
    hapticFeedback.error()
    soundEffects.wrong()
    setPhase(Phase.WRONG)
    setWrongReason(reason)
    setWinStreak(0)
    setLossCount((c) => c + 1)
    perfectRef.current = false
  }

  const isGameOver = lossCount >= getRoundsToWin(gameType, level)

  // Package this session's tallies for Result — docs/gameplay/README.md §
  // Scoring Formula. Result itself submits this and shows the computed score.
  function finishGame() {
    clearGameplayCheckpoint()
    onGameOver?.({
      game: gameType,
      mode,
      difficulty,
      levelReached: level,
      roundsCleared: roundsClearedRef.current,
      maxConsecutiveItems: maxConsecutiveItemsRef.current,
      bonusSeconds: bonusSecondsRef.current,
      perfect: perfectRef.current,
      completedAllLevels: reachedMaxLevelRef.current,
    })
  }

  // ── Unified round start ──
  function startRound(lvl = level) {
    clearScheduledTimeout()
    setIsRevealed(false)
    if (gameType === GameId.NUMBER)   startNumberRound(lvl)
    if (gameType === GameId.ALPHABET) startAlphaRound(lvl)
    if (gameType === GameId.GRID)     startGridRound(lvl)
    if (gameType === GameId.SEQUENCE) startSeqRound(lvl)
    if (gameType === GameId.COLOR)    startColorRound(lvl)
  }

  // Skip the rest of Viewing for Number/Alphabet/Grid — cancels the pending
  // auto-transition timeout and jumps straight to Answering (see PromptBar's
  // SKIPPABLE_VIEWING_GAMES for why this is scoped to those 3 games).
  function skipViewing() {
    if (phase !== Phase.VIEWING) return
    if (![GameId.NUMBER, GameId.ALPHABET, GameId.GRID].includes(gameType)) return
    clearScheduledTimeout()
    setPhase(Phase.ANSWERING)
  }

  function replayAnswer(
    sequence: number[],
    setLit: (value: number | null) => void,
    flashMs: number,
    gapMs: number,
  ) {
    let index = 0
    function flashNext() {
      if (index >= sequence.length) {
        setLit(null)
        clearScheduledTimeout()
        return
      }
      setLit(sequence[index])
      scheduleTimeout(() => {
        setLit(null)
        scheduleTimeout(() => {
          index += 1
          flashNext()
        }, gapMs)
      }, flashMs)
    }
    flashNext()
  }

  function revealAnswer() {
    setIsRevealed(true)
    if (gameType === GameId.SEQUENCE) {
      replayAnswer(seqSequence, setSeqLit, SEQUENCE_FLASH_MS, SEQUENCE_GAP_MS)
    }
    if (gameType === GameId.COLOR) {
      replayAnswer(colorSequence, setColorLit, COLOR_FLASH_MS, COLOR_GAP_MS)
    }
  }

  function completeTutorial() {
    try {
      localStorage.setItem(tutorialStorageKey, 'true')
    } catch {}
    setShowTutorial(false)
  }

  function resetRound() {
    clearGameplayCheckpoint()
    clearScheduledTimeout()
    if (timerRef.current) clearInterval(timerRef.current)
    pausedRef.current = false
    setPaused(false)
    setIsRevealed(false)
    setPhase(Phase.IDLE)
    setLevel(1)
    setWinStreak(0)
    setLossCount(0)
    setNumAnswer('')
    setAlphaAnswer('')
    setGridTapped([])
    setGridLit([])
    setGridWrongTile(null)
    setSeqInput([])
    setSeqLit(null)
    setColorInput([])
    setColorLit(null)
    hasWrongSelectRef.current = false
    roundsClearedRef.current = 0
    maxConsecutiveItemsRef.current = 0
    bonusSecondsRef.current = 0
    perfectRef.current = true
    reachedMaxLevelRef.current = false
  }

  const maxTimer = getAnswerTimeSeconds(gameType, level, difficulty)
  const gridCfg = gameType === GameId.GRID ? getGridLevel(level) : null

  return (
    <div className="relative flex min-h-dvh flex-col" style={{ background: 'var(--ma-bg)' }}>

      {/* ── HEADER ── */}
      <GameplayHeader
        title={gameLabels[gameType]}
        subtitle={modeLabels[mode]}
        pauseDisabled={phase === Phase.IDLE}
        onBack={onBack}
        onPause={() => { if (phase !== Phase.IDLE) pauseGame() }}
      />

      {/* ── WRONG TOAST — same on all 5 games, screen-level so boards don't
          each need their own wrong styling. "Try Again"/"See Result" mirrors
          PromptBar's Wrong-phase button; "Back" returns to Game Select, same
          as the header's back button (App.tsx wires onBack → game-select,
          separately from onQuit → home). ── */}
      <WrongToast
        phase={phase}
        reason={wrongReason}
        isGameOver={isGameOver}
        isPractice={mode === ModeId.SOLO_PRACTICE}
        onTryAgain={() => { isGameOver ? finishGame() : startRound(level) }}
        onRevealAnswer={revealAnswer}
        onBack={() => { resetRound(); onBack?.() }}
      />

      {/* ── OFFLINE BANNER ──
          Solo Practice/Ranked run entirely client-side, so play continues
          offline — this is informational only, doesn't block anything.
          (docs/ui/screen-interface-spec.md also describes a Reconnect/Retry
          error state for losing connection to a *server-controlled* timer —
          not wired here since Solo doesn't have a server timer yet; see
          docs/technical/known-gaps.md's server-controlled-timer requirement.) */}
      {isOffline && (
        <div className="px-4 pt-1">
          <StatusBanner variant="offline" message={t.gameplayScreen.offlineBanner} />
        </div>
      )}

      {/* ── MAIN ── */}
      <main
        id="main-content"
        className="flex flex-1 flex-col gap-4 px-4 pb-20"
      >
        {/* Phase banner — badge + border ring show the live countdown once answering starts */}
        <PhaseBanner phase={phase} seconds={phase === 'answering' ? timer : undefined} max={maxTimer} />

        {/* Stat row */}
        <StatRow
          level={level}
          streak={winStreak}
          elo={elo}
          bestLevel={gameStats === undefined ? undefined : (gameStats?.highestLevel ?? null)}
        />

        {/* Revealed answer banner (Solo Practice) */}
        {isRevealed && (gameType === GameId.NUMBER || gameType === GameId.ALPHABET) && (
          <div
            className="mx-auto flex w-full max-w-xs flex-col items-center justify-center gap-1 rounded-2xl p-3 text-center animate-in fade-in duration-200"
            style={{
              background: 'oklch(0.55 0.12 140 / 0.15)',
              border: '1px solid oklch(0.55 0.12 140 / 0.35)',
              boxShadow: 'var(--ma-shadow-sm)',
            }}
          >
            <span className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ma-fg-subtle)' }}>
              {t.wrongToast.correctAnswer}
            </span>
            <span className="text-[20px] font-bold tracking-widest font-mono" style={{ color: 'var(--ma-brand)' }}>
              {gameType === GameId.NUMBER ? numSeq : alphaSeq}
            </span>
          </div>
        )}

        {/* Board area */}
        <div className="flex flex-1 flex-col items-center gap-4">

          {/* Game boards */}
          {gameType === 'sequence' && (
            <SequenceBoard
              litTile={seqLit}
              pressedTile={seqPressed}
              onTap={handleSeqTap}
              phase={phase}
            />
          )}

          {gameType === 'grid' && gridCfg && (
            <GridBoard
              xAxis={gridCfg.xAxis}
              yAxis={gridCfg.yAxis}
              litTiles={phase === 'viewing' || isRevealed ? gridLit : (phase === 'answering' ? [] : gridLit)}
              tappedTiles={gridTapped}
              wrongTile={gridWrongTile}
              onTap={handleGridTap}
              phase={isRevealed ? Phase.CORRECT : phase}
            />
          )}

          {gameType === 'number' && (
            <NumberBoard
              viewingValue={numSeq}
              answer={numAnswer}
              onKey={handleNumKey}
              onDelete={handleNumDelete}
              phase={phase}
            />
          )}

          {gameType === 'alphabet' && (
            <AlphabetBoard
              viewingValue={alphaSeq}
              answer={alphaAnswer}
              onKey={handleAlphaKey}
              onDelete={handleAlphaDelete}
              phase={phase}
            />
          )}

          {gameType === 'color' && (
            <ColorBoard
              colorCount={getColorLevel(level).colorCount}
              litTile={colorLit}
              pressedTile={colorPressed}
              onTap={handleColorTap}
              phase={phase}
            />
          )}
        </div>

        {/* Bottom prompt bar */}
        <div className="mt-auto">
          <PromptBar
            phase={phase}
            onStart={() => startRound(level)}
            gameType={gameType}
            isGameOver={isGameOver}
            onGameOver={finishGame}
            onSkip={skipViewing}
          />
        </div>
      </main>

      {/* ── PAUSE OVERLAY ── */}
      {paused && (
        <PauseOverlay
          gameType={gameType}
          mode={mode}
          onResume={resumeGame}
          onReset={resetRound}
          onQuit={() => { resetRound(); onQuit?.() }}
        />
      )}

      {/* ── OFFLINE PAUSE OVERLAY ──
          Only while a timed answering round is actually at risk — the
          top banner above already covers being offline in every other
          phase, so this doesn't duplicate it there. */}
      {isOffline && phase === 'answering' && !paused && (
        <OfflinePauseOverlay onQuit={() => { resetRound(); onQuit?.() }} />
      )}

      {/* ── TUTORIAL OVERLAY ── */}
      {showTutorial && phase === 'idle' && (
        <TutorialOverlay
          gameType={gameType}
          onDone={completeTutorial}
        />
      )}
    </div>
  )
}
