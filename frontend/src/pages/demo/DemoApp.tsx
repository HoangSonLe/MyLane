import { useState } from 'react'
import { EntryPoint } from '@/configs/enum'
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
import { DialogDemoScreen } from '@/pages/dialog/DialogDemoScreen'

/**
 * DemoApp — prototype/design-review shell only.
 *
 * Lets every screen be reached directly via a switcher, regardless of the
 * real product flow (docs/ui/screen-inventory-and-flow.md). Never wire this
 * into a production entry point — see `App.tsx` for the real navigation.
 * Reached via `?demo=1` in dev only (see `main.tsx`).
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
  | 'dialog'

const SCREENS: { id: Screen; label: string; activeColor: string; activeText: string }[] = [
  { id: 'landing', label: 'Landing', activeColor: 'var(--ma-active)', activeText: '#fff' },
  { id: 'login', label: 'Login', activeColor: 'var(--ma-progress)', activeText: '#fff' },
  { id: 'home', label: 'Home', activeColor: 'oklch(0.58 0.14 145)', activeText: '#fff' },
  { id: 'lobby', label: 'Lobby', activeColor: 'oklch(0.62 0.19 22)', activeText: '#fff' },
  { id: 'versus-room', label: 'Versus Room', activeColor: 'oklch(0.62 0.19 22)', activeText: '#fff' },
  { id: 'versus-game', label: 'Versus Game', activeColor: 'oklch(0.62 0.19 22)', activeText: '#fff' },
  { id: 'game-select', label: 'Game Select', activeColor: 'oklch(0.58 0.11 230)', activeText: '#fff' },
  { id: 'game', label: 'Game', activeColor: 'oklch(0.72 0.16 175)', activeText: '#fff' },
  { id: 'leaderboard', label: 'Leaderboard', activeColor: 'oklch(0.62 0.16 45)', activeText: '#fff' },
  { id: 'result', label: 'Result', activeColor: 'oklch(0.60 0.18 300)', activeText: '#fff' },
  { id: 'profile', label: 'Profile', activeColor: 'oklch(0.55 0.16 255)', activeText: '#fff' },
  { id: 'settings', label: 'Settings', activeColor: 'var(--ma-brand)', activeText: 'var(--ma-brand-fg)' },
  { id: 'dialog', label: 'Dialog', activeColor: 'oklch(0.62 0.19 22)', activeText: '#fff' },
]

export function DemoApp() {
  const [screen, setScreen] = useState<Screen>('landing')

  return (
    <div className="relative">
      {/* Screen switcher — prototype nav, demo-only */}
      <div
        className="fixed left-1/2 top-[52px] z-50 -translate-x-1/2"
        aria-label="Screen switcher — prototype only"
      >
        <div
          className="flex flex-wrap justify-center gap-1 rounded-2xl p-1"
          style={{
            background: 'var(--ma-surface)',
            boxShadow: 'var(--ma-shadow-md)',
            border: '1px solid var(--ma-border)',
          }}
        >
          {SCREENS.map((s) => (
            <button
              key={s.id}
              onClick={() => setScreen(s.id)}
              className={[
                'rounded-xl px-3 py-1 text-[11px] font-semibold',
                'transition-colors duration-[var(--ma-duration-micro)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
                screen !== s.id ? 'text-[var(--ma-fg-muted)] hover:text-[var(--ma-fg)]' : '',
              ].join(' ')}
              style={
                screen === s.id
                  ? { background: s.activeColor, color: s.activeText }
                  : undefined
              }
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {screen === 'landing' && (
        <LandingScreen
          onPlayNow={() => setScreen('home')}
          onLogIn={() => setScreen('login')}
        />
      )}

      {screen === 'login' && (
        <LoginScreen
          onSuccess={() => setScreen('home')}
          onBack={() => setScreen('landing')}
        />
      )}

      {screen === 'home' && (
        <HomeScreen
          onNavigate={(id) => {
            if (id === 'game') setScreen('game-select')
            else if (id === 'lobby') setScreen('lobby')
            else if (id === 'settings') setScreen('settings')
            else if (id === 'profile') setScreen('profile')
          }}
        />
      )}

      {screen === 'lobby' && (
        <LobbyScreen
          onBack={() => setScreen('home')}
          onNavigate={(id) => {
            if (id === 'matchmaking' || id === 'game-select' || id === 'game') setScreen('game-select')
            else if (id === 'create-room' || id === 'join-room') setScreen('versus-room')
            else if (id === 'profile') setScreen('profile')
            else if (id === 'leaderboard') setScreen('leaderboard')
            else if (id === 'settings') setScreen('settings')
            else if (id === 'login') setScreen('login')
          }}
        />
      )}

      {screen === 'versus-room' && (
        <VersusRoomScreen
          onBack={() => setScreen('lobby')}
          onNavigate={(id) => {
            if (id === 'game') setScreen('versus-game')
            else if (id === 'login') setScreen('login')
            else if (id === 'lobby') setScreen('lobby')
          }}
        />
      )}

      {screen === 'versus-game' && (
        <VersusGameplayScreen
          onQuit={() => setScreen('versus-room')}
          onMatchEnd={() => setScreen('lobby')}
        />
      )}

      {screen === 'game-select' && (
        <GameSelectScreen
          entryPoint={EntryPoint.HOME}
          onBack={() => setScreen('home')}
          onNavigate={(id) => {
            if (id === 'game' || id === 'matchmaking') setScreen('game')
            else if (id === 'login') setScreen('login')
            else if (id === 'settings') setScreen('settings')
          }}
        />
      )}

      {screen === 'game' && (
        <GameplayScreen
          onBack={() => setScreen('game-select')}
          onQuit={() => setScreen('home')}
        />
      )}

      {screen === 'result' && (
        <ResultScreen
          entryPoint={EntryPoint.HOME}
          onPlayAgain={() => setScreen('game-select')}
          onHome={() => setScreen('home')}
          onViewDetail={() => setScreen('profile')}
        />
      )}

      {screen === 'profile' && (
        <ProfileScreen
          onBack={() => setScreen('home')}
          onEditProfile={() => console.log('[demo] Edit Profile')}
          onSettings={() => setScreen('settings')}
          onNavigate={(id) => {
            if (id === 'result') setScreen('result')
            else if (id === 'settings') setScreen('settings')
          }}
        />
      )}

      {screen === 'leaderboard' && (
        <LeaderboardScreen
          onBack={() => setScreen('home')}
          onViewProfile={() => setScreen('profile')}
          onNavigate={(id) => {
            if (id === 'login') setScreen('login')
            else if (id === 'home') setScreen('home')
          }}
        />
      )}

      {screen === 'settings' && (
        <SettingsScreen
          onBack={() => setScreen('home')}
          onLogOut={() => setScreen('landing')}
        />
      )}

      {screen === 'dialog' && <DialogDemoScreen />}
    </div>
  )
}
