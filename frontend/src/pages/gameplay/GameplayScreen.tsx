import { useState, useEffect, useRef } from 'react'

import { StatusBanner } from '@/components/ui/StatusBanner'
import { NumberBoard, AlphabetBoard, GridBoard, SequenceBoard } from '@/components/ui/gameplay'
import { ScreenState, GameId, ModeId, Phase } from '@/configs/enum'
import { StatePill } from './components/StatePill'
import { GameTypePill } from './components/GameTypePill'
import { CountdownRing } from './components/CountdownRing'
import { PhaseBanner } from './components/PhaseBanner'
import { StatRow } from './components/StatRow'
import { PauseOverlay } from './components/PauseOverlay'
import { TutorialOverlay } from './components/TutorialOverlay'
import { LoadingSkeleton } from './components/LoadingSkeleton'
import { ErrorState } from './components/ErrorState'
import { PromptBar } from './components/PromptBar'
import { GameplayHeader, GameplayHeaderSkeleton } from './components/GameplayHeader'
import { GAME_LABELS, MODE_LABELS } from '@/services/gameplay/gameplay-screen.types'

interface Props {
  gameType?: GameId
  mode?: ModeId
  onBack?: () => void
  onQuit?: () => void
  /** Ranked run ended (first wrong answer) — navigate to Result. Not used in Practice, which retries the level instead. */
  onGameOver?: () => void
}

