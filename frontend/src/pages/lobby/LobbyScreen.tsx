import { useState } from 'react'
import { BottomNavBar } from '@/components/ui/BottomNavBar'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { StatePill } from '@/components/ui/StatePill'
import {
  ScreenShell,
  ScreenMain,
  ScreenOfflineBanner,
} from '@/components/ui/layout'
import { LobbyHeader } from './components/LobbyHeader'
import { EloContextBadge } from './components/EloContextBadge'
import { QuickMatchCta } from './components/QuickMatchCta'
import { RoomActions } from './components/RoomActions'
import { FriendRow, FriendRowSkeleton } from './components/FriendRow'
import { EmptyFriends, FriendsError, OfflineWall } from './components/FriendStateCards'
import { LobbyNavShortcuts } from './components/LobbyNavShortcuts'
import { MOCK_FRIENDS, MOCK_PLAYER } from '@/services/lobby/lobby.mock'

import { ScreenState } from '@/configs/enum'

// ─── Main component ──────────────────────────────────────────────
export function LobbyScreen({
  onNavigate,
  onBack,
}: {
  onNavigate?: (screen: string) => void
  onBack?: () => void
}) {
  const [screenState, setScreenState] = useState<ScreenState>(ScreenState.NORMAL)

  const isLoading = screenState === ScreenState.LOADING
  const isEmpty   = screenState === ScreenState.EMPTY
  const isError   = screenState === ScreenState.ERROR
  const isOffline = screenState === ScreenState.OFFLINE

  const friends = isEmpty || isError || isOffline ? [] : MOCK_FRIENDS

  return (
    <ScreenShell>
      <ScreenOfflineBanner
        show={isOffline}
        message="You're offline. Lobby and Versus require an active connection."
      />

      <ScreenMain bottomPadding="pb-32" offline={isOffline}>
        {/* Header */}
        <LobbyHeader
          skeleton={isLoading}
          onBack={onBack}
          onInvite={() => onNavigate?.('invite')}
        />

        {/* Divider */}
        <div
          className="mx-4"
          style={{ height: '1px', background: 'var(--ma-border-subtle)' }}
          aria-hidden="true"
        />

        {/* Player Elo context — shown when logged in */}
        {!isOffline && (
          <EloContextBadge
            skeleton={isLoading}
            elo={MOCK_PLAYER.elo}
            name={MOCK_PLAYER.name}
          />
        )}

        {/* Quick Match CTA — primary action */}
        {!isOffline && (
          <QuickMatchCta
            skeleton={isLoading}
            onPlay={() => onNavigate?.('matchmaking')}
          />
        )}

        {/* Create Room / Join Room — secondary actions */}
        {!isOffline && (
          <RoomActions
            skeleton={isLoading}
            onCreateRoom={() => onNavigate?.('create-room')}
            onJoinRoom={() => onNavigate?.('join-room')}
          />
        )}

        {/* Online friends section */}
        <div className="flex flex-col gap-3">
          {isLoading ? (
            <div
              className="skeleton mx-4"
              style={{ height: '0.75rem', width: '5rem', borderRadius: 'var(--radius-sm)' }}
            />
          ) : !isOffline ? (
            <SectionLabel label="Online friends" />
          ) : null}

          {isLoading ? (
            <>
              <FriendRowSkeleton />
              <FriendRowSkeleton />
              <FriendRowSkeleton />
            </>
          ) : isError ? (
            <FriendsError onRetry={() => setScreenState(ScreenState.NORMAL)} />
          ) : isOffline ? (
            <OfflineWall onLogIn={() => onNavigate?.('login')} />
          ) : isEmpty ? (
            <EmptyFriends />
          ) : (
            friends.map((f) => (
              <FriendRow
                key={f.id}
                friend={f}
                onChallenge={() => onNavigate?.('matchmaking')}
              />
            ))
          )}
        </div>

        {/* Navigation shortcuts — profile / leaderboard / settings */}
        {!isOffline && (
          <div className="flex flex-col gap-3">
            {isLoading ? (
              <div
                className="skeleton mx-4"
                style={{ height: '0.75rem', width: '4rem', borderRadius: 'var(--radius-sm)' }}
              />
            ) : (
              <SectionLabel label="Go to" />
            )}
            <LobbyNavShortcuts skeleton={isLoading} onNavigate={onNavigate} />
          </div>
        )}
      </ScreenMain>

      {/* Bottom nav */}
      <BottomNavBar active="play" onNavigate={onNavigate} />

      {/* State switcher — prototype only */}
      <StatePill
        current={screenState}
        onChange={setScreenState}
        states={[ScreenState.NORMAL, ScreenState.LOADING, ScreenState.EMPTY, ScreenState.ERROR, ScreenState.OFFLINE]}
      />
    </ScreenShell>
  )
}
