import { useState, useEffect, useRef } from 'react'

import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { NumberBoard, AlphabetBoard, GridBoard, SequenceBoard, ColorBoard } from '@/components/ui/gameplay'
import { MatchupHeader } from './components/MatchupHeader'
import { RoundBanner } from './components/RoundBanner'
import { SeedBadge } from './components/SeedBadge'
import { WaitingState } from './components/WaitingState'
import { ReconnectingOverlay } from './components/ReconnectingOverlay'
import { ErrorOverlay } from './components/ErrorOverlay'
import { PromptBar } from './components/PromptBar'
import { IconChevronLeft } from './components/icons'
import { MOCK_PLAYER, MOCK_OPPONENT } from '@/services/versus-gameplay/versus-gameplay.mock'
import type { Props } from '@/services/versus-gameplay/versus-gameplay.interface'
import { DifficultyId, ScreenState, GameId, ModeId, RoundMode, OpponentStatus, Phase } from '@/configs/enum'
import { lobbyService } from '@/services/lobby/lobby.service'
import { getGameLabels } from '@/services/gameplay/gameplay-screen.types'
import { useTranslation } from '@/i18n/useTranslation'
import { useAuthStore } from '@/stores/auth.store'
import { versusRoomService } from '@/services/versus-room/versus-room.service'
import type { MatchFinishReason } from '@/services/result/result.interface'
import {
  ALPHABET_LEVELS,
  COLOR_FLASH_MS,
  COLOR_GAP_MS,
  DIFFICULTY_SECONDS,
  GRID_ANSWER_TIME_SECONDS,
  GRID_VIEW_TIME_SECONDS,
  GRID_WRONG_TAP_PENALTY_SECONDS,
  NUMBER_LEVELS,
  SEQUENCE_FLASH_MS,
  SEQUENCE_GAP_MS,
  SEQUENCE_LEVELS,
  getColorLevel,
  getGridLevel,
  getLinearLevel,
} from '@/services/gameplay/game-rules'

function createSeededRandom(seed: string): () => number {
  let state = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    state ^= seed.charCodeAt(i)
    state = Math.imul(state, 16777619)
  }
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

