import { useEffect, useState, useCallback, useRef } from 'react'
import { DifficultyId, EntryPoint, GameId, ModeId, RoomEntrySource, RoundMode } from '@/configs/enum'
import { useAuthStore } from '@/stores/auth.store'
import { useLocaleStore } from '@/stores/locale.store'
import { useSoundsStore } from '@/stores/sounds.store'
import { useHapticsStore } from '@/stores/haptics.store'
import { useThemeStore } from '@/stores/theme.store'
import { settingsService } from '@/services/settings/settings.service'
import { lobbyService } from '@/services/lobby/lobby.service'
import { matchInviteService } from '@/services/match-invite/match-invite.service'
import type { MatchInviteData } from '@/services/match-invite/match-invite.interface'
import { normalizeRoomCode, versusRoomService } from '@/services/versus-room/versus-room.service'
import { isSupabaseConfigured } from '@/services/backend-config'
import { supabaseService } from '@/services/supabase'
import { accessLogService } from '@/services/access-log/access-log.service'
import { IncomingInviteModal, type IncomingInviteData } from '@/pages/lobby/components/IncomingInviteModal'
import { MuteInviteModal } from '@/pages/lobby/components/MuteInviteModal'
import { WelcomeOnboardingModal } from '@/components/ui/modal/WelcomeOnboardingModal'
import { LogOutDialog } from '@/pages/settings/components/LogOutDialog'
import { LandingScreen } from '@/pages/landing/LandingScreen'
import { LoginScreen } from '@/pages/auth/LoginScreen'
import { HomeScreen } from '@/pages/home/HomeScreen'
import { StoryScreen } from '@/pages/story/StoryScreen'
import { LobbyScreen } from '@/pages/lobby/LobbyScreen'
import { VersusRoomScreen } from '@/pages/versus-room/VersusRoomScreen'
import { VersusGameplayScreen } from '@/pages/versus-gameplay/VersusGameplayScreen'
import { GameSelectScreen } from '@/pages/game-select/GameSelectScreen'
import { GameplayScreen } from '@/pages/gameplay/GameplayScreen'
import { SettingsScreen } from '@/pages/settings/SettingsScreen'
import { ResultScreen } from '@/pages/result/ResultScreen'
import { ProfileScreen } from '@/pages/profile/ProfileScreen'
import { EditProfileScreen } from '@/pages/profile/EditProfileScreen'
import { LeaderboardScreen } from '@/pages/leaderboard/LeaderboardScreen'
import { MatchmakingScreen } from '@/pages/matchmaking/MatchmakingScreen'
import type { GameResultInput } from '@/services/result/result.interface'
import type { Room } from '@/services/versus-room/versus-room.interface'
import {
  useInviteMuteStore,
  type InviteMuteTarget,
  type MuteDurationOption,
} from '@/stores/invite-mute.store'
import {
  clearResumeState,
  loadResumeState,
  saveResumeState,
  type ResumableScreen,
  type ResumeState,
} from '@/lib/utils/session-resume'

type Screen =
  | 'landing'
  | 'login'
  | 'home'
  | 'story'
  | 'lobby'
  | 'versus-room'
  | 'versus-game'
  | 'game-select'
  | 'game'
  | 'settings'
  | 'leaderboard'
  | 'result'
  | 'profile'
  | 'edit-profile'
  | 'matchmaking'

const GUEST_BLOCKED: Screen[] = ['lobby', 'versus-room', 'versus-game', 'leaderboard', 'matchmaking']
const RESUMABLE_SCREENS: Screen[] = ['game', 'versus-room', 'versus-game']

const TAB_TARGETS: Record<string, Screen> = {
  home: 'home',
  play: 'game-select',
  stats: 'profile',
  settings: 'settings',
}

