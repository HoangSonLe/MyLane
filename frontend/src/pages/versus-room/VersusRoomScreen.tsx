import { useCallback, useEffect, useRef, useState } from 'react'

import { BottomNavBar } from '@/components/ui/BottomNavBar'
import { StatusBanner } from '@/components/ui/StatusBanner'
import { RoomHeader } from './components/RoomHeader'
import { ModeSummaryCard } from './components/ModeSummaryCard'
import { InlineError } from './components/InlineError'
import { CreateRoomForm } from './components/CreateRoomForm'
import { JoinRoomForm } from './components/JoinRoomForm'
import { ReadyRoomView } from './components/ReadyRoomView'
import { AccountWall } from './components/AccountWall'
import { HostLeaveModal } from './components/HostLeaveModal'
import { GAME_CATEGORIES } from '@/services/versus-room/versus-room.mock'
import { versusRoomService, RoomExpiredError, RoomNotFoundError, RoomFullError } from '@/services/versus-room/versus-room.service'
import { RoundMode, DifficultyId, RoomEntrySource, GameId } from '@/configs/enum'
import { useNetworkStatus } from '@/lib/hooks/useNetworkStatus'
import { useAuthStore } from '@/stores/auth.store'
import type {
  GameCategoryId,
  ErrorKind,
  Room,
} from '@/services/versus-room/versus-room.interface'
import { useTranslation } from '@/i18n/useTranslation'

