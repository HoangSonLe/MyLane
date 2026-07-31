import { useState, useEffect, useRef } from 'react'

import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { NumberBoard, AlphabetBoard, GridBoard, SequenceBoard } from '@/components/ui/gameplay'
import { MatchupHeader } from './components/MatchupHeader'
import { RoundBanner } from './components/RoundBanner'
import { SeedBadge } from './components/SeedBadge'
import { LoadingSkeleton } from './components/LoadingSkeleton'
import { WaitingState } from './components/WaitingState'
import { ReconnectingOverlay } from './components/ReconnectingOverlay'
import { ErrorOverlay } from './components/ErrorOverlay'
import { ResultTransition } from './components/ResultTransition'
import { PromptBar } from './components/PromptBar'
import { IconChevronLeft } from './components/icons'
import { MOCK_PLAYER, MOCK_OPPONENT } from '@/services/versus-gameplay/versus-gameplay.mock'
import type { Props } from '@/services/versus-gameplay/versus-gameplay.interface'
import { ScreenState, GameId, RoundMode, OpponentStatus, Phase } from '@/configs/enum'

// ─── Constants ───────────────────────────────────────────────────
const GAME_LABELS: Record<GameId, string> = {
  [GameId.NUMBER]:   'Number Memory',
  [GameId.ALPHABET]: 'Alphabet Memory',
  [GameId.GRID]:     'Grid Memory',
  [GameId.SEQUENCE]: 'Sequence Memory',
}

