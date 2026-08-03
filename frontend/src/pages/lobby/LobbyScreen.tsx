import { useCallback, useEffect, useState } from 'react'
import { BottomNavBar } from '@/components/ui/BottomNavBar'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { StatusBanner } from '@/components/ui/StatusBanner'
import { Toast } from '@/components/ui/Toast'
import {
  ScreenShell,
  ScreenMain,
  ScreenOfflineBanner,
} from '@/components/ui/layout'
import { LobbyHeader } from './components/LobbyHeader'
import { EloContextBadge } from './components/EloContextBadge'
import { QuickMatchCta } from './components/QuickMatchCta'
import { QuickJoinCard } from './components/QuickJoinCard'
import { AvailableRoomsCard } from './components/AvailableRoomsCard'
import { PublicRoomDetailModal } from './components/PublicRoomDetailModal'
import { AddFriendModal } from '@/components/ui/modal/AddFriendModal'
import { FriendNotificationsModal } from '@/components/ui/modal/FriendNotificationsModal'
import { HeaderProfileMenu } from '@/components/ui/modal/HeaderProfileMenu'
import { FriendProfileModal } from './components/FriendProfileModal'
import { ChallengeModal } from './components/ChallengeModal'
import { MuteInviteModal } from './components/MuteInviteModal'
import { RoomActions } from './components/RoomActions'
import { FriendRow, FriendRowSkeleton } from './components/FriendRow'
import { EmptyFriends, FriendsError, GuestWall } from './components/FriendStateCards'
import { LobbyNavShortcuts } from './components/LobbyNavShortcuts'
import { lobbyService } from '@/services/lobby/lobby.service'
import { versusRoomService, RoomNotFoundError, NoAvailableRoomsError } from '@/services/versus-room/versus-room.service'
import type { Friend } from '@/services/lobby/lobby.interface'
import type { PublicRoomSummary, Room } from '@/services/versus-room/versus-room.interface'
import { useNetworkStatus } from '@/lib/hooks/useNetworkStatus'
import { useAuthStore } from '@/stores/auth.store'
import { useInviteMuteStore, type MuteDurationOption } from '@/stores/invite-mute.store'
import { useTranslation } from '@/i18n/useTranslation'
import { GameId, RoomEntrySource } from '@/configs/enum'

// ─── Constants ──────────────────────────────────────────────────
const MAX_VISIBLE_FRIENDS = 3

