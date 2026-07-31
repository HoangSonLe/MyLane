import { useState, useEffect, useCallback, useRef } from 'react'

import { BottomNavBar } from '@/components/ui/BottomNavBar'
import { StatePill } from './components/StatePill'
import { ScreenState } from '@/configs/enum'
import { EmptyState } from './components/EmptyState'
import { ErrorState } from './components/ErrorState'
import { OfflineBanner } from './components/OfflineBanner'
import { ProgressDots } from './components/ProgressDots'
import { ScoreBadge } from './components/ScoreBadge'
import { PhaseLabel } from './components/PhaseLabel'
import { GameTile } from './components/GameTile'
import { LoadingSkeleton } from './components/LoadingSkeleton'
import { ResultChip } from './components/ResultChip'
import type { GamePhase, Tile } from '@/services/game/game-screen.types'

// ─── Constants ─────────────────────────────────────────────────
const TILES: Tile[] = [
  { id: 0, color: 'amber' },
  { id: 1, color: 'teal' },
  { id: 2, color: 'rose' },
  { id: 3, color: 'violet' },
]

// ─── Inline icons ───────────────────────────────────────────────
function IconChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconPause() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="6" y="4" width="4" height="16" rx="1.5" fill="currentColor" />
      <rect x="14" y="4" width="4" height="16" rx="1.5" fill="currentColor" />
    </svg>
  )
}
function IconSpinner() {
  return (
    <svg className="animate-spin" width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// ─── Main game screen ──────────────────────────────────────────
export function SequenceMemoryScreen() {
  const [screenState, setScreenState] = useState<ScreenState>(ScreenState.NORMAL)

  const [phase, setPhase] = useState<GamePhase>('idle')
  const [sequence, setSequence] = useState<number[]>([])
  const [litTile, setLitTile] = useState<number | null>(null)
  const [inputQueue, setInputQueue] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(12)
  const [round, setRound] = useState(1)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const SPEED = 600

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [])

  const playback = useCallback((seq: number[], onDone: () => void) => {
    setPhase('watching')
    let i = 0
    function flash() {
      if (i >= seq.length) {
        setLitTile(null)
        timeoutRef.current = setTimeout(onDone, 300)
        return
      }
      setLitTile(seq[i])
      timeoutRef.current = setTimeout(() => {
        setLitTile(null)
        timeoutRef.current = setTimeout(() => {
          i++
          flash()
        }, 200)
      }, SPEED)
    }
    flash()
  }, [])

  function startRound(seq: number[]) {
    setInputQueue([])
    playback(seq, () => setPhase('input'))
  }

  function handleStart() {
    const first = Math.floor(Math.random() * 4)
    const newSeq = [first]
    setSequence(newSeq)
    setRound(1)
    setScore(0)
    startRound(newSeq)
  }

  function handleTilePress(id: number) {
    if (phase !== 'input') return
    const next = [...inputQueue, id]
    const pos = next.length - 1

    if (next[pos] !== sequence[pos]) {
      setPhase('fail')
      setLitTile(id)
      timeoutRef.current = setTimeout(() => {
        setLitTile(null)
        setPhase('idle')
        setSequence([])
        setInputQueue([])
      }, 1400)
      return
    }

    setInputQueue(next)
    setLitTile(id)
    timeoutRef.current = setTimeout(() => setLitTile(null), 180)

    if (next.length === sequence.length) {
      const newScore = score + sequence.length * 10
      setScore(newScore)
      if (newScore > best) setBest(newScore)
      setPhase('success')
      timeoutRef.current = setTimeout(() => {
        const newSeq = [...sequence, Math.floor(Math.random() * 4)]
        setRound((r) => r + 1)
        setSequence(newSeq)
        startRound(newSeq)
      }, 900)
    }
  }

  const pressable = phase === 'input'
  const inputLeft = sequence.length - inputQueue.length

  const isNormal  = screenState === ScreenState.NORMAL
  const isLoading = screenState === ScreenState.LOADING
  const isEmpty   = screenState === ScreenState.EMPTY
  const isError   = screenState === ScreenState.ERROR
  const isOffline = screenState === ScreenState.OFFLINE

  return (
    <div className="relative flex min-h-dvh flex-col bg-[var(--ma-bg)]">
      <StatePill current={screenState} onChange={setScreenState} />

      {/* ── HEADER ── */}
      {!isLoading && !isEmpty && !isError && (
        <header className="flex items-center justify-between px-4 pb-2 pt-16">
          <button
            type="button"
            aria-label="Back"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ma-surface)] text-[var(--ma-fg-muted)] transition-colors active:bg-[var(--ma-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
            style={{ boxShadow: 'var(--ma-shadow-sm)' }}
          >
            <IconChevronLeft />
          </button>

          <div className="text-center">
            <h1 className="text-sm font-bold tracking-tight text-[var(--ma-fg)]">
              Sequence Memory
            </h1>
            <p className="text-[11px] text-[var(--ma-fg-muted)]">Round {round}</p>
          </div>

          <button
            type="button"
            aria-label="Pause game"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ma-surface)] text-[var(--ma-fg-muted)] transition-colors active:bg-[var(--ma-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
            style={{ boxShadow: 'var(--ma-shadow-sm)' }}
          >
            <IconPause />
          </button>
        </header>
      )}

      {/* Loading header placeholder */}
      {isLoading && (
        <header className="flex items-center justify-between px-4 pb-2 pt-16">
          <div className="skeleton h-10 w-10 rounded-xl" />
          <div className="skeleton h-10 w-32 rounded-xl" />
          <div className="skeleton h-10 w-10 rounded-xl" />
        </header>
      )}

      {/* Offline banner */}
      {isOffline && !isLoading && <OfflineBanner />}

      {/* ── MAIN ── */}
      <main
        id="main-content"
        className={[
          'flex flex-1 flex-col',
          isLoading || isEmpty || isError ? '' : 'gap-4 px-4 pb-32',
        ].join(' ')}
      >
        {isLoading && <LoadingSkeleton />}
        {isEmpty && <EmptyState onStart={() => { setScreenState(ScreenState.NORMAL); handleStart() }} />}
        {isError && <ErrorState onRetry={() => setScreenState(ScreenState.NORMAL)} />}

        {(isNormal || isOffline) && (
          <>
            <div className="flex items-center justify-between pt-2">
              <ScoreBadge score={score} best={best} />
              <ProgressDots total={6} current={Math.min(round - 1, 6)} />
            </div>

            <PhaseLabel phase={phase} inputLeft={inputLeft} inputTotal={sequence.length} />

            <div
              className="relative mt-1 grid grid-cols-2 gap-4"
              aria-label="Game board"
              role="group"
            >
              {TILES.map((tile) => (
                <GameTile
                  key={tile.id}
                  tile={tile}
                  lit={litTile === tile.id}
                  pressable={pressable}
                  onPress={handleTilePress}
                />
              ))}
              <ResultChip phase={phase} />
            </div>

            <div className="mt-auto pt-2">
              {phase === 'idle' || phase === 'fail' ? (
                <button
                  type="button"
                  onClick={handleStart}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--ma-brand)] py-4 text-[15px] font-semibold text-[var(--ma-brand-fg)] transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
                  style={{ boxShadow: 'var(--ma-shadow-md)' }}
                >
                  {phase === 'fail' ? 'Play again' : 'Start'}
                </button>
              ) : phase === 'watching' ? (
                <div className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[var(--ma-surface)] py-4 text-[15px] font-semibold text-[var(--ma-fg-muted)]">
                  <IconSpinner />
                  <span>Watch the sequence…</span>
                </div>
              ) : phase === 'input' ? (
                <div
                  className="flex w-full items-center justify-center rounded-2xl py-4 text-[15px] font-semibold text-[var(--ma-brand)]"
                  style={{ background: 'oklch(0.78 0.16 75 / 0.1)', border: '1px solid oklch(0.78 0.16 75 / 0.25)' }}
                  aria-live="polite"
                >
                  Tap the tiles in order
                </div>
              ) : phase === 'success' ? (
                <div
                  className="flex w-full items-center justify-center rounded-2xl py-4 text-[15px] font-semibold text-[var(--ma-success)]"
                  style={{ background: 'oklch(0.72 0.16 145 / 0.12)', border: '1px solid oklch(0.72 0.16 145 / 0.25)' }}
                >
                  Next round loading…
                </div>
              ) : null}
            </div>
          </>
        )}
      </main>

      {/* ── NAVIGATION ── */}
      <BottomNavBar active="play" />
    </div>
  )
}
