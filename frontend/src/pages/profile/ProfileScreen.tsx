import { useCallback, useEffect, useRef, useState } from 'react'

import { BottomNavBar } from '@/components/ui/BottomNavBar'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { Toast } from '@/components/ui/Toast'
import { EmptyStateCard } from '@/components/ui/card'
import { IconPlay } from '@/components/ui/icons'
import {
  ScreenShell,
  ScreenMain,
  ScreenOfflineBanner,
} from '@/components/ui/layout'
import { ProfileHeader } from './components/ProfileHeader'
import { AvatarHero } from './components/AvatarHero'
import { EloCard } from './components/EloCard'
import { BestScoresCard } from './components/BestScoresCard'
import { RecordStatsCard } from './components/RecordStatsCard'
import { FriendsCard } from './components/FriendsCard'
import { MatchHistoryCard } from './components/MatchHistoryCard'
import { GuestWall } from './components/GuestWall'
import { LoadingIndicator } from './components/LoadingIndicator'
import { ErrorState } from './components/ErrorState'
import { MatchDetailDialog } from './components/MatchDetailDialog'
import { FriendProfileModal } from '@/pages/lobby/components/FriendProfileModal'
import { profileService } from '@/services/profile/profile.service'
import { lobbyService } from '@/services/lobby/lobby.service'
import type { ProfileData, MatchEntry } from '@/services/profile/profile.interface'
import type { Friend } from '@/services/lobby/lobby.interface'
import { useNetworkStatus } from '@/lib/hooks/useNetworkStatus'
import { useAuthStore } from '@/stores/auth.store'
import { useTranslation } from '@/i18n/useTranslation'

import { AddFriendModal } from '@/components/ui/modal/AddFriendModal'

interface Props {
  onBack?: () => void
  onEditProfile?: () => void
  onSettings?: () => void
  onNavigate?: (screen: string) => void
}