// ─── Main export ───────────────────────────────────────────────────
export function GameplayScreen({
  gameType: initialGameType = GameId.SEQUENCE,
  mode = ModeId.SOLO_PRACTICE,
  onBack,
  onQuit,
  onGameOver,
}: Props) {
  const [screenState, setScreenState] = useState<ScreenState>(ScreenState.NORMAL)
  const [gameType, setGameType]       = useState<GameId>(initialGameType)
  const [phase, setPhase]             = useState<Phase>(Phase.IDLE)
  const [paused, setPaused]           = useState(false)
  const [showTutorial, setShowTutorial] = useState(true)

  // Shared game state
  const [level, setLevel]   = useState(1)
  const [streak, setStreak] = useState(0)
  const [elo, setElo]       = useState(1240)
  const [timer, setTimer]   = useState(30)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Number Memory
  const [numSeq, setNumSeq]     = useState('')
  const [numAnswer, setNumAnswer] = useState('')

  // Alphabet Memory
  const [alphaSeq, setAlphaSeq]     = useState('')
  const [alphaAnswer, setAlphaAnswer] = useState('')
  const [alphaIdx, setAlphaIdx] = useState(0)

  // Grid Memory
  const [gridLit, setGridLit]       = useState<number[]>([])
  const [gridTapped, setGridTapped] = useState<number[]>([])

  // Sequence Memory
  const [seqSequence, setSeqSequence]   = useState<number[]>([])
  const [seqLit, setSeqLit]             = useState<number | null>(null)
  const [seqPressed, setSeqPressed]     = useState<number | null>(null)
  const [seqInput, setSeqInput]         = useState<number[]>([])

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current)  clearInterval(timerRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  // Timer — runs during answering phase
  useEffect(() => {
    if (phase === 'answering' && screenState === 'normal') {
      const maxTime = 10 + level * 3
      setTimer(maxTime)
      timerRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!)
            handleWrong()
            return 0
          }
          return t - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase, screenState])

  // ── Number Memory logic ──
  function buildNumSeq(len: number) {
    return Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join('')
  }

  function startNumberRound(len: number) {
    const seq = buildNumSeq(len)
    setNumSeq(seq)
    setNumAnswer('')
    setPhase(Phase.VIEWING)
    // show each digit for 0.7s, then switch to answering
    const viewMs = Math.max(800, seq.length * 600)
    timeoutRef.current = setTimeout(() => setPhase(Phase.ANSWERING), viewMs)
  }

  function handleNumKey(k: string) {
    if (phase !== Phase.ANSWERING) return
    const next = numAnswer + k
    setNumAnswer(next)
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
  function buildAlphaSeq(len: number) {
    return Array.from({ length: len }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('')
  }

  function startAlphaRound(len: number) {
    const seq = buildAlphaSeq(len)
    setAlphaSeq(seq)
    setAlphaAnswer('')
    setAlphaIdx(0)
    setPhase(Phase.VIEWING)
    const viewMs = Math.max(800, seq.length * 650)
    timeoutRef.current = setTimeout(() => setPhase(Phase.ANSWERING), viewMs)
  }

  function handleAlphaKey(k: string) {
    if (phase !== Phase.ANSWERING) return
    const next = alphaAnswer + k
    setAlphaAnswer(next)
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
  function buildGridLit(len: number, cols: number) {
    const total = cols * cols
    const tiles: number[] = []
    while (tiles.length < len) {
      const t = Math.floor(Math.random() * total)
      if (!tiles.includes(t)) tiles.push(t)
    }
    return tiles
  }

  function startGridRound(len: number) {
    const cols = Math.min(3 + Math.floor(len / 4), 5)
    const lit = buildGridLit(len, cols)
    setGridLit(lit)
    setGridTapped([])
    setPhase(Phase.VIEWING)
    timeoutRef.current = setTimeout(() => {
      setGridLit([]) // hide during answering — player must remember
      setPhase(Phase.ANSWERING)
    }, 1200 + len * 400)
  }

  function handleGridTap(i: number) {
    if (phase !== Phase.ANSWERING) return
    const next = [...gridTapped, i]
    setGridTapped(next)
    if (next.length === gridLit.length) {
      // check ascending order of original gridLit
      const sorted = [...gridLit].sort((a, b) => a - b)
      const correct = next.every((v, idx) => v === sorted[idx])
      if (correct) {
        setGridLit(sorted) // reveal for correct flash
        handleCorrect()
      } else {
        handleWrong()
      }
    }
  }

  // ── Sequence Memory logic ──
  const SEQ_SPEED = 600
  function playSeqSequence(seq: number[], onDone: () => void) {
    setPhase(Phase.VIEWING)
    let i = 0
    function flash() {
      if (i >= seq.length) { setSeqLit(null); timeoutRef.current = setTimeout(onDone, 300); return }
      setSeqLit(seq[i])
      timeoutRef.current = setTimeout(() => {
        setSeqLit(null)
        timeoutRef.current = setTimeout(() => { i++; flash() }, 200)
      }, SEQ_SPEED)
    }
    flash()
  }

  function startSeqRound(seq: number[]) {
    setSeqInput([])
    setSeqPressed(null)
    playSeqSequence(seq, () => setPhase(Phase.ANSWERING))
  }

  function handleSeqTap(id: number) {
    if (phase !== Phase.ANSWERING) return
    const next = [...seqInput, id]
    const pos = next.length - 1
    setSeqPressed(id)
    timeoutRef.current = setTimeout(() => setSeqPressed(null), 180)

    if (next[pos] !== seqSequence[pos]) {
      handleWrong(); return
    }
    setSeqInput(next)
    if (next.length === seqSequence.length) handleCorrect()
  }

  // ── Shared correct / wrong ──
  function handleCorrect() {
    setPhase(Phase.CORRECT)
    setStreak((s) => s + 1)
    setElo((e) => e + 12)
    timeoutRef.current = setTimeout(() => {
      const nextLevel = level + 1
      setLevel(nextLevel)
      startRound(nextLevel)
    }, 1200)
  }

  function handleWrong() {
    setPhase(Phase.WRONG)
    setStreak(0)
    setElo((e) => Math.max(800, e - 8))
  }

  // ── Unified round start ──
  function startRound(lvl = level) {
    if (gameType === GameId.NUMBER)   startNumberRound(lvl + 2)
    if (gameType === GameId.ALPHABET) startAlphaRound(lvl + 1)
    if (gameType === GameId.GRID)     startGridRound(lvl + 2)
    if (gameType === GameId.SEQUENCE) {
      const newSeq = Array.from({ length: lvl + 2 }, () => Math.floor(Math.random() * 4))
      setSeqSequence(newSeq)
      startSeqRound(newSeq)
    }
  }

  function resetRound() {
    setPhase(Phase.IDLE)
    setLevel(1)
    setStreak(0)
    setNumAnswer('')
    setAlphaAnswer('')
    setGridTapped([])
    setSeqInput([])
  }

  const isNormal  = screenState === ScreenState.NORMAL
  const isLoading = screenState === ScreenState.LOADING
  const isError   = screenState === ScreenState.ERROR
  const isOffline = screenState === ScreenState.OFFLINE
  const maxTimer  = 10 + level * 3

  return (
    <div className="relative flex min-h-dvh flex-col" style={{ background: 'var(--ma-bg)' }}>

      {/* ── Prototype controls ── */}
      <StatePill current={screenState} onChange={(s) => { setScreenState(s); if (s === ScreenState.NORMAL) setPhase(Phase.IDLE) }} />
      <GameTypePill current={gameType} onChange={(g) => { setGameType(g); setPhase(Phase.IDLE); setShowTutorial(true) }} />

      {/* ── HEADER ── */}
      {!isLoading && !isError && (
        <GameplayHeader
          title={GAME_LABELS[gameType]}
          subtitle={MODE_LABELS[mode]}
          pauseDisabled={phase === Phase.IDLE}
          onBack={onBack}
          onPause={() => { if (phase !== Phase.IDLE) setPaused(true) }}
        />
      )}

      {/* Loading header placeholder */}
      {isLoading && <GameplayHeaderSkeleton />}

      {/* ── OFFLINE BANNER ── */}
      {isOffline && (
        <div className="px-4 pt-1">
          <StatusBanner variant="offline" message="You're offline — scores won't sync until reconnected." />
        </div>
      )}

      {/* ── MAIN ── */}
      <main
        id="main-content"
        className={['flex flex-1 flex-col', isLoading || isError ? '' : 'gap-4 px-4 pb-20'].join(' ')}
      >
        {isLoading && <LoadingSkeleton />}
        {isError   && <ErrorState onRetry={() => setScreenState(ScreenState.NORMAL)} />}

        {(isNormal || isOffline) && (
          <>
            {/* Phase banner */}
            <PhaseBanner phase={phase} />

            {/* Stat row */}
            <StatRow level={level} streak={streak} elo={elo} />

            {/* Countdown + board area */}
            <div className="flex flex-1 flex-col items-center gap-4">

              {/* Countdown — shown during answering */}
              {phase === 'answering' && (
                <CountdownRing seconds={timer} max={maxTimer} />
              )}

              {/* Game boards */}
              {gameType === 'sequence' && (
                <SequenceBoard
                  litTile={seqLit}
                  pressedTile={seqPressed}
                  onTap={handleSeqTap}
                  phase={phase}
                />
              )}

              {gameType === 'grid' && (
                <GridBoard
                  level={level}
                  litTiles={phase === 'viewing' ? gridLit : (phase === 'answering' ? [] : gridLit)}
                  tappedTiles={gridTapped}
                  onTap={handleGridTap}
                  phase={phase}
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
            </div>

            {/* Bottom prompt bar */}
            <div className="mt-auto">
              <PromptBar
                phase={phase}
                onStart={() => startRound(level)}
                gameType={gameType}
                mode={mode}
                onGameOver={onGameOver}
              />
            </div>
          </>
        )}
      </main>

      {/* ── PAUSE OVERLAY ── */}
      {paused && (
        <PauseOverlay
          gameType={gameType}
          mode={mode}
          onResume={() => setPaused(false)}
          onReset={() => { setPaused(false); resetRound() }}
          onSettings={() => { setPaused(false) }}
          onQuit={() => { setPaused(false); resetRound(); onQuit?.() }}
        />
      )}

      {/* ── TUTORIAL OVERLAY ── */}
      {showTutorial && phase === 'idle' && isNormal && (
        <TutorialOverlay
          gameType={gameType}
          onDone={() => setShowTutorial(false)}
        />
      )}
    </div>
  )
}