// ─── Prototype pill ───────────────────────────────────────────────
function ProtoPill<T extends string>(props: { label: string; values: T[]; current: T; onChange: (v: T) => void; bottom: number }) {
  return (
    <div
      className="fixed left-1/2 z-50 -translate-x-1/2"
      style={{ bottom: props.bottom }}
      aria-label={`${props.label} — prototype only`}
    >
      <div className="flex gap-1 rounded-2xl p-1" style={{ background: 'var(--ma-surface)', boxShadow: 'var(--ma-shadow-md)' }}>
        {props.values.map((v) => (
          <button
            key={v}
            onClick={() => props.onChange(v)}
            className={[
              'rounded-xl px-2.5 py-1 text-[10px] font-semibold transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
              props.current === v
                ? 'bg-[var(--ma-active)] text-white'
                : 'text-[var(--ma-fg-muted)] hover:text-[var(--ma-fg)]',
            ].join(' ')}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────
export function VersusGameplayScreen({
  gameType: initialGameType = GameId.SEQUENCE,
  roundMode: initialRoundMode = RoundMode.VERSUS_RANKED,
  onQuit,
  onMatchEnd,
}: Props) {
  // Prototype controls
  const SCREEN_STATES: ScreenState[]   = [ScreenState.NORMAL, ScreenState.LOADING, ScreenState.WAITING, ScreenState.RECONNECTING, ScreenState.ERROR, ScreenState.RESULT]
  const GAME_TYPES: GameId[]           = [GameId.NUMBER, GameId.ALPHABET, GameId.GRID, GameId.SEQUENCE]
  const ROUND_MODES: RoundMode[]       = [RoundMode.VERSUS_RANKED, RoundMode.VERSUS_UNRANKED]
  const OPP_STATUSES: OpponentStatus[] = [OpponentStatus.CONNECTED, OpponentStatus.DISCONNECTED, OpponentStatus.ANSWERED, OpponentStatus.LOCKED_IN, OpponentStatus.WAITING, OpponentStatus.RECONNECTING]

  const [screenState,     setScreenState]     = useState<ScreenState>(ScreenState.NORMAL)
  const [gameType,        setGameType]         = useState<GameId>(initialGameType)
  const [roundMode,       setRoundMode]        = useState<RoundMode>(initialRoundMode)
  const [phase,           setPhase]            = useState<Phase>(Phase.IDLE)
  const [opponentStatus,  setOpponentStatus]   = useState<OpponentStatus>(OpponentStatus.CONNECTED)
  const [showQuitConfirm, setShowQuitConfirm]  = useState(false)

  // Match/round state
  const [round,         setRound]         = useState(1)
  const totalRounds                        = 5
  const [playerScore,   setPlayerScore]   = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [level,         setLevel]         = useState(1)
  const [timer,         setTimer]         = useState(30)
  const [reconnectCd,   setReconnectCd]   = useState(30)
  const [seed,          setSeed]          = useState(() => Math.random().toString(36).slice(2, 8).toUpperCase())
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Game board state
  const [numSeq,       setNumSeq]       = useState('')
  const [numAnswer,    setNumAnswer]    = useState('')
  const [alphaSeq,     setAlphaSeq]     = useState('')
  const [alphaAnswer,  setAlphaAnswer]  = useState('')
  const [gridLit,      setGridLit]      = useState<number[]>([])
  const [gridTapped,   setGridTapped]   = useState<number[]>([])
  const [seqSequence,  setSeqSequence]  = useState<number[]>([])
  const [seqLit,       setSeqLit]       = useState<number | null>(null)
  const [seqPressed,   setSeqPressed]   = useState<number | null>(null)
  const [seqInput,     setSeqInput]     = useState<number[]>([])

  const maxTimer = 10 + level * 2

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current)     clearInterval(timerRef.current)
      if (timeoutRef.current)   clearTimeout(timeoutRef.current)
      if (reconnectRef.current) clearInterval(reconnectRef.current)
    }
  }, [])

  // Answer timer
  useEffect(() => {
    if (phase === Phase.ANSWERING && screenState === ScreenState.NORMAL) {
      setTimer(maxTimer)
      timerRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) { clearInterval(timerRef.current!); handleWrong(); return 0 }
          return t - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase, screenState])

  // Reconnect countdown — runs when opponentStatus is 'reconnecting'
  useEffect(() => {
    if (opponentStatus === OpponentStatus.RECONNECTING && screenState === ScreenState.NORMAL) {
      setReconnectCd(30)
      reconnectRef.current = setInterval(() => {
        setReconnectCd((c) => {
          if (c <= 1) {
            clearInterval(reconnectRef.current!)
            // Opponent timed out → treat as win, advance to result
            setScreenState(ScreenState.RESULT)
            return 0
          }
          return c - 1
        })
      }, 1000)
    } else {
      if (reconnectRef.current) clearInterval(reconnectRef.current)
    }
    return () => { if (reconnectRef.current) clearInterval(reconnectRef.current) }
  }, [opponentStatus, screenState])

  // ── Number logic ──
  function startNumberRound(len: number) {
    const seq = Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join('')
    setNumSeq(seq); setNumAnswer(''); setPhase(Phase.VIEWING)
    const viewMs = Math.max(800, seq.length * 600)
    timeoutRef.current = setTimeout(() => setPhase(Phase.ANSWERING), viewMs)
  }
  function handleNumKey(k: string) {
    if (phase !== Phase.ANSWERING) return
    const next = numAnswer + k
    setNumAnswer(next)
    if (next.length === numSeq.length) { next === numSeq ? handleCorrect() : handleWrong() }
  }
  function handleNumDelete() { setNumAnswer((a) => a.slice(0, -1)) }

  // ── Alphabet logic ──
  function startAlphaRound(len: number) {
    const seq = Array.from({ length: len }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('')
    setAlphaSeq(seq); setAlphaAnswer(''); setPhase(Phase.VIEWING)
    const viewMs = Math.max(800, seq.length * 650)
    timeoutRef.current = setTimeout(() => setPhase(Phase.ANSWERING), viewMs)
  }
  function handleAlphaKey(k: string) {
    if (phase !== Phase.ANSWERING) return
    const next = alphaAnswer + k
    setAlphaAnswer(next)
    if (next.length === alphaSeq.length) { next === alphaSeq ? handleCorrect() : handleWrong() }
  }
  function handleAlphaDelete() { setAlphaAnswer((a) => a.slice(0, -1)) }

  // ── Grid logic ──
  function startGridRound(len: number) {
    const cols = Math.min(3 + Math.floor(len / 4), 5)
    const total = cols * cols
    const tiles: number[] = []
    while (tiles.length < len) { const t = Math.floor(Math.random() * total); if (!tiles.includes(t)) tiles.push(t) }
    setGridLit(tiles); setGridTapped([]); setPhase(Phase.VIEWING)
    timeoutRef.current = setTimeout(() => { setGridLit([]); setPhase(Phase.ANSWERING) }, 1200 + len * 400)
  }
  function handleGridTap(i: number) {
    if (phase !== Phase.ANSWERING) return
    const next = [...gridTapped, i]
    setGridTapped(next)
    if (next.length === gridLit.length) {
      const sorted = [...gridLit].sort((a, b) => a - b)
      sorted.every((v, idx) => v === next[idx]) ? (setGridLit(sorted), handleCorrect()) : handleWrong()
    }
  }

  // ── Sequence logic ──
  const SEQ_SPEED = 600
  function playSeqSequence(seq: number[], onDone: () => void) {
    setPhase(Phase.VIEWING); let i = 0
    function flash() {
      if (i >= seq.length) { setSeqLit(null); timeoutRef.current = setTimeout(onDone, 300); return }
      setSeqLit(seq[i])
      timeoutRef.current = setTimeout(() => { setSeqLit(null); timeoutRef.current = setTimeout(() => { i++; flash() }, 200) }, SEQ_SPEED)
    }
    flash()
  }
  function startSeqRound(seq: number[]) { setSeqInput([]); setSeqPressed(null); playSeqSequence(seq, () => setPhase(Phase.ANSWERING)) }
  function handleSeqTap(id: number) {
    if (phase !== Phase.ANSWERING) return
    const next = [...seqInput, id]; const pos = next.length - 1
    setSeqPressed(id); timeoutRef.current = setTimeout(() => setSeqPressed(null), 180)
    if (next[pos] !== seqSequence[pos]) { handleWrong(); return }
    setSeqInput(next)
    if (next.length === seqSequence.length) handleCorrect()
  }

  // ── Correct / wrong ──
  function handleCorrect() {
    setPhase(Phase.CORRECT)
    setPlayerScore((s) => s + 1)
    timeoutRef.current = setTimeout(() => {
      if (round >= totalRounds) { setScreenState(ScreenState.RESULT); return }
      advanceRound()
    }, 1500)
  }
  function handleWrong() {
    setPhase(Phase.WRONG)
    // Simulate opponent scoring 50% of the time in the prototype
    if (Math.random() > 0.5) setOpponentScore((s) => s + 1)
    timeoutRef.current = setTimeout(() => {
      if (round >= totalRounds) { setScreenState(ScreenState.RESULT); return }
      advanceRound()
    }, 2000)
  }
  function advanceRound() {
    const nextRound = round + 1
    const nextLevel = level + 1
    setRound(nextRound)
    setLevel(nextLevel)
    setSeed(Math.random().toString(36).slice(2, 8).toUpperCase())
    setPhase(Phase.IDLE)
  }

  // ── Unified round start ──
  function startRound(lvl = level) {
    if (gameType === GameId.NUMBER)   startNumberRound(lvl + 2)
    if (gameType === GameId.ALPHABET) startAlphaRound(lvl + 1)
    if (gameType === GameId.GRID)     startGridRound(lvl + 2)
    if (gameType === GameId.SEQUENCE) {
      const seq = Array.from({ length: lvl + 2 }, () => Math.floor(Math.random() * 4))
      setSeqSequence(seq); startSeqRound(seq)
    }
  }

  function resetMatch() {
    setRound(1); setLevel(1); setPlayerScore(0); setOpponentScore(0)
    setPhase(Phase.IDLE); setNumAnswer(''); setAlphaAnswer(''); setGridTapped([]); setSeqInput([])
    setScreenState(ScreenState.NORMAL)
  }

  const isNormal       = screenState === ScreenState.NORMAL
  const isLoading      = screenState === ScreenState.LOADING
  const isWaiting      = screenState === ScreenState.WAITING
  const isReconnecting = screenState === ScreenState.RECONNECTING
  const isError        = screenState === ScreenState.ERROR
  const isResult       = screenState === ScreenState.RESULT
  const showGameUI     = isNormal

  // Determine match outcome for result screen
  const won: boolean | null = playerScore > opponentScore ? true : playerScore < opponentScore ? false : null

  return (
    <div className="relative flex min-h-dvh flex-col" style={{ background: 'var(--ma-bg)' }}>

      {/* ── Prototype controls ── */}
      <ProtoPill label="state"    values={SCREEN_STATES}  current={screenState}    onChange={(s) => { setScreenState(s); if (s === ScreenState.NORMAL) setPhase(Phase.IDLE) }} bottom={72} />
      <ProtoPill label="opp"      values={OPP_STATUSES}   current={opponentStatus} onChange={setOpponentStatus} bottom={36} />
      <ProtoPill label="game"     values={GAME_TYPES}      current={gameType}       onChange={(g) => { setGameType(g); setPhase(Phase.IDLE) }} bottom={4} />
      <ProtoPill label="mode"     values={ROUND_MODES}     current={roundMode}      onChange={setRoundMode} bottom={108} />

      {/* ── HEADER ── */}
      <header className="flex items-center justify-between px-4 pb-2 pt-16">
        <button
          type="button"
          aria-label="Quit match"
          onClick={() => setShowQuitConfirm(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors active:bg-[var(--ma-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
          style={{ background: 'var(--ma-surface)', color: 'var(--ma-fg-muted)', boxShadow: 'var(--ma-shadow-sm)' }}
        >
          <IconChevronLeft />
        </button>

        <div className="flex flex-col items-center">
          <h1 className="text-[14px] font-bold tracking-tight" style={{ color: 'var(--ma-fg)' }}>
            Versus Match
          </h1>
          <p className="text-[11px]" style={{ color: 'var(--ma-fg-muted)' }}>
            {GAME_LABELS[gameType]} &middot; {roundMode === 'versus-ranked' ? 'Ranked' : 'Unranked'}
          </p>
        </div>

        {/* Seed badge */}
        <SeedBadge seed={seed} />
      </header>

      {/* ── MAIN ── */}
      <main
        id="main-content"
        className="flex flex-1 flex-col gap-4 pb-24"
      >
        {/* Loading — waiting for seed/server */}
        {isLoading && <LoadingSkeleton message="Syncing match seed…" />}

        {/* Waiting — seed ready, waiting for opponent to connect */}
        {isWaiting && (
          <WaitingState
            opponentName={MOCK_OPPONENT.name}
            onQuit={() => { onQuit?.() }}
          />
        )}

        {/* Normal gameplay */}
        {showGameUI && (
          <>
            {/* Matchup header */}
            <MatchupHeader
              playerName={MOCK_PLAYER.name}   playerScore={playerScore}
              opponentName={MOCK_OPPONENT.name} opponentScore={opponentScore}
              opponentStatus={opponentStatus}
              round={round} totalRounds={totalRounds}
              timer={timer} maxTimer={maxTimer}
              phase={phase}
              gameType={gameType}
              roundMode={roundMode}
            />

            <div className="flex flex-1 flex-col gap-4 px-4">
              {/* Round / phase banner */}
              <RoundBanner phase={phase} round={round} />

              {/* Game board */}
              <div className="flex flex-1 flex-col items-center gap-4">
                {gameType === GameId.SEQUENCE && (
                  <SequenceBoard litTile={seqLit} pressedTile={seqPressed} onTap={handleSeqTap} phase={phase} />
                )}
                {gameType === GameId.GRID && (
                  <GridBoard
                    level={level}
                    litTiles={phase === Phase.VIEWING ? gridLit : phase === Phase.ANSWERING ? [] : gridLit}
                    tappedTiles={gridTapped}
                    onTap={handleGridTap}
                    phase={phase}
                  />
                )}
                {gameType === GameId.NUMBER && (
                  <NumberBoard viewingValue={numSeq} answer={numAnswer} onKey={handleNumKey} onDelete={handleNumDelete} phase={phase} size="compact" />
                )}
                {gameType === GameId.ALPHABET && (
                  <AlphabetBoard viewingValue={alphaSeq} answer={alphaAnswer} onKey={handleAlphaKey} onDelete={handleAlphaDelete} phase={phase} size="compact" />
                )}
              </div>

              {/* Bottom prompt */}
              <div className="mt-auto">
                <PromptBar phase={phase} onStart={() => startRound(level)} gameType={gameType} />
              </div>
            </div>
          </>
        )}

        {/* Error — connection lost */}
        {isError && (
          <div className="flex flex-1 items-center justify-center">
            {/* placeholder to keep layout — overlay handles UI */}
          </div>
        )}
      </main>

      {/* ── RECONNECTING OVERLAY (opponent disconnected mid-match) ── */}
      {(isReconnecting || opponentStatus === OpponentStatus.RECONNECTING) && screenState === ScreenState.NORMAL && (
        <ReconnectingOverlay
          countdown={reconnectCd}
          onQuit={() => { onQuit?.() }}
        />
      )}

      {/* ── RECONNECTING state screen overlay ── */}
      {isReconnecting && (
        <ReconnectingOverlay
          countdown={reconnectCd}
          onQuit={() => { onQuit?.() }}
        />
      )}

      {/* ── ERROR OVERLAY ── */}
      {isError && (
        <ErrorOverlay
          onRetry={() => setScreenState(ScreenState.NORMAL)}
          onQuit={() => { onQuit?.() }}
        />
      )}

      {/* ── RESULT TRANSITION ── */}
      {isResult && (
        <ResultTransition
          playerScore={playerScore} opponentScore={opponentScore}
          playerName={MOCK_PLAYER.name} opponentName={MOCK_OPPONENT.name}
          won={won}
          roundMode={roundMode}
          onContinue={() => { resetMatch() }}
          onQuit={() => { onMatchEnd?.() ?? onQuit?.() }}
        />
      )}

      {/* ── QUIT CONFIRM — shared ConfirmDialog primitive ── */}
      <ConfirmDialog
        open={showQuitConfirm}
        variant="danger"
        title="Quit match?"
        message="Quitting mid-match counts as a loss in ranked play. Your opponent wins by forfeit."
        confirmLabel="Yes, quit"
        cancelLabel="Keep playing"
        onConfirm={() => { setShowQuitConfirm(false); onQuit?.() }}
        onCancel={() => setShowQuitConfirm(false)}
      />
    </div>
  )
}
