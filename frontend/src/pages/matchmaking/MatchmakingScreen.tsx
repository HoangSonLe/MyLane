import { useCallback, useEffect, useRef, useState } from 'react'
import type { ComponentType } from 'react'

import { BackButton } from '@/components/ui/BackButton'
import {
  IconCategoryAlphabet,
  IconCategoryColor,
  IconCategoryGrid,
  IconCategoryNumber,
  IconCategorySequence,
  IconSwords,
} from '@/components/ui/icons'
import { ScreenShell } from '@/components/ui/layout'
import { DifficultyChip } from '@/components/ui/game'
import { DifficultyId, GameId, RoomEntrySource, RoundMode } from '@/configs/enum'
import { DIFFICULTIES } from '@/services/game-select/game-select.mock'
import { isSupabaseConfigured } from '@/services/backend-config'
import { matchmakingSupabaseService } from '@/services/supabase/matchmaking.supabase'
import type { GameCategoryId, Room } from '@/services/versus-room/versus-room.interface'
import { versusRoomService } from '@/services/versus-room/versus-room.service'
import { useAuthStore } from '@/stores/auth.store'
import { useTranslation } from '@/i18n/useTranslation'
import { getDifficultyLabels, getLocalizedGameLabel } from '@/services/gameplay/gameplay-screen.types'

const CATEGORY_ITEMS: { id: GameCategoryId; label: string; icon: ComponentType<{ width?: number; height?: number }> }[] = [
  { id: GameId.COLOR, label: 'Color', icon: IconCategoryColor },
  { id: GameId.NUMBER, label: 'Number', icon: IconCategoryNumber },
  { id: GameId.ALPHABET, label: 'Alphabet', icon: IconCategoryAlphabet },
  { id: GameId.GRID, label: 'Grid', icon: IconCategoryGrid },
  { id: GameId.SEQUENCE, label: 'Sequence', icon: IconCategorySequence },
]