// ─── Main export ──────────────────────────────────────────────────
export function VersusGameplayScreen({
  room,
  gameType: requestedGameType,
  roundMode: requestedRoundMode,
  difficulty: requestedDifficulty,
  seed: requestedSeed,
  onQuit,
  onMatchEnd,
}: Props) {
  const { t } = useTranslation()
  const gameLabels = getGameLabels(t)
  const user = useAuthStore((state) => state.user)
  const gameType = requestedGameType ?? room?.category ?? GameId.COLOR
  const roundMode = requestedRoundMode ?? room?.mode ?? RoundMode.VERSUS_RANKED
  const difficulty = requestedDifficulty ?? room?.difficulty ?? DifficultyId.MEDIUM
  const matchSeed = requestedSeed ?? room?.seed ?? 'LOCAL-DEMO'
  const currentPlayerIsHost = room?.host.id ? room.host.id === user?.id : room?.host.name === user?.name
  const roomOpponent = room
    ? (currentPlayerIsHost ? room.opponent : room.host)
    : null
  const playerName = user?.name ?? MOCK_PLAYER.name
  const opponentName = roomOpponent?.name ?? MOCK_OPPONENT.name
  const opponentElo = roomOpponent?.elo ?? MOCK_OPPONENT.elo

  useEffect(() => {
    lobbyService.updatePresence('in-game').catch(() => {})
    return () => {
      lobbyService.updatePresence('online').catch(() => {})
    }
  }, [])

  const [screenState,     setScreenState]     = useState<ScreenState>(ScreenState.NORMAL)
  const [phase,           setPhase]            = useState<Phase>(Phase.IDLE)
  const [opponentStatus,  setOpponentStatus]   = useState<OpponentStatus>(OpponentStatus.CONNECTED)
  const [showQuitConfirm, setShowQuitConfirm]  = useState(false)
  const [forcedOutcome, setForcedOutcome] = useState<'win' | 'loss' | 'draw' | null>(null)
  const [finishReason, setFinishReason] = useState<MatchFinishReason | undefined>(room?.finishReason ?? undefined)

  // Match/round state
  const [round,         setRound]         = useState(1)
  const totalRounds                        = 5
  const [playerScore,   setPlayerScore]   = useState(currentPlayerIsHost ? room?.hostScore || 0 : room?.guestScore || 0)
  const [opponentScore, setOpponentScore] = useState(currentPlayerIsHost ? room?.guestScore || 0 : room?.hostScore || 0)
  const [playerRoundsCompleted, setPlayerRoundsCompleted] = useState(
    currentPlayerIsHost ? room?.hostRoundsCompleted || 0 : room?.guestRoundsCompleted || 0,
  )
  const [opponentRoundsCompleted, setOpponentRoundsCompleted] = useState(
    currentPlayerIsHost ? room?.guestRoundsCompleted || 0 : room?.hostRoundsCompleted || 0,
  )
  const [level,         setLevel]         = useState(1)
  const [timer,         setTimer]         = useState(30)
  const [reconnectCd,   setReconnectCd]   = useState(60)
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
  const [gridWrongTile, setGridWrongTile] = useState<number | null>(null)
  const gridHadWrongTapRef = useRef(false)
  const [seqSequence,  setSeqSequence]  = useState<number[]>([])
  const [seqLit,       setSeqLit]       = useState<number | null>(null)
  const [seqPressed,   setSeqPressed]   = useState<number | null>(null)
  const [seqInput,     setSeqInput]     = useState<number[]>([])
  const [colorSequence, setColorSequence] = useState<number[]>([])
  const [colorLit, setColorLit] = useState<number | null>(null)
  const [colorPressed, setColorPressed] = useState<number | null>(null)
  const [colorInput, setColorInput] = useState<number[]>([])
  const maxConsecutiveItemsRef = useRef(0)
  const bonusSecondsRef = useRef(0)
  const perfectRef = useRef(true)
  const settledRoundsRef = useRef(new Set<number>())
  const submittedRoundsRef = useRef(new Set<number>())
  const submittingRoundsRef = useRef(new Set<number>())
  const autoStartedRoundsRef = useRef(new Set<number>())
  const matchEndSentRef = useRef(false)
  const serverEloChangeRef = useRef(0)
  // Presence-driven: true unless a sustained Realtime-presence absence says
  // otherwise. syncRoom() below defers to this so a stale poll/push tick
  // can't stomp a real disconnect back to CONNECTED before the opponent
  // actually returns — see the presence effect further down.
  const opponentPresentRef = useRef(true)

  function recordConsecutiveItems(count: number) {
    maxConsecutiveItemsRef.current = Math.max(maxConsecutiveItemsRef.current, count)
  }

  const maxTimer = gameType === GameId.GRID
    ? GRID_ANSWER_TIME_SECONDS + DIFFICULTY_SECONDS[difficulty]
    : 10 + level * 3 + DIFFICULTY_SECONDS[difficulty]

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current)     clearInterval(timerRef.current)
      if (timeoutRef.current)   clearTimeout(timeoutRef.current)
      if (reconnectRef.current) clearInterval(reconnectRef.current)
    }
  }, [])

  // Realtime push (instant) + polling (durable recovery path for Realtime
  // loss/reconnect) both drive the same sync — opponent score/status and the
  // final outcome always come from server-owned room state, never simulated
  // locally. `subscribeToRoomUpdates` fires the moment the opponent's round
  // submission/forfeit touches this room's row (Supabase Realtime, already
  // enabled for `versus_rooms` — see database/schema.sql); the 800ms poll
  // stays as a safety net for a dropped Realtime connection.
  useEffect(() => {
    if (!room?.code) return
    let cancelled = false

    const syncRoom = async () => {
      try {
        const latest = await versusRoomService.getRoom(room.code)
        if (cancelled) return
        const ownScore = currentPlayerIsHost ? latest.hostScore || 0 : latest.guestScore || 0
        const otherScore = currentPlayerIsHost ? latest.guestScore || 0 : latest.hostScore || 0
        const ownRounds = currentPlayerIsHost
          ? latest.hostRoundsCompleted || 0
          : latest.guestRoundsCompleted || 0
        const otherRounds = currentPlayerIsHost
          ? latest.guestRoundsCompleted || 0
          : latest.hostRoundsCompleted || 0
        setPlayerScore(ownScore)
        setOpponentScore(otherScore)
        setPlayerRoundsCompleted(ownRounds)
        setOpponentRoundsCompleted(otherRounds)
        // Presence (see effect below) is the authority on "is the opponent's
        // browser even open" — don't let a poll/push tick stomp a real,
        // sustained disconnect back to CONNECTED/ANSWERED.
        if (opponentPresentRef.current) {
          setOpponentStatus(otherRounds >= round ? OpponentStatus.ANSWERED : OpponentStatus.CONNECTED)
        }

        if (latest.status === 'finished') {
          setFinishReason(latest.finishReason ?? 'completed')
          serverEloChangeRef.current = currentPlayerIsHost
            ? latest.hostEloDelta || 0
            : latest.guestEloDelta || 0
          if (latest.winnerId) {
            setForcedOutcome(latest.winnerId === user?.id ? 'win' : 'loss')
          } else if (ownScore === otherScore) {
            setForcedOutcome('draw')
          } else {
            // Mock/legacy rooms may not have winner_id; score is still server state.
            setForcedOutcome(ownScore > otherScore ? 'win' : 'loss')
          }
          setScreenState(ScreenState.RESULT)
        }
      } catch {
        // Keep the current board; the next poll can recover.
      }
    }

    void syncRoom()
    const interval = setInterval(() => { void syncRoom() }, 800)
    const unsubscribe = versusRoomService.subscribeToRoomUpdates(room.code, () => { void syncRoom() })
    return () => {
      cancelled = true
      clearInterval(interval)
      unsubscribe()
    }
  }, [currentPlayerIsHost, room?.code, round, user?.id])

  // Opponent disconnect detection (Supabase Presence). The row poll/push
  // above only reflects *actions* (a submitted round) — it has no way to
  // tell "opponent is mid-round, thinking" apart from "opponent's browser is
  // gone". Presence answers that directly: leaving the channel (tab closed,
  // network dropped, crash) fires automatically, no heartbeat table needed.
  // A short grace period absorbs a brief reconnect blip so the 60s countdown
  // doesn't flash for nothing; only a sustained absence counts as a real
  // disconnect. Reaching 0 still does NOT self-award a win — see the
  // existing comment on the reconnect-countdown effect below: only a
  // dedicated server can confirm a disconnect forfeit (known-gaps.md).
  useEffect(() => {
    if (!room?.code || !user?.id || !roomOpponent?.id) return
    const opponentId = roomOpponent.id
    let absenceTimer: ReturnType<typeof setTimeout> | null = null

    const unsubscribe = versusRoomService.subscribeToRoomPresence(room.code, user.id, (onlineUserIds) => {
      const opponentOnline = onlineUserIds.includes(opponentId)
      if (opponentOnline) {
        if (absenceTimer) { clearTimeout(absenceTimer); absenceTimer = null }
        if (!opponentPresentRef.current) {
          opponentPresentRef.current = true
          setOpponentStatus(OpponentStatus.CONNECTED)
        }
      } else if (!absenceTimer) {
        absenceTimer = setTimeout(() => {
          opponentPresentRef.current = false
          setOpponentStatus(OpponentStatus.RECONNECTING)
        }, 4000)
      }
    })

    return () => {
      if (absenceTimer) clearTimeout(absenceTimer)
      unsubscribe()
    }
  }, [room?.code, user?.id, roomOpponent?.id])

  // Answer timer
  useEffect(() => {
    if (phase === Phase.ANSWERING && screenState === ScreenState.NORMAL) {
      setTimer(maxTimer)
      timerRef.current = setInterval(() => {
        setTimer((remaining) => Math.max(0, remaining - 1))
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  // handleWrong/maxTimer are intentionally captured for the active answer phase.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, screenState])

  // Keep timeout side effects outside the state updater. React Strict Mode may
  // invoke updater functions more than once, which previously scheduled two
  // transitions and cut short the next round's viewing phase.
  useEffect(() => {
    if (phase !== Phase.ANSWERING || screenState !== ScreenState.NORMAL || timer > 0) return
    if (timerRef.current) clearInterval(timerRef.current)
    handleWrong()
    // handleWrong intentionally captures the active round.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, round, screenState, timer])

  // Reconnect countdown — runs when opponentStatus is 'reconnecting' or 'disconnected' (60s grace period)
  useEffect(() => {
    if (
      (opponentStatus === OpponentStatus.RECONNECTING || opponentStatus === OpponentStatus.DISCONNECTED) &&
      screenState === ScreenState.NORMAL
    ) {
      setReconnectCd(60)
      reconnectRef.current = setInterval(() => {
        setReconnectCd((c) => {
          if (c <= 1) {
            clearInterval(reconnectRef.current!)
            // A client cannot award itself a win. The dedicated presence/game
            // server required by technical docs must confirm disconnect expiry.
            setScreenState(ScreenState.ERROR)
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
  function startNumberRound(len: number, random: () => number) {
    const seq = Array.from({ length: len }, () => 1 + Math.floor(random() * 9)).join('')
    setNumSeq(seq); setNumAnswer(''); setPhase(Phase.VIEWING)
    const viewMs = Math.max(800, seq.length * 600) + DIFFICULTY_SECONDS[difficulty] * 1000
    timeoutRef.current = setTimeout(() => setPhase(Phase.ANSWERING), viewMs)
  }
  function handleNumKey(k: string) {
    if (phase !== Phase.ANSWERING) return
    const next = numAnswer + k
    setNumAnswer(next)
    if (numAnswer === numSeq.slice(0, numAnswer.length) && k === numSeq[numAnswer.length]) {
      recordConsecutiveItems(next.length)
    }
    if (next.length === numSeq.length) { next === numSeq ? handleCorrect() : handleWrong() }
  }
  function handleNumDelete() { setNumAnswer((a) => a.slice(0, -1)) }

  // ── Alphabet logic ──
  function startAlphaRound(len: number, random: () => number) {
    const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const seq = Array.from({ length: len }, () => charset[Math.floor(random() * charset.length)]).join('')
    setAlphaSeq(seq); setAlphaAnswer(''); setPhase(Phase.VIEWING)
    const viewMs = Math.max(800, seq.length * 650) + DIFFICULTY_SECONDS[difficulty] * 1000
    timeoutRef.current = setTimeout(() => setPhase(Phase.ANSWERING), viewMs)
  }
  function handleAlphaKey(k: string) {
    if (phase !== Phase.ANSWERING) return
    const next = alphaAnswer + k
    setAlphaAnswer(next)
    if (alphaAnswer === alphaSeq.slice(0, alphaAnswer.length) && k === alphaSeq[alphaAnswer.length]) {
      recordConsecutiveItems(next.length)
    }
    if (next.length === alphaSeq.length) { next === alphaSeq ? handleCorrect() : handleWrong() }
  }
  function handleAlphaDelete() { setAlphaAnswer((a) => a.slice(0, -1)) }

  // ── Grid logic ──
  function startGridRound(lvl: number, random: () => number) {
    const config = getGridLevel(lvl)
    const total = config.xAxis * config.yAxis
    const tiles: number[] = []
    while (tiles.length < config.beginCount) {
      const tile = Math.floor(random() * total)
      if (!tiles.includes(tile)) tiles.push(tile)
    }
    gridHadWrongTapRef.current = false
    setGridWrongTile(null)
    setGridLit(tiles); setGridTapped([]); setPhase(Phase.VIEWING)
    timeoutRef.current = setTimeout(
      () => setPhase(Phase.ANSWERING),
      (GRID_VIEW_TIME_SECONDS + DIFFICULTY_SECONDS[difficulty]) * 1000,
    )
  }
  function handleGridTap(i: number) {
    if (phase !== Phase.ANSWERING) return
    const expectedTile = gridLit[gridTapped.length]
    if (i !== expectedTile) {
      gridHadWrongTapRef.current = true
      setGridWrongTile(i)
      setTimeout(() => setGridWrongTile(null), 300)
      setTimer((remaining) => Math.max(0, remaining - GRID_WRONG_TAP_PENALTY_SECONDS))
      return
    }
    const next = [...gridTapped, i]
    setGridTapped(next)
    recordConsecutiveItems(next.length)
    if (next.length === gridLit.length) {
      gridHadWrongTapRef.current ? handleWrong() : handleCorrect()
    }
  }

  // ── Sequence logic ──
  function playSeqSequence(seq: number[], onDone: () => void) {
    setPhase(Phase.VIEWING); let i = 0
    function flash() {
      if (i >= seq.length) { setSeqLit(null); timeoutRef.current = setTimeout(onDone, SEQUENCE_GAP_MS); return }
      setSeqLit(seq[i])
      timeoutRef.current = setTimeout(() => {
        setSeqLit(null)
        timeoutRef.current = setTimeout(() => { i++; flash() }, SEQUENCE_GAP_MS)
      }, SEQUENCE_FLASH_MS)
    }
    flash()
  }
  function startSeqRound(seq: number[]) { setSeqInput([]); setSeqPressed(null); playSeqSequence(seq, () => setPhase(Phase.ANSWERING)) }
  function handleSeqTap(id: number) {
    if (phase !== Phase.ANSWERING) return
    const next = [...seqInput, id]; const pos = next.length - 1
    setSeqPressed(id); timeoutRef.current = setTimeout(() => setSeqPressed(null), 180)
    if (next[pos] !== seqSequence[pos]) { handleWrong(); return }
    recordConsecutiveItems(next.length)
    setSeqInput(next)
    if (next.length === seqSequence.length) handleCorrect()
  }

  function playColorSequence(seq: number[], onDone: () => void) {
    setPhase(Phase.VIEWING)
    let index = 0
    function flash() {
      if (index >= seq.length) {
        setColorLit(null)
        timeoutRef.current = setTimeout(onDone, COLOR_GAP_MS)
        return
      }
      setColorLit(seq[index])
      timeoutRef.current = setTimeout(() => {
        setColorLit(null)
        timeoutRef.current = setTimeout(() => {
          index += 1
          flash()
        }, COLOR_GAP_MS)
      }, COLOR_FLASH_MS)
    }
    flash()
  }

  function startColorRound(lvl: number, random: () => number) {
    const config = getColorLevel(lvl)
    const sequence = Array.from({ length: config.length }, () => Math.floor(random() * config.colorCount))
    setColorSequence(sequence)
    setColorInput([])
    setColorPressed(null)
    playColorSequence(sequence, () => setPhase(Phase.ANSWERING))
  }

  function handleColorTap(id: number) {
    if (phase !== Phase.ANSWERING) return
    const next = [...colorInput, id]
    const position = next.length - 1
    setColorPressed(id)
    timeoutRef.current = setTimeout(() => setColorPressed(null), 180)
    if (next[position] !== colorSequence[position]) {
      handleWrong()
      return
    }
    recordConsecutiveItems(next.length)
    setColorInput(next)
    if (next.length === colorSequence.length) handleCorrect()
  }

  // ── Correct / wrong ──
  async function submitRoundResult(correct: boolean) {
    if (submittedRoundsRef.current.has(round) || submittingRoundsRef.current.has(round)) return
    submittingRoundsRef.current.add(round)
    try {
      if (!room?.code) {
        // Local mock/demo fallback only; production rooms always use the RPC.
        if (correct) setPlayerScore((score) => score + 1)
        if (round % 2 === 0) setOpponentScore((score) => score + 1)
        setPlayerRoundsCompleted((completed) => Math.max(completed, round))
        setOpponentRoundsCompleted((completed) => Math.max(completed, round))
        submittedRoundsRef.current.add(round)
        return
      }

      const result = await versusRoomService.submitRound(room.code, round, correct)
      submittedRoundsRef.current.add(round)
      setPlayerScore(currentPlayerIsHost ? result.hostScore : result.guestScore)
      setOpponentScore(currentPlayerIsHost ? result.guestScore : result.hostScore)
      setPlayerRoundsCompleted(currentPlayerIsHost ? result.hostRoundsCompleted : result.guestRoundsCompleted)
      setOpponentRoundsCompleted(currentPlayerIsHost ? result.guestRoundsCompleted : result.hostRoundsCompleted)
      if (result.outcome) setForcedOutcome(result.outcome)
      serverEloChangeRef.current = result.eloChange
      if (result.matchStatus === 'finished') setScreenState(ScreenState.RESULT)
    } catch {
      setScreenState(ScreenState.ERROR)
      throw new Error('Round submission failed')
    } finally {
      submittingRoundsRef.current.delete(round)
    }
  }

  function continueAfterRound(delay: number) {
    timeoutRef.current = setTimeout(() => {
      if (round >= totalRounds) {
        setScreenState(ScreenState.WAITING)
        return
      }
      advanceRound()
    }, delay)
  }

  function handleCorrect() {
    if (settledRoundsRef.current.has(round)) return
    settledRoundsRef.current.add(round)
    setPhase(Phase.CORRECT)
    bonusSecondsRef.current += Math.max(0, timer)
    void submitRoundResult(true)
      .then(() => continueAfterRound(1500))
      .catch(() => {})
  }
  function handleWrong() {
    if (settledRoundsRef.current.has(round)) return
    settledRoundsRef.current.add(round)
    setPhase(Phase.WRONG)
    perfectRef.current = false
    void submitRoundResult(false)
      .then(() => continueAfterRound(2000))
      .catch(() => {})
  }

  function advanceRound() {
    const nextRound = round + 1
    const nextLevel = level + 1
    setRound(nextRound)
    setLevel(nextLevel)
    setPhase(Phase.IDLE)
  }

  // ── Unified round start ──
  function startRound(lvl = level) {
    // Reset before entering VIEWING so a previous round's zero cannot be
    // interpreted as an immediate timeout when this round starts answering.
    setTimer(maxTimer)
    const random = createSeededRandom(`${matchSeed}:${round}:${gameType}`)
    if (gameType === GameId.NUMBER) {
      startNumberRound(getLinearLevel(NUMBER_LEVELS, lvl).length, random)
    }
    if (gameType === GameId.ALPHABET) {
      startAlphaRound(getLinearLevel(ALPHABET_LEVELS, lvl).length, random)
    }
    if (gameType === GameId.GRID) startGridRound(lvl, random)
    if (gameType === GameId.SEQUENCE) {
      // 9 possible tiles now (3x3 board — see components/ui/gameplay/SequenceBoard.tsx),
      // was 4; range updated to match so every rendered tile is reachable.
      const length = getLinearLevel(SEQUENCE_LEVELS, lvl).length
      const seq = Array.from({ length }, () => Math.floor(random() * 9))
      setSeqSequence(seq); startSeqRound(seq)
    }
    if (gameType === GameId.COLOR) startColorRound(lvl, random)
  }

  // Versus rounds start automatically. Both clients enter this screen from the
  // same server-issued start_at and then advance independently by completion
  // speed; players should never need to press a per-round start button.
  useEffect(() => {
    if (screenState !== ScreenState.NORMAL || phase !== Phase.IDLE) return
    if (autoStartedRoundsRef.current.has(round)) return

    // Defer the start until after React Strict Mode's development-only effect
    // cleanup cycle. Otherwise that cleanup cancels the viewing timeout while
    // the round has already been marked as started, leaving it stuck forever.
    const autoStartTimer = window.setTimeout(() => {
      if (autoStartedRoundsRef.current.has(round)) return
      autoStartedRoundsRef.current.add(round)
      startRound(level)
    }, 0)

    return () => window.clearTimeout(autoStartTimer)
    // startRound intentionally captures the current round configuration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, gameType, level, matchSeed, phase, round, screenState])

  function buildResult() {
    const mode = roundMode === RoundMode.VERSUS_RANKED
      ? ModeId.VERSUS_RANKED
      : ModeId.VERSUS_UNRANKED
    const outcome = forcedOutcome ?? (playerScore > opponentScore ? 'win' : playerScore < opponentScore ? 'loss' : 'draw')
    return {
      matchId: room?.matchId,
      roomCode: room?.code,
      game: gameType,
      mode,
      difficulty,
      levelReached: level,
      roundsCleared: playerScore,
      maxConsecutiveItems: maxConsecutiveItemsRef.current,
      bonusSeconds: bonusSecondsRef.current,
      perfect: perfectRef.current,
      completedAllLevels: false,
      outcome,
      finishReason: finishReason ?? 'completed',
      versusComparison: {
        playerName,
        opponentName,
        playerScore,
        opponentScore,
        totalRounds,
        opponentId: roomOpponent?.id,
      },
      opponentElo,
      serverEloChange: serverEloChangeRef.current,
    } as const
  }

  useEffect(() => {
    if (screenState !== ScreenState.RESULT || !onMatchEnd || matchEndSentRef.current) return
    matchEndSentRef.current = true
    onMatchEnd(buildResult())
    // Result submission is idempotent by matchId; this guard also prevents a
    // changing parent callback identity from navigating twice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onMatchEnd, screenState])

  const isNormal       = screenState === ScreenState.NORMAL
  const isWaiting      = screenState === ScreenState.WAITING
  // Bug fix: only one ReconnectingOverlay. Opponent-disconnect (opponentStatus-driven)
  // is handled inside ScreenState.NORMAL; the overlay itself shows for RECONNECTING state too.
  const isReconnecting = screenState === ScreenState.RECONNECTING
  const isError        = screenState === ScreenState.ERROR
  const showGameUI     = isNormal

  return (
    <div className="relative flex min-h-dvh flex-col" style={{ background: 'var(--ma-bg)' }}>

      {/* ── HEADER ── */}
      <header className="flex items-center justify-between px-4 pb-2 pt-6">
        <button
          type="button"
          aria-label={t.versusGameplay.quitMatchAria}
          onClick={() => setShowQuitConfirm(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors active:bg-[var(--ma-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
          style={{ background: 'var(--ma-surface)', color: 'var(--ma-fg-muted)', boxShadow: 'var(--ma-shadow-sm)' }}
        >
          <IconChevronLeft />
        </button>

        <div className="flex flex-col items-center">
          <h1 className="text-[14px] font-bold tracking-tight" style={{ color: 'var(--ma-fg)' }}>
            {t.versusGameplay.title}
          </h1>
          <p className="text-[11px]" style={{ color: 'var(--ma-fg-muted)' }}>
            {gameLabels[gameType]} &middot; {roundMode === 'versus-ranked' ? t.versusGameplay.ranked : t.versusGameplay.unranked}
          </p>
        </div>

        {/* Symmetrical spacer to balance back button */}
        <div className="h-10 w-10 shrink-0" aria-hidden="true" />
      </header>

      {/* ── MAIN ── */}
      <main
        id="main-content"
        className="flex flex-1 flex-col gap-4 pb-24"
      >
        {/* Waiting — player completed all rounds, waiting for opponent */}
        {isWaiting && (
          <WaitingState
            opponentName={opponentName}
            onQuit={() => { onQuit?.() }}
          />
        )}

        {/* Normal gameplay */}
        {showGameUI && (
          <>
            {/* Matchup header */}
            <MatchupHeader
              playerName={playerName}   playerScore={playerScore}
              opponentName={opponentName} opponentScore={opponentScore}
              playerRoundsCompleted={playerRoundsCompleted}
              opponentRoundsCompleted={opponentRoundsCompleted}
              opponentStatus={opponentStatus}
              round={round} totalRounds={totalRounds}
              timer={timer} maxTimer={maxTimer}
              phase={phase}
              gameType={gameType}
              roundMode={roundMode}
            />

            <div className="flex flex-1 flex-col gap-4 px-4">
              {/* Round / phase banner */}
              <RoundBanner phase={phase} round={round} playerName={playerName} />

              {/* Game board */}
              <div className="flex flex-1 flex-col items-center gap-4">
                {gameType === GameId.SEQUENCE && (
                  <SequenceBoard litTile={seqLit} pressedTile={seqPressed} onTap={handleSeqTap} phase={phase} />
                )}
                {gameType === GameId.GRID && (
                  <GridBoard
                    xAxis={getGridLevel(level).xAxis}
                    yAxis={getGridLevel(level).yAxis}
                    litTiles={phase === Phase.VIEWING ? gridLit : phase === Phase.ANSWERING ? [] : gridLit}
                    activeCells={gridLit}
                    tappedTiles={gridTapped}
                    wrongTile={gridWrongTile}
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
                {gameType === GameId.COLOR && (
                  <ColorBoard
                    colorCount={getColorLevel(level).colorCount}
                    litTile={colorLit}
                    pressedTile={colorPressed}
                    onTap={handleColorTap}
                    phase={phase}
                  />
                )}
              </div>

              {/* Bottom prompt */}
              <div className="mt-auto">
                <PromptBar phase={phase} gameType={gameType} />
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

      {/* ── RECONNECTING OVERLAY ──
          Covers both cases:
          1. screenState === RECONNECTING (screen-level state)
          2. opponentStatus === RECONNECTING while game is NORMAL (opponent-driven)
      */}
      {(isReconnecting || (opponentStatus === OpponentStatus.RECONNECTING && isNormal)) && (
        <ReconnectingOverlay
          countdown={reconnectCd}
          onQuit={() => { onQuit?.() }}
        />
      )}

      {/* ── ERROR OVERLAY ── */}
      {isError && (
        <ErrorOverlay
          onRetry={() => {
            setScreenState(ScreenState.NORMAL)
            if ((phase === Phase.CORRECT || phase === Phase.WRONG) && !submittedRoundsRef.current.has(round)) {
              void submitRoundResult(phase === Phase.CORRECT)
                .then(() => continueAfterRound(phase === Phase.CORRECT ? 1500 : 2000))
                .catch(() => {})
            }
          }}
          onQuit={() => { onQuit?.() }}
        />
      )}

      {/* ── QUIT CONFIRM — shared ConfirmDialog primitive ── */}
      <ConfirmDialog
        open={showQuitConfirm}
        variant="danger"
        title={t.versusGameplay.quitMatchTitle}
        message={t.versusGameplay.quitMatchDesc}
        confirmLabel={t.versusGameplay.yesQuit}
        cancelLabel={t.versusGameplay.keepPlaying}
        onConfirm={() => { setShowQuitConfirm(false); onQuit?.() }}
        onCancel={() => setShowQuitConfirm(false)}
      />
    </div>
  )
}
