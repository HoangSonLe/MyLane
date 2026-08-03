import { useCallback, useEffect, useState } from 'react'
import { BottomNavBar } from '@/components/ui/BottomNavBar'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { StatusBanner } from '@/components/ui/StatusBanner'
import {
  ScreenShell,
  ScreenMain,
  ScreenOfflineBanner,
} from '@/components/ui/layout'
import { HomeHeader } from './components/HomeHeader'
import { PlayCta } from './components/PlayCta'
import { ContinueCard } from './components/ContinueCard'
import { EmptyPrompt } from './components/EmptyPrompt'
import { NavShortcuts } from './components/NavShortcuts'
import { homeService } from '@/services/home/home.service'
import { lobbyService } from '@/services/lobby/lobby.service'
import type { LastPlayed } from '@/services/home/home.interface'
import { useNetworkStatus } from '@/lib/hooks/useNetworkStatus'
import { useAuthStore } from '@/stores/auth.store'
import { useTranslation } from '@/i18n/useTranslation'
import { AddFriendModal } from '@/components/ui/modal/AddFriendModal'
import { FriendNotificationsModal } from '@/components/ui/modal/FriendNotificationsModal'
import { HeaderProfileMenu } from '@/components/ui/modal/HeaderProfileMenu'

// ─── Main component ──────────────────────────────────────────────
export function HomeScreen({
  onNavigate,
  onLogOut,
}: {
  onNavigate?: (screen: string) => void
  onLogOut?: () => void
}) {
  const { isOffline } = useNetworkStatus()
  const user = useAuthStore((s) => s.user)
  const isGuest = user?.isGuest ?? true
  const { t } = useTranslation()

  const [lastPlayed, setLastPlayed] = useState<LastPlayed | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [unreadRequestsCount, setUnreadRequestsCount] = useState(0)

  const [menuVisible, setMenuVisible] = useState(false)
  const [addFriendModalVisible, setAddFriendModalVisible] = useState(false)
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false)

  const loadHomeData = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const { lastPlayed } = await homeService.getHomeData()
      setLastPlayed(lastPlayed)

      if (!isGuest) {
        const reqs = await lobbyService.getIncomingFriendRequests()
        setUnreadRequestsCount(reqs.length)
      }
    } catch {
      setErrorMessage(t.home.loadError)
    } finally {
      setIsLoading(false)
    }
  }, [isGuest, t.home.loadError])

  useEffect(() => {
    loadHomeData()

    // Realtime Supabase postgres_changes subscription for friend requests
    const unsubscribeFriends = user?.id
      ? lobbyService.subscribeToFriendRequests(user.id, () => {
          lobbyService.getIncomingFriendRequests().then((reqs) => {
            setUnreadRequestsCount(reqs.length)
          }).catch(() => {})
        })
      : () => {}

    // Fast background auto-refresh for notification counter every 3 seconds
    const interval = setInterval(() => {
      if (!isGuest) {
        lobbyService.getIncomingFriendRequests().then((reqs) => {
          setUnreadRequestsCount(reqs.length)
        }).catch(() => {})
      }
    }, 3 * 1000)

    return () => {
      unsubscribeFriends()
      clearInterval(interval)
    }
  }, [user?.id, loadHomeData, isGuest])

  return (
    <ScreenShell>
      <ScreenOfflineBanner
        show={isOffline}
        message={t.home.offlineBanner}
      />

      <ScreenMain bottomPadding="pb-32" offline={isOffline}>
        {/* Header */}
        <HomeHeader
          skeleton={isLoading}
          isGuest={isGuest}
          playerName={user?.name}
          onProfile={() => setMenuVisible((prev) => !prev)}
          unreadNotificationsCount={unreadRequestsCount}
        />

        {/* Dropdown Menu */}
        <HeaderProfileMenu
          visible={menuVisible}
          unreadCount={unreadRequestsCount}
          isGuest={isGuest}
          onClose={() => setMenuVisible(false)}
          onNavigateProfile={() => onNavigate?.('profile')}
          onAddFriend={() => setAddFriendModalVisible(true)}
          onNotifications={() => setNotificationsModalVisible(true)}
          onNavigateSettings={() => onNavigate?.('settings')}
          onLogOut={onLogOut}
        />

        {/* Divider */}
        <div
          className="mx-4"
          style={{ height: '1px', background: 'var(--ma-border-subtle)' }}
          aria-hidden="true"
        />

        {/* Primary Play CTA — always usable, even if the rest of Home failed to load */}
        <PlayCta
          skeleton={isLoading}
          hasLastPlayed={!!lastPlayed}
          onPlay={() => onNavigate?.('game')}
        />

        {/* Continue card / empty prompt / inline error — never blocks Play above */}
        {isLoading ? (
          <ContinueCard skeleton last={null} />
        ) : errorMessage ? (
          <div className="mx-4">
            <StatusBanner variant="error" message={errorMessage} onRetry={loadHomeData} />
          </div>
        ) : lastPlayed ? (
          <ContinueCard last={lastPlayed} onResume={() => onNavigate?.('game')} />
        ) : (
          <EmptyPrompt />
        )}

        {/* Nav shortcuts section */}
        <div className="flex flex-col gap-3">
          {isLoading ? (
            <div
              className="skeleton mx-4"
              style={{ height: '0.75rem', width: '4rem', borderRadius: 'var(--radius-sm)' }}
            />
          ) : (
            <SectionLabel label={t.home.goTo} />
          )}
          <NavShortcuts
            skeleton={isLoading}
            offline={isOffline}
            onNavigate={onNavigate}
          />
        </div>
      </ScreenMain>

      {/* Bottom nav */}
      <BottomNavBar
        active="home"
        onNavigate={onNavigate}
      />

      {/* Add friend modal */}
      <AddFriendModal
        visible={addFriendModalVisible}
        onClose={() => setAddFriendModalVisible(false)}
      />

      {/* Friend Notifications modal */}
      <FriendNotificationsModal
        visible={notificationsModalVisible}
        onClose={() => setNotificationsModalVisible(false)}
        onUpdate={loadHomeData}
      />
    </ScreenShell>
  )
}