function getSharedRoomCodeFromLocation(): string {
  const queryCode = new URLSearchParams(window.location.search).get('room')
  if (queryCode) return normalizeRoomCode(queryCode)
  const match = window.location.pathname.match(/^\/(?:versus-room|r)\/([^/?#]+)/i)
  return match ? normalizeRoomCode(match[1]) : ''
}

function getSharedFriendIdFromLocation(): string {
  const params = new URLSearchParams(window.location.search)
  if (params.get('v') !== '1') return ''
  return params.get('friend')?.trim() || ''
}

export default function App() {
  const [history, setHistory] = useState<Screen[]>(['landing'])
  const screen = history[history.length - 1]
  const previousScreen = history[history.length - 2]

  const syncFromServer = useLocaleStore((s) => s.syncFromServer)
  const user = useAuthStore((s) => s.user)
  const isInitialized = useAuthStore((s) => s.isInitialized)
  const inviteAccountId = user && !user.isGuest ? user.id : null
  const isInviteMuted = useInviteMuteStore((state) => state.isMuted)
  const muteInviter = useInviteMuteStore((state) => state.muteUser)
  const syncInviteMutes = useInviteMuteStore((state) => state.syncAccount)
  const subscribeToInviteMutes = useInviteMuteStore((state) => state.subscribeToAccount)
  const clearInviteMutes = useInviteMuteStore((state) => state.clearAccount)
  const inviteMutesHydrated = useInviteMuteStore((state) => state.isHydrated)
  const accountMutedMap = useInviteMuteStore((state) => state.accountMutedMap)
  const sessionMutedMap = useInviteMuteStore((state) => state.sessionMutedMap)
  const [globalIncomingInvite, setGlobalIncomingInvite] = useState<IncomingInviteData | null>(null)
  const [globalMuteTarget, setGlobalMuteTarget] = useState<(InviteMuteTarget & { name: string }) | null>(null)
  const [sharedRoomCode, setSharedRoomCode] = useState(getSharedRoomCodeFromLocation)
  const [sharedFriendId, setSharedFriendId] = useState(getSharedFriendIdFromLocation)
  const [welcomeModalVisible, setWelcomeModalVisible] = useState(false)

  // Trigger Welcome Onboarding modal ONCE per account — synced with Database & localStorage
  useEffect(() => {
    if (user && !user.isGuest && user.id) {
      const storageKey = `gb_has_seen_onboarding_${user.id}`
      const localHasSeen = localStorage.getItem(storageKey) === 'true'

      if (localHasSeen) return

      if (isSupabaseConfigured()) {
        supabaseService.getSettings().then((remoteSettings) => {
          if (remoteSettings?.has_seen_onboarding) {
            localStorage.setItem(storageKey, 'true')
          } else {
            setWelcomeModalVisible(true)
          }
        }).catch(() => {
          setWelcomeModalVisible(true)
        })
      } else {
        setWelcomeModalVisible(true)
      }
    }
  }, [user])

  const handleCloseWelcomeModal = useCallback(() => {
    if (user?.id) {
      const storageKey = `gb_has_seen_onboarding_${user.id}`
      localStorage.setItem(storageKey, 'true')
      if (isSupabaseConfigured()) {
        void supabaseService.updateSettings({ hasSeenOnboarding: true })
      }
    }
    setWelcomeModalVisible(false)
  }, [user?.id])

  // Log user / visitor access on page/screen navigation (Only AFTER auth session is initialized)
  useEffect(() => {
    if (!isInitialized) return
    void accessLogService.logAccess({ user, pagePath: `/${screen}` })
  }, [isInitialized, user?.id, screen])

  /** Hydrate account-scoped mutes before incoming invite listeners start. */
  useEffect(() => {
    if (!inviteAccountId) {
      clearInviteMutes()
      return
    }

    let disposed = false
    let unsubscribe = () => {}
    void syncInviteMutes(inviteAccountId).then(() => {
      if (!disposed) unsubscribe = subscribeToInviteMutes(inviteAccountId)
    })

    return () => {
      disposed = true
      unsubscribe()
      clearInviteMutes()
    }
  }, [clearInviteMutes, inviteAccountId, subscribeToInviteMutes, syncInviteMutes])

  /** Global Realtime listener + 2s polling for incoming 1v1 challenges. */
  useEffect(() => {
    if (!inviteAccountId || !inviteMutesHydrated) return

    const handleNewInvite = (inviteData: MatchInviteData) => {
      if (isInviteMuted({ userId: inviteData.inviterId, handle: inviteData.inviterHandle })) return
      setGlobalIncomingInvite((current) => {
        if (!current || current.id !== inviteData.id) {
          return {
            id: inviteData.id,
            inviterId: inviteData.inviterId,
            inviterName: inviteData.inviterName,
            inviterHandle: inviteData.inviterHandle,
            inviterElo: inviteData.inviterElo,
            gameCategory: inviteData.category,
            difficulty: inviteData.difficulty,
            mode: inviteData.mode,
            roomCode: inviteData.roomCode,
          }
        }
        return current
      })
    }

    // 1. Realtime WebSocket listener
    const unsubscribe = matchInviteService.subscribeToIncomingInvites(inviteAccountId, handleNewInvite)

    // 2. Active 2-second fast polling backup
    const pollInterval = setInterval(() => {
      void matchInviteService.checkPendingInvite(inviteAccountId)
        .then((invite) => {
          if (invite) handleNewInvite(invite)
        })
        .catch(() => {})
    }, 2000)

    return () => {
      unsubscribe()
      clearInterval(pollInterval)
    }
  }, [inviteAccountId, inviteMutesHydrated, isInviteMuted])

  /** A mute arriving from another device also dismisses a visible invite. */
  useEffect(() => {
    if (!globalIncomingInvite) return
    if (isInviteMuted({
      userId: globalIncomingInvite.inviterId,
      handle: globalIncomingInvite.inviterHandle,
    })) {
      setGlobalIncomingInvite(null)
    }
  }, [accountMutedMap, globalIncomingInvite, isInviteMuted, sessionMutedMap])

  /**
   * Heartbeat to keep user presence ('online' | 'in-game') updated in Supabase
   */
  useEffect(() => {
    if (!user || user.isGuest) return

    const isGameplay = screen === 'game' || screen === 'versus-game'
    const status = isGameplay ? 'in-game' : 'online'

    // Initial heartbeat update
    lobbyService.updatePresence(status).catch(() => {})

    // Heartbeat timer every 30 seconds
    const interval = setInterval(() => {
      lobbyService.updatePresence(status).catch(() => {})
    }, 30 * 1000)

    return () => {
      clearInterval(interval)
    }
  }, [user, screen])

  /**
   * Sync settings (locale, sounds, haptics, theme) from the server whenever a real user session
   * becomes available.
   */
  useEffect(() => {
    if (!user || user.isGuest) return
    settingsService.getSettings()
      .then((settings) => {
        if (settings.locale) syncFromServer(settings.locale)
        if (settings.theme) useThemeStore.getState().setTheme(settings.theme)
        if (typeof settings.sounds === 'boolean') useSoundsStore.getState().setEnabled(settings.sounds)
        if (typeof settings.haptics === 'boolean') useHapticsStore.getState().setEnabled(settings.haptics)
      })
      .catch(() => { /* fallback to local storage cache */ })
  }, [user, syncFromServer])

  /** Reset window & container scroll position to top whenever active screen changes */
  useEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.scrollTop = 0
    }
  }, [screen])

  const [pendingScreen, setPendingScreen] = useState<Screen | null>(null)
  const [roomTab, setRoomTab] = useState<'create' | 'join'>(() => sharedRoomCode ? 'join' : 'create')
  const [session, setSession] = useState<{ game: GameId; mode: ModeId; difficulty: DifficultyId }>({
    game: GameId.COLOR,
    mode: ModeId.SOLO_PRACTICE,
    difficulty: DifficultyId.MEDIUM,
  })
  const [lastGameResult, setLastGameResult] = useState<GameResultInput | null>(null)
  const [matchedVersusRoom, setMatchedVersusRoom] = useState<Room | null>(null)
  const [roomEntrySource, setRoomEntrySource] = useState<RoomEntrySource>(RoomEntrySource.CUSTOM)

  // Resume-on-reload (docs/technical/known-gaps.md "Resume-on-reload"): read
  // once at boot, before anything else touches sessionStorage this tick —
  // never updated again, so a ref expresses that better than state.
  const resumeTarget = useRef<ResumeState | null>(loadResumeState()).current

  /**
   * Keep the resume snapshot in sync with navigation: while the player is on
   * a resumable screen, persist just enough to rebuild it (screen + session +
   * room code); leaving that screen for anywhere else clears it so a stale
   * snapshot never fires later (e.g. after Result, or after a deliberate Quit).
   */
  useEffect(() => {
    if (RESUMABLE_SCREENS.includes(screen)) {
      saveResumeState({
        screen: screen as ResumableScreen,
        session,
        roomCode: matchedVersusRoom?.code,
        roomEntrySource,
      })
    } else {
      clearResumeState()
    }
  }, [screen, session, matchedVersusRoom, roomEntrySource])

  function push(next: Screen) {
    setHistory((h) => [...h, next])
  }

  function replace(next: Screen) {
    setHistory((h) => [...h.slice(0, -1), next])
  }

  function back(fallback: Screen = 'home') {
    setHistory((h) => (h.length > 1 ? h.slice(0, -1) : [fallback]))
  }

  function resetTo(target: Screen) {
    setHistory([target])
  }

  function goTo(next: Screen) {
    const { user } = useAuthStore.getState()
    if ((!user || user.isGuest) && GUEST_BLOCKED.includes(next)) {
      setPendingScreen(next)
      push('login')
      return
    }
    push(next)
  }

  function openSharedRoomEntry() {
    setMatchedVersusRoom(null)
    setRoomEntrySource(RoomEntrySource.CUSTOM)
    setRoomTab('join')
    goTo('versus-room')
  }

  function openSharedFriendEntry() {
    const activeUser = useAuthStore.getState().user
    if (!activeUser || activeUser.isGuest) {
      setPendingScreen('profile')
      push('login')
      return
    }
    push('profile')
  }

  function openLandingDestination() {
    if (sharedRoomCode) openSharedRoomEntry()
    else if (sharedFriendId) openSharedFriendEntry()
    else push('home')
  }

  function openLandingLoginDestination() {
    if (sharedRoomCode) openSharedRoomEntry()
    else if (sharedFriendId) openSharedFriendEntry()
    else goTo('login')
  }

  // Bug fix: a room created while waiting for an opponent (Quick Match's
  // "auto-create room" branch or a manual Custom Room) has no server-side
  // expiry — only `leave_versus_room` removes it. Logging out previously
  // skipped this entirely, so the room stayed 'waiting' forever (visible to
  // other accounts / re-joinable) even after the host signed out. Only the
  // 'waiting' case is left here; an in-progress match must keep going through
  // forfeit, not a silent logout side-effect.
  async function leaveActiveWaitingRoom() {
    const activeRoom = matchedVersusRoom
    if (!activeRoom || activeRoom.status === 'in_progress') return
    await versusRoomService.leaveRoom(activeRoom.code).catch(() => {})
    setMatchedVersusRoom(null)
  }

  const [headerLogOutDialogVisible, setHeaderLogOutDialogVisible] = useState(false)
  const [headerLogOutBusy, setHeaderLogOutBusy] = useState(false)

  function logOutFromHeader() {
    setHeaderLogOutDialogVisible(true)
  }

  async function handleConfirmHeaderLogOut() {
    setHeaderLogOutBusy(true)
    try {
      await leaveActiveWaitingRoom()
      await lobbyService.updatePresence('offline').catch(() => {})
      await useAuthStore.getState().logout()
      resetTo('landing')
    } finally {
      setHeaderLogOutBusy(false)
      setHeaderLogOutDialogVisible(false)
    }
  }

  function handleTabNav(id: string) {
    const target = TAB_TARGETS[id]
    if (target) push(target)
  }

  const renderActiveScreen = () => {
    switch (screen) {
      case 'landing':
        return (
          <LandingScreen
            onPlayNow={openLandingDestination}
            onLogIn={openLandingLoginDestination}
            resumeTarget={resumeTarget}
            onResume={async (resume) => {
              if (resume.screen === 'game') {
                setSession(resume.session)
                resetTo('game')
                return
              }
              // Versus: room state lives server-side — refetch it rather than
              // trusting the locally-cached screen, and let the server's
              // status decide Ready Room vs. live match (docs/technical/
              // known-gaps.md "Resume-on-reload").
              if (!resume.roomCode) { push('home'); return }
              const room = await versusRoomService.getRoom(resume.roomCode).catch(() => null)
              if (room?.status === 'in_progress' || room?.status === 'waiting') {
                setSession(resume.session)
                setRoomEntrySource(resume.roomEntrySource ?? RoomEntrySource.CUSTOM)
                setMatchedVersusRoom(room)
                resetTo(room.status === 'in_progress' ? 'versus-game' : 'versus-room')
              } else {
                clearResumeState()
                resetTo('lobby')
              }
            }}
          />
        )

      case 'login':
        return (
          <LoginScreen
            fromGuest={Boolean(user?.isGuest)}
            onSuccess={() => {
              const next = pendingScreen ?? 'home'
              setPendingScreen(null)
              replace(next)
            }}
            onBack={() => {
              setPendingScreen(null)
              back('landing')
            }}
          />
        )

      case 'home':
        return (
          <HomeScreen
            onLogOut={logOutFromHeader}
            onNavigate={(id) => {
              if (id === 'game') push('game-select')
              else if (id === 'lobby') goTo('lobby')
              else if (id === 'leaderboard') goTo('leaderboard')
              else if (id === 'settings') push('settings')
              else if (id === 'profile') push('profile')
              else if (id === 'story') push('story')
              else handleTabNav(id)
            }}
          />
        )

      case 'story':
        return (
          <StoryScreen
            onBack={() => back('home')}
            onPlay={() => push('game-select')}
          />
        )

      case 'lobby':
        return (
          <LobbyScreen
            onBack={() => back('home')}
            onLogOut={logOutFromHeader}
            onNavigate={(id, room, source) => {
              if (id === 'matchmaking') goTo('matchmaking')
              else if (id === 'game-select' || id === 'game') push('game-select')
              else if (id === 'create-room') { setMatchedVersusRoom(null); setRoomEntrySource(RoomEntrySource.CUSTOM); setRoomTab('create'); goTo('versus-room') }
              else if (id === 'join-room') { setMatchedVersusRoom(null); setRoomEntrySource(RoomEntrySource.CUSTOM); setRoomTab('join'); goTo('versus-room') }
              else if (id === 'versus-room' && room) {
                setMatchedVersusRoom(room)
                setRoomEntrySource(source || RoomEntrySource.CUSTOM)
                goTo('versus-room')
              }
              else if (id === 'profile') push('profile')
              else if (id === 'leaderboard') goTo('leaderboard')
              else if (id === 'settings') push('settings')
              else if (id === 'login') goTo('login')
              else handleTabNav(id)
            }}
          />
        )

      case 'matchmaking':
        return (
          <MatchmakingScreen
            onBack={() => back('lobby')}
            initialCategory={session.game}
            initialDifficulty={session.difficulty}
            onMatched={(matchedRoom, source) => {
              setMatchedVersusRoom(matchedRoom)
              setRoomEntrySource(source)
              replace('versus-room')
            }}
          />
        )

      case 'versus-room':
        return (
          <VersusRoomScreen
            initialTab={roomTab}
            initialRoom={matchedVersusRoom}
            initialEntrySource={roomEntrySource}
            initialJoinCode={sharedRoomCode}
            onRoomLinkConsumed={() => {
              if (!sharedRoomCode) return
              setSharedRoomCode('')
              window.history.replaceState({}, '', '/')
            }}
            onBack={() => {
              setMatchedVersusRoom(null)
              setRoomEntrySource(RoomEntrySource.CUSTOM)
              back('lobby')
            }}
            onNavigate={(id, activeRoom) => {
              if (id === 'game') {
                if (activeRoom) {
                  setMatchedVersusRoom(activeRoom)
                  setSession({
                    game: activeRoom.category,
                    mode: activeRoom.mode === RoundMode.VERSUS_RANKED ? ModeId.VERSUS_RANKED : ModeId.VERSUS_UNRANKED,
                    difficulty: activeRoom.difficulty,
                  })
                }
                setLastGameResult(null)
                goTo('versus-game')
              }
              else if (id === 'login') goTo('login')
              else if (id === 'lobby') {
                setMatchedVersusRoom(null)
                setRoomEntrySource(RoomEntrySource.CUSTOM)
                resetTo('lobby')
              }
              else handleTabNav(id)
            }}
          />
        )

      case 'versus-game':
        return (
          <VersusGameplayScreen
            room={matchedVersusRoom}
            gameType={matchedVersusRoom?.category}
            roundMode={matchedVersusRoom?.mode}
            difficulty={matchedVersusRoom?.difficulty}
            seed={matchedVersusRoom?.seed}
            onQuit={async () => {
              const activeRoom = matchedVersusRoom
              if (activeRoom?.code) {
                await versusRoomService.forfeitMatch(activeRoom.code).catch(() => {})
              }
              setMatchedVersusRoom(null)
              setRoomEntrySource(RoomEntrySource.CUSTOM)
              resetTo('lobby')
            }}
            onMatchEnd={(result) => {
              setLastGameResult(result)
              // Natural end → ResultScreen to show ELO change (doc Section 6)
              setMatchedVersusRoom(null)
              push('result')
            }}
          />
        )

      case 'game-select':
        return (
          <GameSelectScreen
            entryPoint={previousScreen === 'lobby' ? EntryPoint.LOBBY : EntryPoint.HOME}
            onBack={() => back('home')}
            onNavigate={(id, meta) => {
              if (id === 'matchmaking') {
                if (meta) setSession({ game: meta.game, mode: meta.mode, difficulty: meta.difficulty })
                goTo('matchmaking')
              } else if (id === 'game') {
                if (meta) setSession({ game: meta.game, mode: meta.mode, difficulty: meta.difficulty })
                push('game')
              } else if (id === 'login') goTo('login')
              else if (id === 'settings') push('settings')
              else handleTabNav(id)
            }}
          />
        )

      case 'game':
        return (
          <GameplayScreen
            gameType={session.game}
            mode={session.mode}
            difficulty={session.difficulty}
            onBack={() => back('game-select')}
            onQuit={() => resetTo('home')}
            onGameOver={(result) => { setLastGameResult(result); push('result') }}
          />
        )

      case 'result':
        return (
          <ResultScreen
            result={lastGameResult}
            entryPoint={EntryPoint.HOME}
            onPlayAgain={() => {
              const isVersus = lastGameResult?.mode === ModeId.VERSUS_RANKED || lastGameResult?.mode === ModeId.VERSUS_UNRANKED
              if (lastGameResult?.mode === ModeId.VERSUS_RANKED) {
                setSession({ game: lastGameResult.game, mode: lastGameResult.mode, difficulty: lastGameResult.difficulty })
                goTo('matchmaking')
              } else if (isVersus) {
                resetTo('lobby')
              } else {
                push('game-select')
              }
            }}
            onHome={() => {
              const isVersus = lastGameResult?.mode === ModeId.VERSUS_RANKED || lastGameResult?.mode === ModeId.VERSUS_UNRANKED
              resetTo(isVersus ? 'lobby' : 'home')
            }}
            onViewDetail={() => push('profile')}
            onLogIn={() => goTo('login')}
            onNavigate={(id) => {
              if (id === 'login') goTo('login')
              else handleTabNav(id)
            }}
          />
        )

      case 'profile':
        return (
          <ProfileScreen
            onBack={() => back('home')}
            onEditProfile={() => push('edit-profile')}
            onSettings={() => push('settings')}
            onChallengeAccepted={async (roomCode) => {
              const room = await versusRoomService.joinRoom(roomCode)
              setMatchedVersusRoom(room)
              setRoomEntrySource(RoomEntrySource.CHALLENGE)
              goTo('versus-room')
            }}
            initialFriendCode={sharedFriendId}
            onFriendCodeConsumed={() => {
              if (!sharedFriendId) return
              setSharedFriendId('')
              const url = new URL(window.location.href)
              url.searchParams.delete('friend')
              url.searchParams.delete('v')
              window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
            }}
            onNavigate={(id) => {
              if (id === 'result') push('result')
              else if (id === 'settings') push('settings')
              else if (id === 'login') goTo('login')
              else handleTabNav(id)
            }}
          />
        )

      case 'edit-profile':
        return (
          <EditProfileScreen
            onBack={() => back('profile')}
            onSaved={() => back('profile')}
          />
        )

      case 'leaderboard':
        return (
          <LeaderboardScreen
            onBack={() => back('home')}
            onViewProfile={() => push('profile')}
            onNavigate={(id) => {
              if (id === 'login') goTo('login')
              else if (id === 'home') resetTo('home')
              else handleTabNav(id)
            }}
          />
        )

      case 'settings':
        return (
          <SettingsScreen
            onBack={() => back('home')}
            onBeforeLogOut={leaveActiveWaitingRoom}
            onLogOut={() => {
              lobbyService.updatePresence('offline').catch(() => {})
              resetTo('landing')
            }}
            onNavigate={handleTabNav}
          />
        )

      default: {
        const _exhaustiveCheck: never = screen
        return _exhaustiveCheck
      }
    }
  }

  return (
    <>
      {renderActiveScreen()}

      {/* Global Realtime 1v1 Match Challenge Invitation Modal */}
      <IncomingInviteModal
        invite={globalIncomingInvite}
        show={!!globalIncomingInvite}
        onAccept={async () => {
          const invite = globalIncomingInvite
          setGlobalIncomingInvite(null)
          try {
            const response = invite?.id
              ? await matchInviteService.respondToInvite(invite.id, true)
              : { roomCode: invite?.roomCode || null }
            if (response.roomCode) {
              const room = await versusRoomService.joinRoom(response.roomCode)
              setMatchedVersusRoom(room)
              setRoomEntrySource(RoomEntrySource.CHALLENGE)
              goTo('versus-room')
            }
          } catch {
            // Stay on the current screen if the invite expired or room was occupied.
          }
        }}
        onDecline={async () => {
          if (globalIncomingInvite?.id) {
            await matchInviteService.respondToInvite(globalIncomingInvite.id, false)
          }
          setGlobalIncomingInvite(null)
        }}
        onOpenMute={(userId, handle, name) => {
          setGlobalMuteTarget({ userId, handle, name })
        }}
      />

      <MuteInviteModal
        inviterHandle={globalMuteTarget?.handle ?? ''}
        inviterName={globalMuteTarget?.name ?? ''}
        show={!!globalMuteTarget}
        onClose={() => setGlobalMuteTarget(null)}
        onConfirmMute={(_handle: string, option: MuteDurationOption) => {
          if (globalMuteTarget) void muteInviter(globalMuteTarget, option)
          setGlobalIncomingInvite(null)
          setGlobalMuteTarget(null)
        }}
      />

      <WelcomeOnboardingModal
        visible={welcomeModalVisible}
        onClose={handleCloseWelcomeModal}
        onStartPlaying={() => {
          goTo('game-select')
        }}
      />

      <LogOutDialog
        visible={headerLogOutDialogVisible}
        busy={headerLogOutBusy}
        onConfirm={handleConfirmHeaderLogOut}
        onCancel={() => setHeaderLogOutDialogVisible(false)}
      />
    </>
  )
}
