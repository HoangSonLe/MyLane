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
import { normalizeRoomCode, versusRoomService } from '@/services/versus-room/versus-room.service'
import { IncomingInviteModal, type IncomingInviteData } from '@/pages/lobby/components/IncomingInviteModal'
import { MuteInviteModal } from '@/pages/lobby/components/MuteInviteModal'
import { LandingScreen } from '@/pages/landing/LandingScreen'
import { LoginScreen } from '@/pages/auth/LoginScreen'
import { HomeScreen } from '@/pages/home/HomeScreen'
import { LobbyScreen } from '@/pages/lobby/LobbyScreen'
import { VersusRoomScreen } from '@/pages/versus-room/VersusRoomScreen'
import { VersusGameplayScreen } from '@/pages/versus-gameplay/VersusGameplayScreen'
import { GameSelectScreen } from '@/pages/game-select/GameSelectScreen'
import { GameplayScreen } from '@/pages/gameplay/GameplayScreen'
import { SettingsScreen } from '@/pages/settings/SettingsScreen'
import { ResultScreen } from '@/pages/result/ResultScreen'
import { ProfileScreen } from '@/pages/profile/ProfileScreen'
import { LeaderboardScreen } from '@/pages/leaderboard/LeaderboardScreen'
import { MatchmakingScreen } from '@/pages/matchmaking/MatchmakingScreen'
import type { GameResultInput } from '@/services/result/result.interface'
import type { Room } from '@/services/versus-room/versus-room.interface'
import { useInviteMuteStore, type MuteDurationOption } from '@/stores/invite-mute.store'
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
  | 'lobby'
  | 'versus-room'
  | 'versus-game'
  | 'game-select'
  | 'game'
  | 'settings'
  | 'leaderboard'
  | 'result'
  | 'profile'
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

export default function App() {
  const [history, setHistory] = useState<Screen[]>(['landing'])
  const screen = history[history.length - 1]
  const previousScreen = history[history.length - 2]

  const syncFromServer = useLocaleStore((s) => s.syncFromServer)
  const user = useAuthStore((s) => s.user)
  const isInviteMuted = useInviteMuteStore((state) => state.isMuted)
  const muteInviter = useInviteMuteStore((state) => state.muteUser)
  const [globalIncomingInvite, setGlobalIncomingInvite] = useState<IncomingInviteData | null>(null)
  const [globalMuteTarget, setGlobalMuteTarget] = useState<{ handle: string; name: string } | null>(null)
  const [sharedRoomCode, setSharedRoomCode] = useState(getSharedRoomCodeFromLocation)

  /**
   * Global Realtime listener + 2s Active Polling for incoming 1v1 match challenges from friends
   */
  useEffect(() => {
    if (!user || user.isGuest) return

    const handleNewInvite = (inviteData: any) => {
      if (isInviteMuted(inviteData.inviterHandle)) return
      setGlobalIncomingInvite((current) => {
        if (!current || current.id !== inviteData.id) {
          return {
            id: inviteData.id,
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
    const unsubscribe = matchInviteService.subscribeToIncomingInvites(user.id, handleNewInvite)

    // 2. Active 2-second fast polling backup
    const pollInterval = setInterval(() => {
      void matchInviteService.checkPendingInvite(user.id)
        .then((invite) => {
          if (invite) handleNewInvite(invite)
        })
        .catch(() => {})
    }, 2000)

    return () => {
      unsubscribe()
      clearInterval(pollInterval)
    }
  }, [isInviteMuted, user])

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
    game: GameId.SEQUENCE,
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

  function handleTabNav(id: string) {
    const target = TAB_TARGETS[id]
    if (target) push(target)
  }

  const renderActiveScreen = () => {
    switch (screen) {
      case 'landing':
        return (
          <LandingScreen
            onPlayNow={() => sharedRoomCode ? openSharedRoomEntry() : push('home')}
            onLogIn={() => sharedRoomCode ? openSharedRoomEntry() : goTo('login')}
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
            onLogOut={() => {
              lobbyService.updatePresence('offline').catch(() => {})
              resetTo('landing')
            }}
            onNavigate={(id) => {
              if (id === 'game') push('game-select')
              else if (id === 'lobby') goTo('lobby')
              else if (id === 'leaderboard') goTo('leaderboard')
              else if (id === 'settings') push('settings')
              else if (id === 'profile') push('profile')
              else handleTabNav(id)
            }}
          />
        )

      case 'lobby':
        return (
          <LobbyScreen
            onBack={() => back('home')}
            onLogOut={() => {
              lobbyService.updatePresence('offline').catch(() => {})
              resetTo('landing')
            }}
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
            onEditProfile={() => push('settings')}
            onSettings={() => push('settings')}
            onNavigate={(id) => {
              if (id === 'result') push('result')
              else if (id === 'settings') push('settings')
              else if (id === 'login') goTo('login')
              else handleTabNav(id)
            }}
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
        onOpenMute={() => {
          if (globalIncomingInvite) {
            setGlobalMuteTarget({
              handle: globalIncomingInvite.inviterHandle,
              name: globalIncomingInvite.inviterName,
            })
          }
          setGlobalIncomingInvite(null)
        }}
      />

      <MuteInviteModal
        inviterHandle={globalMuteTarget?.handle ?? ''}
        inviterName={globalMuteTarget?.name ?? ''}
        show={!!globalMuteTarget}
        onClose={() => setGlobalMuteTarget(null)}
        onConfirmMute={(handle: string, option: MuteDurationOption) => {
          muteInviter(handle, option)
          setGlobalMuteTarget(null)
        }}
      />
    </>
  )
}