export function ProfileScreen({
  onBack,
  onEditProfile,
  onSettings,
  onNavigate,
}: Props) {
  const { isOffline } = useNetworkStatus()
  const user = useAuthStore((s) => s.user)
  const isGuest = user?.isGuest ?? true
  const { t } = useTranslation()

  const [data, setData] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<MatchEntry | null>(null)
  const [selectedFriendForProfile, setSelectedFriendForProfile] = useState<Friend | null>(null)
  const [addFriendModalVisible, setAddFriendModalVisible] = useState(false)

  const [noticeVisible, setNoticeVisible] = useState(false)
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showComingSoon() {
    if (noticeTimer.current) clearTimeout(noticeTimer.current)
    setNoticeVisible(true)
    noticeTimer.current = setTimeout(() => setNoticeVisible(false), 2000)
    onEditProfile?.()
  }

  const load = useCallback(async () => {
    if (isGuest) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setIsError(false)
    try {
      const [profile, friends] = await Promise.all([
        profileService.getProfile(),
        lobbyService.getFriends(),
      ])
      setData({ ...profile, friends })
    } catch {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }, [isGuest])

  const loadSilent = useCallback(async () => {
    if (isGuest) return
    try {
      const [profile, friends] = await Promise.all([
        profileService.getProfile(),
        lobbyService.getFriends(),
      ])
      setData({ ...profile, friends })
    } catch {
      // Keep existing state on silent refresh
    }
  }, [isGuest])

  useEffect(() => {
    load()

    // Silent background auto-refresh every 10 seconds
    const interval = setInterval(() => {
      loadSilent()
    }, 10 * 1000)

    return () => clearInterval(interval)
  }, [load, loadSilent])

  return (
    <ScreenShell>
      <ScreenOfflineBanner
        show={isOffline}
        message={t.profile.offlineBanner}
      />

      <Toast visible={noticeVisible} message={t.profile.editingNotAvailable} />

      <ScreenMain bottomPadding="pb-32" offline={isOffline} ariaBusy={isLoading}>
        {/* Header */}
        <ProfileHeader
          skeleton={isLoading && !isGuest}
          onBack={onBack}
          onSettings={onSettings}
        />

        {/* Divider */}
        <div
          className="mx-4"
          style={{ height: '1px', background: 'var(--ma-border-subtle)' }}
          aria-hidden="true"
        />

        {/* ── Guest ── */}
        {isGuest && (
          <>
            <div className="flex flex-col items-center gap-3 px-4 py-4">
              <div
                className="flex items-center justify-center"
                style={{
                  height: '5rem',
                  width: '5rem',
                  borderRadius: 'var(--radius-2xl)',
                  background: 'var(--ma-surface-raised)',
                  border: '2px solid var(--ma-border)',
                  boxShadow: 'var(--ma-shadow-md)',
                }}
                aria-label={t.profile.guestAvatarAria}
              >
                <span className="text-[28px] font-bold" style={{ color: 'var(--ma-fg-subtle)' }}>
                  ?
                </span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <p className="text-[19px] font-bold" style={{ color: 'var(--ma-fg)' }}>{t.profile.guestLabel}</p>
                <p className="text-[13px]" style={{ color: 'var(--ma-fg-subtle)' }}>{t.profile.notSignedIn}</p>
              </div>
            </div>
            <GuestWall onLogIn={() => onNavigate?.('login')} />
          </>
        )}

        {/* ── Loading (signed-in) ── */}
        {!isGuest && isLoading && data === null && (
          <>
            <LoadingIndicator />
            <AvatarHero skeleton data={PLACEHOLDER} />
            <EloCard skeleton data={PLACEHOLDER} />
            <BestScoresCard skeleton data={PLACEHOLDER} />
            <RecordStatsCard skeleton data={PLACEHOLDER} />
            <FriendsCard skeleton data={PLACEHOLDER} />
            <MatchHistoryCard skeleton data={PLACEHOLDER} onOpenMatch={() => {}} />
          </>
        )}

        {/* ── Error ── */}
        {!isGuest && isError && data === null && (
          <ErrorState onRetry={load} />
        )}

        {/* ── Profile Content ── */}
        {!isGuest && data && (
          <>
            <AvatarHero data={data} onEdit={showComingSoon} />

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <SectionLabel label={t.profile.eloSection} />
                <EloCard data={data} />
              </div>

              <div className="flex flex-col gap-3">
                <SectionLabel label={t.profile.bestScoresSection} />
                <BestScoresCard data={data} />
              </div>

              <div className="flex flex-col gap-3">
                <SectionLabel label={t.profile.recordSection} />
                <RecordStatsCard data={data} />
              </div>

              <div className="flex flex-col gap-3">
                <SectionLabel label={t.profile.friendsSection} />
                <FriendsCard
                  data={data}
                  onAddFriend={() => setAddFriendModalVisible(true)}
                  onSelectFriend={setSelectedFriendForProfile}
                />
              </div>

              <div className="flex flex-col gap-3">
                <SectionLabel label={t.profile.historySection} />
                {data.matchHistory.length === 0 ? (
                  <EmptyStateCard
                    gapClassName="gap-3"
                    cardBorder="subtle"
                    cardPadding="2rem 1.5rem"
                    icon={<IconPlay />}
                    iconColor="var(--ma-brand)"
                    iconWrapperStyle={{
                      height: '2.75rem',
                      width: '2.75rem',
                      borderRadius: 'var(--radius-xl)',
                      background: 'var(--ma-brand-soft)',
                    }}
                    title={t.profile.noGamesTitle}
                    description={t.profile.noGamesDesc}
                  />
                ) : (
                  <MatchHistoryCard data={data} onOpenMatch={setSelectedMatch} />
                )}
              </div>
            </div>
          </>
        )}
      </ScreenMain>

      {/* Bottom nav */}
      <BottomNavBar active="stats" onNavigate={onNavigate} />

      {/* Match detail dialog */}
      <MatchDetailDialog
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
      />

      {/* Friend profile modal */}
      <FriendProfileModal
        friend={selectedFriendForProfile}
        show={!!selectedFriendForProfile}
        onClose={() => setSelectedFriendForProfile(null)}
        onChallenge={() => onNavigate?.('matchmaking')}
      />

      {/* Add friend modal */}
      <AddFriendModal
        visible={addFriendModalVisible}
        onClose={() => setAddFriendModalVisible(false)}
        onFriendAdded={load}
      />
    </ScreenShell>
  )
}

const PLACEHOLDER: ProfileData = {
  username: '', handle: '', joinedLabel: '', overallElo: 0,
  categoryElo: [], categoryBests: [], totalGames: 0, wins: 0, losses: 0, draws: 0,
  friends: [], matchHistory: [],
}