// ─── Main component ──────────────────────────────────────────────
export function LobbyScreen({
  onNavigate,
  onBack,
  onLogOut,
}: {
  onNavigate?: (screen: string, room?: Room, source?: RoomEntrySource) => void
  onBack?: () => void
  onLogOut?: () => void
}) {
  const { isOffline } = useNetworkStatus()
  const user = useAuthStore((s) => s.user)
  const isGuest = user?.isGuest ?? true
  const { t } = useTranslation()
  const muteUser = useInviteMuteStore((state) => state.muteUser)

  const [friends, setFriends] = useState<Friend[]>([])
  const [availableRooms, setAvailableRooms] = useState<PublicRoomSummary[]>([])
  const [selectedRoomForDetail, setSelectedRoomForDetail] = useState<PublicRoomSummary | null>(null)
  const [selectedFriendForProfile, setSelectedFriendForProfile] = useState<Friend | null>(null)
  const [challengeTargetFriend, setChallengeTargetFriend] = useState<Friend | null>(null)
  const [addFriendModalVisible, setAddFriendModalVisible] = useState(false)
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false)
  const [incomingRequestsCount, setIncomingRequestsCount] = useState(0)
  const [muteTarget, setMuteTarget] = useState<{ handle: string; name: string } | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [headerMenuVisible, setHeaderMenuVisible] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isQuickJoining, setIsQuickJoining] = useState(false)
  const [isLoadingRooms, setIsLoadingRooms] = useState(false)
  const [isRefreshingFriends, setIsRefreshingFriends] = useState(false)
  const [friendsExpanded, setFriendsExpanded] = useState(false)

  const loadFriends = useCallback(async () => {
    if (isGuest) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setIsError(false)
    try {
      const [friendList, reqs] = await Promise.all([
        lobbyService.getFriends(),
        lobbyService.getIncomingFriendRequests(),
      ])
      setFriends(friendList)
      setIncomingRequestsCount(reqs.length)
    } catch {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }, [isGuest])

  const handleRefreshFriends = useCallback(async () => {
    if (isGuest || isRefreshingFriends) return
    setIsRefreshingFriends(true)
    try {
      const [friendList, reqs] = await Promise.all([
        lobbyService.getFriends(),
        lobbyService.getIncomingFriendRequests(),
      ])
      setFriends(friendList)
      setIncomingRequestsCount(reqs.length)
    } catch {
      // keep existing state on error
    } finally {
      setIsRefreshingFriends(false)
    }
  }, [isGuest, isRefreshingFriends])

  const loadFriendsSilent = useCallback(async () => {
    if (isGuest) return
    try {
      const [friendList, reqs] = await Promise.all([
        lobbyService.getFriends(),
        lobbyService.getIncomingFriendRequests(),
      ])
      setFriends(friendList)
      setIncomingRequestsCount(reqs.length)
    } catch {
      // keep existing state on network error
    }
  }, [isGuest])

  const loadAvailableRooms = useCallback(async () => {
    if (isGuest) return
    setIsLoadingRooms(true)
    try {
      setAvailableRooms(await versusRoomService.getAvailableRooms())
    } catch {
      // fallback handled in mock
    } finally {
      setIsLoadingRooms(false)
    }
  }, [isGuest])

  useEffect(() => {
    loadFriends()
    loadAvailableRooms()

    // Realtime Supabase postgres_changes subscription for available rooms
    const unsubscribeRooms = versusRoomService.subscribeToAvailableRooms(() => {
      loadAvailableRooms()
    })

    // Realtime Supabase postgres_changes subscription for friend requests
    const unsubscribeFriends = user?.id
      ? lobbyService.subscribeToFriendRequests(user.id, () => {
          loadFriendsSilent()
        })
      : () => {}

    // Fast background auto-refresh polling every 3 seconds for instant notifications & rooms sync
    const interval = setInterval(() => {
      loadFriendsSilent()
      loadAvailableRooms()
    }, 3 * 1000)

    return () => {
      unsubscribeRooms()
      unsubscribeFriends()
      clearInterval(interval)
    }
  }, [user?.id, loadFriends, loadFriendsSilent, loadAvailableRooms])

  const handleQuickJoin = async () => {
    if (isGuest) {
      onNavigate?.('login')
      return
    }
    setIsQuickJoining(true)
    try {
      const joinedRoom = await versusRoomService.quickJoinRoom()
      onNavigate?.('versus-room', joinedRoom, RoomEntrySource.QUICK_JOIN)
    } catch (err) {
      if (err instanceof NoAvailableRoomsError) {
        setToastMessage(t.versusRoom?.noRoomsAvailable || 'Hiện chưa có phòng công khai nào đang chờ từ người chơi khác. Vui lòng tự tạo phòng mới!')
        setTimeout(() => setToastMessage(null), 4000)
      } else {
        setToastMessage(t.versusRoom?.errorConnection || 'Không thể kết nối tới phòng. Vui lòng thử lại.')
        setTimeout(() => setToastMessage(null), 4000)
      }
    } finally {
      setIsQuickJoining(false)
    }
  }

  const handleJoinSpecificRoom = async (code: string, source = RoomEntrySource.CUSTOM) => {
    try {
      const joinedRoom = await versusRoomService.joinRoom(code)
      onNavigate?.('versus-room', joinedRoom, source)
    } catch (error) {
      const message = error instanceof RoomNotFoundError
        ? t.versusRoom.errorInvalidCode
        : t.versusRoom.errorConnection
      setToastMessage(message)
      setTimeout(() => setToastMessage(null), 4000)
    }
  }

  const handleConfirmMuteUser = (inviterHandle: string, option: MuteDurationOption, durationLabel: string) => {
    muteUser(inviterHandle, option)
    const targetName = muteTarget?.name ?? inviterHandle
    setToastMessage(t.lobby.mutedToast(targetName, durationLabel))
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Section is titled "Online friends" — offline friends still count for Profile's
  // full friends list, but don't belong in this online-only view.
  const onlineFriends = friends.filter((f) => f.status !== 'offline')
  const isEmpty = !isLoading && !isError && onlineFriends.length === 0
  const visibleFriends = friendsExpanded
    ? onlineFriends
    : onlineFriends.slice(0, MAX_VISIBLE_FRIENDS)
  const hasMoreFriends = onlineFriends.length > MAX_VISIBLE_FRIENDS

  return (
    <ScreenShell>
      <ScreenOfflineBanner
        show={isOffline}
        message={t.lobby.offlineBanner}
      />

      {/* Floating Centralized Toast Banner */}
      <Toast show={!!toastMessage} message={toastMessage ?? ''} onClose={() => setToastMessage(null)} />

      {/* Realtime 1v1 Match Challenge Modal */}
      <ChallengeModal
        friend={challengeTargetFriend}
        show={!!challengeTargetFriend}
        onClose={() => setChallengeTargetFriend(null)}
        onAccepted={(code) => {
          setChallengeTargetFriend(null)
          void handleJoinSpecificRoom(code, RoomEntrySource.CHALLENGE)
        }}
      />

      <MuteInviteModal
        inviterHandle={muteTarget?.handle ?? ''}
        inviterName={muteTarget?.name ?? ''}
        show={!!muteTarget}
        onClose={() => setMuteTarget(null)}
        onConfirmMute={handleConfirmMuteUser}
      />

      {/* Public Room Detail Popup */}
      <PublicRoomDetailModal
        room={selectedRoomForDetail}
        show={!!selectedRoomForDetail}
        onClose={() => setSelectedRoomForDetail(null)}
        onJoin={handleJoinSpecificRoom}
      />

      {/* Public Friend Profile Popup */}
      <FriendProfileModal
        friend={selectedFriendForProfile}
        show={!!selectedFriendForProfile}
        onClose={() => setSelectedFriendForProfile(null)}
        onChallenge={() => {
          const target = selectedFriendForProfile
          setSelectedFriendForProfile(null)
          setChallengeTargetFriend(target)
        }}
        onOpenMute={(handle, name) => {
          setMuteTarget({ handle, name })
        }}
      />

      {/* Header Avatar Dropdown Menu */}
      <HeaderProfileMenu
        visible={headerMenuVisible}
        unreadCount={incomingRequestsCount}
        isGuest={isGuest}
        onClose={() => setHeaderMenuVisible(false)}
        onNavigateProfile={() => onNavigate?.('profile')}
        onAddFriend={() => setAddFriendModalVisible(true)}
        onNotifications={() => setNotificationsModalVisible(true)}
        onNavigateSettings={() => onNavigate?.('settings')}
        onLogOut={onLogOut}
      />

      <ScreenMain bottomPadding="pb-32" offline={isOffline}>
        {/* Header */}
        <LobbyHeader
          skeleton={isLoading}
          onBack={onBack}
          onProfile={() => setHeaderMenuVisible((v) => !v)}
          unreadNotificationsCount={incomingRequestsCount}
        />

        {/* Divider */}
        <div
          className="mx-4"
          style={{ height: '1px', background: 'var(--ma-border-subtle)' }}
          aria-hidden="true"
        />

        {/* Player Elo context — shown when logged in */}
        {!isGuest && (
          <EloContextBadge
            skeleton={isLoading}
            elo={user?.elo ?? 0}
            name={user?.name ?? ''}
          />
        )}

        {/* Demo Incoming Invite Button (For testing UI without backend websocket) */}
        {/* Quick Match CTA — primary action */}
        {!isGuest && (
          <QuickMatchCta
            skeleton={isLoading}
            onPlay={() => onNavigate?.('matchmaking')}
          />
        )}

        {/* Quick Join CTA — instant entry */}
        {!isGuest && (
          <QuickJoinCard
            skeleton={isLoading}
            isJoining={isQuickJoining}
            onQuickJoin={handleQuickJoin}
          />
        )}

        {/* Create Room / Join Room — secondary actions */}
        {!isGuest && (
          <RoomActions
            skeleton={isLoading}
            onCreateRoom={() => onNavigate?.('create-room')}
            onJoinRoom={() => onNavigate?.('join-room')}
          />
        )}

        {/* Available Public Rooms Section */}
        {!isGuest && (
          <AvailableRoomsCard
            rooms={availableRooms}
            skeleton={isLoading}
            isLoading={isLoadingRooms}
            onRefresh={loadAvailableRooms}
            onJoinRoom={handleJoinSpecificRoom}
            onSelectRoom={setSelectedRoomForDetail}
          />
        )}

        {/* Online friends section */}
        <div className="flex flex-col gap-3">
          {isLoading ? (
            <div
              className="skeleton mx-4"
              style={{ height: '0.75rem', width: '5rem', borderRadius: 'var(--radius-sm)' }}
            />
          ) : !isGuest ? (
            <div className="flex items-center justify-between px-4">
              <SectionLabel label={t.lobby.onlineFriends} />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAddFriendModalVisible(true)}
                  className="rounded-lg px-2 py-1 text-[11px] font-semibold transition-opacity hover:opacity-80 active:opacity-60"
                  style={{ background: 'var(--ma-brand-soft)', color: 'var(--ma-brand)' }}
                >
                  + {t.addFriendModal?.title || 'Tìm & Kết Bạn'}
                </button>
                <button
                  type="button"
                  onClick={handleRefreshFriends}
                  disabled={isRefreshingFriends}
                  className="flex items-center gap-1.5 text-[12px] font-medium transition-opacity hover:opacity-75 active:opacity-50"
                  style={{ color: 'var(--ma-brand)' }}
                >
                  <span className={isRefreshingFriends ? 'animate-spin' : ''}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M23 4v6h-6M1 20v-6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {t.lobby.refreshRooms}
                </button>
              </div>
            </div>
          ) : null}

          {isLoading ? (
            <>
              <FriendRowSkeleton />
              <FriendRowSkeleton />
              <FriendRowSkeleton />
            </>
          ) : isGuest ? (
            <GuestWall onLogIn={() => onNavigate?.('login')} />
          ) : isError ? (
            <FriendsError onRetry={loadFriends} />
          ) : isEmpty ? (
            <EmptyFriends />
          ) : (
            <>
              {visibleFriends.map((f) => (
                <FriendRow
                  key={f.id}
                  friend={f}
                  onChallenge={() => setChallengeTargetFriend(f)}
                  onSelect={setSelectedFriendForProfile}
                />
              ))}
              {hasMoreFriends && (
                <button
                  type="button"
                  onClick={() => setFriendsExpanded((prev) => !prev)}
                  className="mx-4 py-1.5 text-[12px] font-semibold transition-opacity hover:opacity-70 active:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
                  style={{ color: 'var(--ma-brand)' }}
                >
                  {friendsExpanded
                    ? t.lobby.showLess
                    : t.lobby.seeAllFriends(onlineFriends.length)}
                </button>
              )}
            </>
          )}
        </div>

        {/* Navigation shortcuts — profile / leaderboard / settings */}
        {!isGuest && (
          <div className="flex flex-col gap-3">
            {isLoading ? (
              <div
                className="skeleton mx-4"
                style={{ height: '0.75rem', width: '4rem', borderRadius: 'var(--radius-sm)' }}
              />
            ) : (
              <SectionLabel label={t.lobby.goTo} />
            )}
            <LobbyNavShortcuts skeleton={isLoading} onNavigate={onNavigate} />
          </div>
        )}
      </ScreenMain>

      {/* Bottom nav */}
      <BottomNavBar active="play" onNavigate={onNavigate} />

      {/* Add friend modal */}
      <AddFriendModal
        visible={addFriendModalVisible}
        onClose={() => setAddFriendModalVisible(false)}
        onFriendAdded={loadFriends}
      />

      {/* Notifications & Friend Requests Modal */}
      <FriendNotificationsModal
        visible={notificationsModalVisible}
        onClose={() => setNotificationsModalVisible(false)}
        onUpdate={loadFriends}
      />
    </ScreenShell>
  )
}