// ─── Main component ──────────────────────────────────────────────
export function VersusRoomScreen({
  onBack,
  onNavigate,
  initialTab = 'create',
  initialRoom = null,
  initialEntrySource = RoomEntrySource.CUSTOM,
  initialJoinCode = '',
  onRoomLinkConsumed,
}: {
  onBack?: () => void
  onNavigate?: (screen: string, room?: Room) => void
  initialTab?: 'create' | 'join'
  initialRoom?: Room | null
  initialEntrySource?: RoomEntrySource
  initialJoinCode?: string
  onRoomLinkConsumed?: () => void
}) {
  const { isOffline } = useNetworkStatus()
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const isGuest = user?.isGuest ?? true

  const [selectedCategory, setSelectedCategory] = useState<GameCategoryId | null>(GameId.COLOR)
  const [selectedMode, setSelectedMode] = useState<RoundMode>(RoundMode.VERSUS_RANKED)
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyId>(DifficultyId.MEDIUM)
  const [roomName, setRoomName] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [joinCode, setJoinCode] = useState(initialJoinCode)
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [inlineError, setInlineError] = useState<ErrorKind | null>(null)
  const [showHostLeaveModal, setShowHostLeaveModal] = useState(false)
  const [isUpdatingReady, setIsUpdatingReady] = useState(false)

  // Room the player is hosting or has joined — set to initialRoom if matched via Matchmaking/QuickJoin
  const [room, setRoom] = useState<Room | null>(initialRoom)
  const showRoomExpired = useCallback(() => {
    setRoom(null)
    setInlineError('room-expired')
  }, [])
  const isHost = !!room && (room.host.id ? room.host.id === user?.id : room.host.name === user?.name)
  const isQuickMatch = initialEntrySource === RoomEntrySource.QUICK_MATCH || room?.entrySource === RoomEntrySource.QUICK_MATCH
  const currentPlayerReady = isHost ? !!room?.host.ready : !!room?.opponent?.ready

  async function handleCreate() {
    if (!selectedCategory || isCreating) return
    setIsCreating(true)
    setInlineError(null)
    try {
      const created = await versusRoomService.createRoom({
        category: selectedCategory,
        mode: selectedMode,
        difficulty: selectedDifficulty,
        roomName,
        isPrivate,
        entrySource: RoomEntrySource.CUSTOM,
      })
      setRoom(created)
    } catch {
      setInlineError('connection')
    } finally {
      setIsCreating(false)
    }
  }

  async function handleJoin() {
    if (!joinCode.trim() || isJoining) return
    setIsJoining(true)
    setInlineError(null)
    try {
      const joined = await versusRoomService.joinRoom(joinCode.trim())
      setRoom(joined)
      onRoomLinkConsumed?.()
    } catch (err) {
      if (err instanceof RoomExpiredError) {
        setInlineError('room-expired')
      } else if (err instanceof RoomNotFoundError) {
        setInlineError('invalid-code')
      } else if (err instanceof RoomFullError) {
        setInlineError('room-full')
      } else {
        setInlineError('connection')
      }
    } finally {
      setIsJoining(false)
    }
  }

  const handleHeaderBack = () => {
    if (room && isHost && (!!room.opponent || room.opponentJoined)) {
      setShowHostLeaveModal(true)
    } else if (room) {
      void versusRoomService.leaveRoom(room.code).catch(() => {})
      setRoom(null)
      onBack?.()
    } else {
      onBack?.()
    }
  }

  const confirmHostLeave = async () => {
    if (room) {
      await versusRoomService.leaveRoom(room.code)
      setRoom(null)
    }
    setShowHostLeaveModal(false)
    onBack?.()
  }

  const roomCode = room?.code
  const handleStartMatch = useCallback(async () => {
    if (!roomCode) return
    try {
      const startedRoom = await versusRoomService.startRoom(roomCode)
      setRoom(startedRoom)
    } catch (error) {
      if (error instanceof RoomExpiredError || error instanceof RoomNotFoundError) {
        showRoomExpired()
      } else {
        setInlineError('connection')
      }
      throw new Error('Room start failed')
    }
  }, [roomCode, showRoomExpired])

  const handleToggleReady = async () => {
    if (!room || isUpdatingReady) return
    setIsUpdatingReady(true)
    setInlineError(null)
    try {
      setRoom(await versusRoomService.setRoomReady(room.code, !currentPlayerReady))
    } catch (error) {
      if (error instanceof RoomExpiredError || error instanceof RoomNotFoundError) {
        showRoomExpired()
      } else {
        setInlineError('connection')
      }
    } finally {
      setIsUpdatingReady(false)
    }
  }

  // Fix (E): Stable ref for onNavigate so polling effect doesn't restart on every render.
  // Without this, onNavigate (arrow fn recreated each render) is in the dep array →
  // interval is cleared and recreated on every render = constant rapid polling.
  const onNavigateRef = useRef(onNavigate)
  onNavigateRef.current = onNavigate
  const roomRef = useRef(room)
  roomRef.current = room
  const navigatedToGameRef = useRef(false)

  // Poll room membership/readiness. Navigation is handled separately so both
  // clients honor the same server-issued start_at timestamp.
  useEffect(() => {
    if (!roomCode) return
    const id = setInterval(async () => {
      try {
        const latest = await versusRoomService.getRoom(roomCode)
        setRoom(latest)
      } catch (error) {
        if (error instanceof RoomExpiredError || error instanceof RoomNotFoundError) {
          showRoomExpired()
        }
      }
    }, 800)
    return () => clearInterval(id)
  }, [roomCode, showRoomExpired])

  // Presence is explicit and much slower than the read-only 800 ms poll. A
  // participant heartbeat keeps an actively viewed waiting room alive without
  // allowing passive reads or Realtime subscriptions to extend abandoned rooms.
  useEffect(() => {
    if (!roomCode || room?.status !== 'waiting') return

    let disposed = false
    const heartbeat = async () => {
      try {
        await versusRoomService.heartbeatRoom(roomCode)
      } catch (error) {
        if (!disposed && (error instanceof RoomExpiredError || error instanceof RoomNotFoundError)) {
          showRoomExpired()
        }
      }
    }
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') void heartbeat()
    }

    void heartbeat()
    const id = setInterval(() => { void heartbeat() }, 60_000)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      disposed = true
      clearInterval(id)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [room?.status, roomCode, showRoomExpired])

  useEffect(() => {
    if (room?.status !== 'in_progress' || navigatedToGameRef.current) return
    const targetTime = room.startAt ? new Date(room.startAt).getTime() : Date.now()
    const timeout = setTimeout(() => {
      if (navigatedToGameRef.current || !roomRef.current) return
      navigatedToGameRef.current = true
      onNavigateRef.current?.('game', roomRef.current)
    }, Math.max(0, targetTime - Date.now()))
    return () => clearTimeout(timeout)
  }, [room?.startAt, room?.status])

  const activeCategory = GAME_CATEGORIES.find((c) => c.id === (room?.category ?? selectedCategory)) ?? null

  return (
    <div
      className="relative flex min-h-dvh flex-col"
      style={{ background: 'var(--ma-bg)' }}
    >
      {/* Host Leave Confirmation Modal */}
      <HostLeaveModal
        show={showHostLeaveModal}
        hasOpponent={!!room?.opponent}
        onConfirm={confirmHostLeave}
        onCancel={() => setShowHostLeaveModal(false)}
      />

      {/* Offline banner */}
      {isOffline && (
        <div className="pt-6">
          <StatusBanner
            variant="offline"
            message={t.versusRoom.offlineBanner}
          />
        </div>
      )}

      <main
        id="main-content"
        className="flex flex-1 flex-col gap-5 pb-36"
      >
        {/* Header */}
        <RoomHeader onBack={handleHeaderBack} />

        {/* Divider */}
        <div
          className="mx-4"
          style={{ height: '1px', background: 'var(--ma-border-subtle)' }}
          aria-hidden="true"
        />

        {isGuest ? (
          <AccountWall onLogIn={() => onNavigate?.('login')} />
        ) : (
          <>
            {/* Create-room preview or active room summary */}
            {(room || initialTab === 'create') && (
              <ModeSummaryCard
                mode={room?.mode ?? selectedMode}
                category={activeCategory}
                difficulty={room?.difficulty ?? selectedDifficulty}
                isPrivate={room ? room.isPrivate : isPrivate}
                code={room?.code}
                link={room?.link}
                showPreviewTitle={!room && initialTab === 'create'}
              />
            )}

            {/* Inline error (form-level) */}
            {inlineError && (
              <InlineError kind={inlineError} onDismiss={() => setInlineError(null)} />
            )}

            {/* Main content area */}
            {room ? (
              <ReadyRoomView
                host={room.host}
                opponent={room.opponent}
                isHost={isHost}
                opponentJoined={room.opponentJoined}
                onStart={handleStartMatch}
                onToggleReady={handleToggleReady}
                currentPlayerReady={currentPlayerReady}
                isUpdatingReady={isUpdatingReady}
                isQuickMatch={isQuickMatch}
                roomStatus={room.status}
                startAt={room.startAt}
              />
            ) : (
              <div className="flex flex-col gap-5">
                {/* Lobby already chooses the room-entry intent. Keep this screen
                    focused on the selected form and its single primary action. */}
                {initialTab === 'create' ? (
                  <CreateRoomForm
                    selectedCategory={selectedCategory}
                    selectedMode={selectedMode}
                    selectedDifficulty={selectedDifficulty}
                    roomName={roomName}
                    isPrivate={isPrivate}
                    isCreating={isCreating}
                    onSelectCategory={setSelectedCategory}
                    onSelectMode={setSelectedMode}
                    onSelectDifficulty={setSelectedDifficulty}
                    onRoomNameChange={setRoomName}
                    onTogglePrivacy={setIsPrivate}
                    onCreate={handleCreate}
                  />
                ) : (
                  <JoinRoomForm
                    codeValue={joinCode}
                    isJoining={isJoining}
                    onCodeChange={setJoinCode}
                    onJoin={handleJoin}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Bottom nav */}
      <BottomNavBar active="play" onNavigate={onNavigate} />
    </div>
  )
}