export function MatchmakingScreen({
  onBack,
  onMatched,
  initialCategory = GameId.COLOR,
  initialDifficulty = DifficultyId.MEDIUM,
}: {
  onBack: () => void
  onMatched: (room: Room, source: RoomEntrySource) => void
  initialCategory?: GameCategoryId
  initialDifficulty?: DifficultyId
}) {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const difficultyLabels = getDifficultyLabels(t)
  const [selectedCategory, setSelectedCategory] = useState<GameCategoryId>(initialCategory)
  // The server only pairs queue rows with equal difficulty
  // (`poll_matchmaking` in database/schema.sql), so the player must be able
  // to see and change it here — previously it was inherited invisibly from
  // the last Solo pick, and two players on Easy vs Hard never matched.
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyId>(initialDifficulty)
  const [userElo, setUserElo] = useState<number | null>(null)
  const [seconds, setSeconds] = useState(0)
  const [isSearching, setIsSearching] = useState(true)
  const [isTimeout, setIsTimeout] = useState(false)
  const [isCreatingHostRoom, setIsCreatingHostRoom] = useState(false)
  const [queueId, setQueueId] = useState<string | null>(null)
  const [attemptId, setAttemptId] = useState(() => crypto.randomUUID())

  const displayedElo = userElo ?? user?.elo ?? 1000
  const eloDelta = Math.min(300, 100 + Math.floor(seconds / 10) * 50)
  const minSearchElo = Math.max(100, displayedElo - eloDelta)
  const maxSearchElo = displayedElo + eloDelta

  const mountedRef = useRef(true)
  const handledRoomCodeRef = useRef<string | null>(null)
  const onMatchedRef = useRef(onMatched)
  onMatchedRef.current = onMatched

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  // Matchmaking is based on the selected category Elo, not stale overall Elo.
  useEffect(() => {
    let cancelled = false
    setUserElo(null)
    matchmakingSupabaseService.getCategoryElo(selectedCategory)
      .then((elo) => {
        if (!cancelled) setUserElo(elo)
      })
      .catch(() => {
        if (!cancelled) setUserElo(user?.elo ?? 1000)
      })
    return () => { cancelled = true }
  }, [selectedCategory, user?.elo])

  useEffect(() => {
    if (!isSearching || userElo === null) return
    const timer = setInterval(() => {
      setSeconds((previous) => {
        if (previous >= 59) {
          setIsSearching(false)
          setIsTimeout(true)
          void matchmakingSupabaseService.leaveQueue(attemptId).catch(() => {})
          return 60
        }
        return previous + 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [attemptId, isSearching, userElo])

  const handleFoundMatch = useCallback(async (roomCode: string) => {
    if (handledRoomCodeRef.current) return
    handledRoomCodeRef.current = roomCode
    try {
      const room = await versusRoomService.getRoom(roomCode)
      if (!mountedRef.current) return
      setIsSearching(false)
      if ('vibrate' in navigator) navigator.vibrate([100, 50, 100])
      // ReadyRoom owns the only countdown and derives it from server start_at.
      onMatchedRef.current(room, RoomEntrySource.QUICK_MATCH)
    } catch {
      handledRoomCodeRef.current = null
    }
  }, [])

  // A fresh attempt UUID replaces stale queue state atomically. Cleanup can only
  // remove that exact attempt, so StrictMode and category changes cannot delete
  // a newer queue row.
  useEffect(() => {
    if (!isSearching || userElo === null) return

    // Bug fix: Matchmaking requires Supabase. Without it, immediately show timeout
    // instead of silently failing and leaving the user stuck for 60 seconds.
    if (!isSupabaseConfigured()) {
      setIsSearching(false)
      setIsTimeout(true)
      return
    }

    let cancelled = false
    let pollInterval: ReturnType<typeof setInterval> | null = null
    let unsubscribe = () => {}

    const poll = async () => {
      try {
        const result = await matchmakingSupabaseService.pollQueue(attemptId)
        if (cancelled) return
        if (result.queueId) setQueueId(result.queueId)
        if (result.status === 'matched' && result.roomCode) {
          await handleFoundMatch(result.roomCode)
        } else if (result.status === 'expired') {
          setIsSearching(false)
          setIsTimeout(true)
        }
      } catch {
        // Realtime or the next poll can recover a transient request failure.
      }
    }

    void matchmakingSupabaseService.enterQueue({
      category: selectedCategory,
      difficulty: selectedDifficulty,
      userElo,
      eloDelta: 100,
      attemptId,
    }).then((id) => {
      if (cancelled) return
      setQueueId(id)
      unsubscribe = user?.id
        ? matchmakingSupabaseService.subscribeToQueueMatch(user.id, attemptId, (roomCode) => {
            void handleFoundMatch(roomCode)
          })
        : () => {}
      void poll()
      pollInterval = setInterval(() => { void poll() }, 1500)
    }).catch(() => {
      if (!cancelled) {
        setIsSearching(false)
        setIsTimeout(true)
      }
    })

    return () => {
      cancelled = true
      unsubscribe()
      if (pollInterval) clearInterval(pollInterval)
      void matchmakingSupabaseService.leaveQueue(attemptId).catch(() => {})
    }
  }, [attemptId, handleFoundMatch, selectedDifficulty, isSearching, selectedCategory, user?.id, userElo])

  useEffect(() => {
    if (!isSearching || !queueId || eloDelta === 100 || userElo === null) return
    void matchmakingSupabaseService.updateQueueWindow({ attemptId, userElo, eloDelta }).catch(() => {})
  }, [attemptId, eloDelta, isSearching, queueId, userElo])

  const handleRestartQueue = async () => {
    await matchmakingSupabaseService.leaveQueue(attemptId).catch(() => {})
    handledRoomCodeRef.current = null
    setQueueId(null)
    setSeconds(0)
    setIsTimeout(false)
    setAttemptId(crypto.randomUUID())
    setIsSearching(true)
  }

  const handleCategoryChange = async (category: GameCategoryId) => {
    if (category === selectedCategory) return
    setIsSearching(false)
    await matchmakingSupabaseService.leaveQueue(attemptId).catch(() => {})
    if (!mountedRef.current) return
    handledRoomCodeRef.current = null
    setQueueId(null)
    setSelectedCategory(category)
    setSeconds(0)
    setIsTimeout(false)
    setAttemptId(crypto.randomUUID())
    setIsSearching(true)
  }

  // Same restart dance as a category change: the queue row carries the
  // difficulty, so changing it means a fresh attempt.
  const handleDifficultyChange = async (difficulty: DifficultyId) => {
    if (difficulty === selectedDifficulty) return
    setIsSearching(false)
    await matchmakingSupabaseService.leaveQueue(attemptId).catch(() => {})
    if (!mountedRef.current) return
    handledRoomCodeRef.current = null
    setQueueId(null)
    setSelectedDifficulty(difficulty)
    setSeconds(0)
    setIsTimeout(false)
    setAttemptId(crypto.randomUUID())
    setIsSearching(true)
  }

  const handleCancelAndBack = () => {
    void matchmakingSupabaseService.leaveQueue(attemptId).catch(() => {})
    onBack()
  }

  const handleCreateHostRoom = async () => {
    setIsCreatingHostRoom(true)
    await matchmakingSupabaseService.leaveQueue(attemptId).catch(() => {})
    try {
      const created = await versusRoomService.createRoom({
        category: selectedCategory,
        mode: RoundMode.VERSUS_RANKED,
        difficulty: selectedDifficulty,
        roomName: `${user?.name || 'Player'}'s Ranked Arena`,
        isPrivate: false,
      })
      if (mountedRef.current) onMatchedRef.current(created, RoomEntrySource.CUSTOM)
    } catch {
      if (mountedRef.current) setIsCreatingHostRoom(false)
    }
  }

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
    const remainingSeconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <ScreenShell>
      <div className="flex h-full min-h-screen flex-col bg-[var(--ma-bg)] p-3 sm:p-6 text-[var(--ma-fg)] overflow-y-auto">
        <div className="flex items-center justify-between gap-2 pb-3 sm:pb-4 border-b border-[var(--ma-border-subtle)]/50">
          <BackButton onBack={handleCancelAndBack} />
          <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] sm:text-[12px] font-bold shrink-0" style={{ background: 'var(--ma-brand-soft)', color: 'var(--ma-brand)' }}>
            <IconSwords className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Elo Queue</span>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-1.5 w-full">
          <label className="text-[11px] sm:text-[12px] font-semibold text-[var(--ma-fg-subtle)] text-center">
            Chọn môn thi đấu xếp hạng:
          </label>
          <div className="flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto py-1.5 w-full no-scrollbar touch-pan-x px-1">
            {CATEGORY_ITEMS.map((category) => {
              const isSelected = selectedCategory === category.id
              const CategoryIcon = category.icon
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => { void handleCategoryChange(category.id) }}
                  className="flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-[12px] font-semibold transition-all shrink-0 active:scale-95"
                  style={{
                    background: isSelected ? 'var(--ma-brand)' : 'var(--ma-surface)',
                    color: isSelected ? '#fff' : 'var(--ma-fg-muted)',
                    border: `1px solid ${isSelected ? 'var(--ma-brand)' : 'var(--ma-border-subtle)'}`,
                    boxShadow: isSelected ? '0 4px 14px oklch(0.78 0.16 75 / 0.25)' : 'none',
                  }}
                >
                  <CategoryIcon width={14} height={14} />
                  <span>{getLocalizedGameLabel(t, category.id)}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Difficulty — pairing requires an exact match, so it must be visible and changeable here. */}
        <div className="mt-2 flex flex-col gap-1.5 w-full">
          <label className="text-[11px] sm:text-[12px] font-semibold text-[var(--ma-fg-subtle)] text-center">
            {t.gameSelect.difficulty}
          </label>
          <div className="flex gap-2 px-1">
            {DIFFICULTIES.map((difficulty) => (
              <DifficultyChip
                key={difficulty.id}
                difficulty={{ ...difficulty, label: difficultyLabels[difficulty.id] }}
                selected={selectedDifficulty === difficulty.id}
                onSelect={() => { void handleDifficultyChange(difficulty.id) }}
              />
            ))}
          </div>
        </div>

        <div className="my-auto py-6 flex flex-1 flex-col items-center justify-center text-center px-2">
          {isTimeout ? (
            <div className="flex flex-col items-center gap-3 sm:gap-4 w-full max-w-xs sm:max-w-sm">
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-2xl">⏳</div>
              <div>
                <h3 className="text-[15px] sm:text-[16px] font-bold text-[var(--ma-fg)]">Chưa Tìm Thấy Đối Thủ Ngay</h3>
                <p className="text-[11px] sm:text-[12px] text-[var(--ma-fg-muted)] mt-1 leading-relaxed">
                  Chưa có ai ở khoảng Elo <strong className="text-[var(--ma-brand)]">{minSearchElo} — {maxSearchElo}</strong> đang tìm ván môn này.
                </p>
              </div>
              <div className="flex flex-col w-full gap-2 mt-2 sm:mt-3">
                <button
                  type="button"
                  disabled={isCreatingHostRoom}
                  onClick={handleCreateHostRoom}
                  className="w-full rounded-2xl py-2.5 sm:py-3 text-[12px] sm:text-[13px] font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
                  style={{ background: 'var(--ma-brand)' }}
                >
                  {isCreatingHostRoom ? 'Đang tạo phòng...' : '⚡ Tự Tạo Phòng Chờ Đối Thủ'}
                </button>
                <button
                  type="button"
                  onClick={handleRestartQueue}
                  className="w-full rounded-2xl py-2.5 sm:py-3 text-[12px] sm:text-[13px] font-semibold transition-all active:scale-95"
                  style={{ background: 'var(--ma-surface)', border: '1px solid var(--ma-border)', color: 'var(--ma-fg)' }}
                >
                  🔄 Quét Hàng Chờ Lại Từ Đầu
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-xs sm:max-w-sm">
              <div className="relative flex h-28 w-28 sm:h-36 sm:w-36 items-center justify-center shrink-0">
                <div className="absolute inset-0 rounded-full bg-[var(--ma-brand)]/10 animate-ping" style={{ animationDuration: '2s' }} />
                <div className="absolute inset-2 sm:inset-3 rounded-full bg-[var(--ma-brand)]/20 animate-pulse" />
                <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-[var(--ma-brand-soft)] border-2 border-[var(--ma-brand)] text-[var(--ma-brand)] shadow-xl">
                  <IconSwords className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
                </div>
              </div>

              <div className="flex flex-col items-center gap-1 w-full">
                <h3 className="text-[16px] sm:text-[18px] font-bold text-[var(--ma-fg)]">Đang Tìm Trận Elo...</h3>
                <p className="text-2xl sm:text-3xl font-extrabold tracking-wider text-[var(--ma-brand)] font-mono">{formatTime(seconds)}</p>
                <div
                  className="mt-2 flex flex-wrap items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] sm:text-[12px] font-medium transition-all w-full max-w-[280px] sm:max-w-none"
                  style={{ background: 'var(--ma-surface)', border: '1px solid var(--ma-border-subtle)', color: 'var(--ma-fg-muted)' }}
                >
                  <span>Khoảng Elo:</span>
                  <span className="font-bold text-[var(--ma-brand)]">{minSearchElo} — {maxSearchElo} (±{eloDelta})</span>
                </div>
                <p className="text-[11px] text-[var(--ma-fg-subtle)] mt-1.5">
                  Elo của bạn: <strong className="text-[var(--ma-fg)]">{displayedElo} Elo</strong>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-3 pb-4 sm:pb-2 flex justify-center shrink-0 w-full">
          <button
            type="button"
            onClick={handleCancelAndBack}
            className="w-full sm:w-auto rounded-2xl px-6 py-2.5 text-[12px] sm:text-[13px] font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all active:scale-95 max-w-xs"
          >
            Hủy Hàng Chờ
          </button>
        </div>
      </div>
    </ScreenShell>
  )
}
