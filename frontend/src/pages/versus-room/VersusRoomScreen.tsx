import { useState } from 'react'

import { BottomNavBar } from '@/components/ui/BottomNavBar'
import { StatusBanner } from '@/components/ui/StatusBanner'
import { StatePill } from '@/components/ui/StatePill'
import { RoomHeader } from './components/RoomHeader'
import { ModeSummaryCard } from './components/ModeSummaryCard'
import { InlineError } from './components/InlineError'
import { CreateRoomForm } from './components/CreateRoomForm'
import { JoinRoomForm } from './components/JoinRoomForm'
import { ReadyRoomView } from './components/ReadyRoomView'
import { EmptyChoiceView } from './components/EmptyChoiceView'
import { OfflineWall } from './components/OfflineWall'
import {
  GAME_CATEGORIES,
  MOCK_HOST,
  MOCK_OPPONENT,
  ROOM_CODE,
  ROOM_LINK,
} from '@/services/versus-room/versus-room.mock'
import { ScreenState, RoundMode } from '@/configs/enum'
import type {
  GameCategoryId,
  ErrorKind,
} from '@/services/versus-room/versus-room.interface'

// ─── Main component ──────────────────────────────────────────────
export function VersusRoomScreen({
  onBack,
  onNavigate,
  initialTab = 'create',
}: {
  onBack?: () => void
  onNavigate?: (screen: string) => void
  initialTab?: 'create' | 'join'
}) {
  const [screenState, setScreenState] = useState<ScreenState>(ScreenState.EMPTY)
  const [activeTab, setActiveTab] = useState<'create' | 'join'>(initialTab)
  const [selectedCategory, setSelectedCategory] = useState<GameCategoryId | null>(null)
  const [selectedMode, setSelectedMode] = useState<RoundMode>(RoundMode.VERSUS_RANKED)
  const [roomName, setRoomName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [inlineError, setInlineError] = useState<ErrorKind | null>(null)
  // In the ready room, track whether opponent has joined (for prototype toggle)
  const [opponentJoined, setOpponentJoined] = useState(true)

  const isLoading = screenState === ScreenState.LOADING
  const isReady   = screenState === ScreenState.READY
  const isError   = screenState === ScreenState.ERROR
  const isOffline = screenState === ScreenState.OFFLINE

  const activeCategory = GAME_CATEGORIES.find((c) => c.id === selectedCategory) ?? null

  // Simulate create
  function handleCreate() {
    if (!selectedCategory) return
    setIsCreating(true)
    setInlineError(null)
    setTimeout(() => {
      setIsCreating(false)
      setScreenState(ScreenState.READY)
    }, 1200)
  }

  // Simulate join
  function handleJoin() {
    if (!joinCode.trim()) return
    setIsJoining(true)
    setInlineError(null)
    setTimeout(() => {
      setIsJoining(false)
      // Simulate invalid code for prototype error state demo
      if (joinCode.trim().toUpperCase() === 'ERR') {
        setInlineError('invalid-code')
      } else {
        setScreenState(ScreenState.READY)
      }
    }, 1200)
  }

  return (
    <div
      className="relative flex min-h-dvh flex-col"
      style={{ background: 'var(--ma-bg)' }}
    >
      {/* Offline banner */}
      {isOffline && (
        <div className="pt-16">
          <StatusBanner
            variant="offline"
            message="You're offline. Versus Room requires an active connection."
          />
        </div>
      )}

      {/* Error banner */}
      {isError && (
        <div className="pt-16">
          <StatusBanner
            variant="error"
            message="Could not connect to the room. Check your connection."
            onRetry={() => setScreenState(ScreenState.EMPTY)}
          />
        </div>
      )}

      <main
        id="main-content"
        className={[
          'flex flex-1 flex-col gap-5 pb-36',
          isOffline || isError ? '' : 'pt-16',
        ].join(' ')}
      >
        {/* Header */}
        <RoomHeader skeleton={isLoading} onBack={onBack} />

        {/* Divider */}
        <div
          className="mx-4"
          style={{ height: '1px', background: 'var(--ma-border-subtle)' }}
          aria-hidden="true"
        />

        {/* Mode summary card — always visible unless offline */}
        {!isOffline && (
          <ModeSummaryCard
            skeleton={isLoading}
            mode={selectedMode}
            category={isReady ? activeCategory : null}
          />
        )}

        {/* Inline error (form-level) */}
        {inlineError && !isLoading && (
          <InlineError kind={inlineError} onDismiss={() => setInlineError(null)} />
        )}

        {/* Main content area */}
        {isOffline ? (
          <OfflineWall onLogIn={() => onNavigate?.('login')} />
        ) : isReady ? (
          <ReadyRoomView
            skeleton={isLoading}
            host={MOCK_HOST}
            opponent={opponentJoined ? MOCK_OPPONENT : null}
            isHost
            opponentJoined={opponentJoined}
            onStart={() => onNavigate?.('game')}
            code={ROOM_CODE}
            link={ROOM_LINK}
          />
        ) : (
          <div className="flex flex-col gap-5">
            {/* Create / Join tab toggle */}
            {!isLoading && (
              <EmptyChoiceView activeTab={activeTab} onSetTab={setActiveTab} />
            )}

            {/* Tab content */}
            {activeTab === 'create' ? (
              <CreateRoomForm
                skeleton={isLoading}
                selectedCategory={selectedCategory}
                selectedMode={selectedMode}
                roomName={roomName}
                isCreating={isCreating}
                onSelectCategory={setSelectedCategory}
                onSelectMode={setSelectedMode}
                onRoomNameChange={setRoomName}
                onCreate={handleCreate}
              />
            ) : (
              <JoinRoomForm
                skeleton={isLoading}
                codeValue={joinCode}
                isJoining={isJoining}
                onCodeChange={setJoinCode}
                onJoin={handleJoin}
              />
            )}
          </div>
        )}

        {/* Opponent toggle in ready state — prototype only */}
        {isReady && (
          <div className="flex items-center justify-center gap-2 px-4">
            <button
              type="button"
              onClick={() => setOpponentJoined((v) => !v)}
              className="text-[11px] font-semibold text-[var(--ma-fg-subtle)] underline underline-offset-2 focus-visible:outline-none"
            >
              {opponentJoined ? 'Prototype: remove opponent' : 'Prototype: add opponent'}
            </button>
          </div>
        )}
      </main>

      {/* Bottom nav */}
      <BottomNavBar active="play" onNavigate={onNavigate} />

      {/* State switcher — prototype only */}
      <StatePill
        current={screenState}
        onChange={setScreenState}
        states={[ScreenState.EMPTY, ScreenState.LOADING, ScreenState.READY, ScreenState.ERROR, ScreenState.OFFLINE]}
      />
    </div>
  )
}
