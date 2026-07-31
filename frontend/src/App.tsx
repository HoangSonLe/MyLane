import { useState } from 'react'
import { EntryPoint, GameId, ModeId } from '@/configs/enum'
import { useAuthStore } from '@/stores/auth.store'
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

/**
 * Real navigation state machine — follows the flow in
 * docs/ui/screen-inventory-and-flow.md. Landing is the only entry point;
 * every other screen is reached the same way a player would reach it.
 */
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

/**
 * Screens that require a real (non-guest) account — per docs/gameplay/README.md
 * ("Login required for full features (Versus, saved records, Elo, friends, leaderboard)").
 * Guest is Solo Practice only.
 */
const GUEST_BLOCKED: Screen[] = ['lobby', 'versus-room', 'versus-game', 'leaderboard']

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [pendingScreen, setPendingScreen] = useState<Screen | null>(null)
  const [session, setSession] = useState<{ game: GameId; mode: ModeId }>({
    game: GameId.SEQUENCE,
    mode: ModeId.SOLO_PRACTICE,
  })

  /** Single choke point for navigation — redirects to Login if the target needs an account. */
  function goTo(next: Screen) {
    const { user } = useAuthStore.getState()
    if ((!user || user.isGuest) && GUEST_BLOCKED.includes(next)) {
      setPendingScreen(next)
      setScreen('login')
      return
    }
    setScreen(next)
  }

  switch (screen) {
    case 'landing':
      return (
        <LandingScreen
          onPlayNow={() => setScreen('home')}
          onLogIn={() => goTo('login')}
        />
      )

    case 'login':
      return (
        <LoginScreen
          onSuccess={() => {
            const next = pendingScreen ?? 'home'
            setPendingScreen(null)
            setScreen(next)
          }}
          onBack={() => {
            setPendingScreen(null)
            setScreen('landing')
          }}
        />
      )

    case 'home':
      return (
        <HomeScreen
          onNavigate={(id) => {
            if (id === 'game') setScreen('game-select')
            else if (id === 'lobby') goTo('lobby')
            else if (id === 'settings') setScreen('settings')
            else if (id === 'profile') setScreen('profile')
          }}
        />
      )

    case 'lobby':
      return (
        <LobbyScreen
          onBack={() => setScreen('home')}
          onNavigate={(id) => {
            if (id === 'matchmaking' || id === 'game-select' || id === 'game') setScreen('game-select')
            else if (id === 'create-room' || id === 'join-room') goTo('versus-room')
            else if (id === 'profile') setScreen('profile')
            else if (id === 'leaderboard') goTo('leaderboard')
            else if (id === 'settings') setScreen('settings')
            else if (id === 'login') goTo('login')
          }}
        />
      )

    case 'versus-room':
      return (
        <VersusRoomScreen
          onBack={() => setScreen('lobby')}
          onNavigate={(id) => {
            if (id === 'game') goTo('versus-game')
            else if (id === 'login') goTo('login')
            else if (id === 'lobby') goTo('lobby')
          }}
        />
      )

    case 'versus-game':
      return (
        <VersusGameplayScreen
          onQuit={() => setScreen('versus-room')}
          onMatchEnd={() => setScreen('lobby')}
        />
      )

    case 'game-select':
      return (
        <GameSelectScreen
          entryPoint={EntryPoint.HOME}
          onBack={() => setScreen('home')}
          onNavigate={(id, meta) => {
            if (id === 'game' || id === 'matchmaking') {
              if (meta) setSession({ game: meta.game, mode: meta.mode })
              setScreen('game')
            } else if (id === 'login') goTo('login')
            else if (id === 'settings') setScreen('settings')
          }}
        />
      )

    case 'game':
      return (
        <GameplayScreen
          gameType={session.game}
          mode={session.mode}
          onBack={() => setScreen('game-select')}
          onQuit={() => setScreen('home')}
          onGameOver={() => setScreen('result')}
        />
      )

    case 'result':
      return (
        <ResultScreen
          entryPoint={EntryPoint.HOME}
          onPlayAgain={() => setScreen('game-select')}
          onHome={() => setScreen('home')}
          onViewDetail={() => setScreen('profile')}
        />
      )

    case 'profile':
      return (
        <ProfileScreen
          onBack={() => setScreen('home')}
          onEditProfile={() => console.log('[app] Edit Profile')}
          onSettings={() => setScreen('settings')}
          onNavigate={(id) => {
            if (id === 'result') setScreen('result')
            else if (id === 'settings') setScreen('settings')
          }}
        />
      )

    case 'leaderboard':
      return (
        <LeaderboardScreen
          onBack={() => setScreen('home')}
          onViewProfile={() => setScreen('profile')}
          onNavigate={(id) => {
            if (id === 'login') goTo('login')
            else if (id === 'home') setScreen('home')
          }}
        />
      )

    case 'settings':
      return (
        <SettingsScreen
          onBack={() => setScreen('home')}
          onLogOut={() => setScreen('landing')}
        />
      )

    default: {
      const _exhaustiveCheck: never = screen
      return _exhaustiveCheck
    }
  }
}
