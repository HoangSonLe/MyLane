import { useState } from 'react'
import { BottomNavBar } from '@/components/ui/BottomNavBar'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { StatePill } from '@/components/ui/StatePill'
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
import { MOCK_LAST_PLAYED } from '@/services/home/home.mock'

// ─── Types ──────────────────────────────────────────────────────
import { ScreenState } from '@/configs/enum'

// ─── Main component ──────────────────────────────────────────────
export function HomeScreen({
  onNavigate,
}: {
  onNavigate?: (screen: string) => void
}) {
  const [screenState, setScreenState] = useState<ScreenState>(ScreenState.NORMAL)

  const isLoading = screenState === ScreenState.LOADING
  const isEmpty   = screenState === ScreenState.EMPTY
  const isOffline = screenState === ScreenState.OFFLINE

  // In normal/offline: show last played. In empty: no last played.
  const lastPlayed = isEmpty ? null : MOCK_LAST_PLAYED

  // Guest in empty + offline states for variety
  const isGuest = isEmpty || isOffline

  return (
    <ScreenShell>
      <ScreenOfflineBanner
        show={isOffline}
        message="You're offline. Lobby and ranked play are unavailable."
      />

      <ScreenMain bottomPadding="pb-32" offline={isOffline}>
        {/* Header */}
        <HomeHeader
          skeleton={isLoading}
          isGuest={isGuest}
          onProfile={() => onNavigate?.('profile')}
        />

        {/* Divider */}
        <div
          className="mx-4"
          style={{ height: '1px', background: 'var(--ma-border-subtle)' }}
          aria-hidden="true"
        />

        {/* Primary Play CTA */}
        <PlayCta
          skeleton={isLoading}
          hasLastPlayed={!!lastPlayed}
          onPlay={() => onNavigate?.('game')}
        />

        {/* Continue card or empty prompt */}
        {isLoading ? (
          <ContinueCard skeleton last={null} />
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
            <SectionLabel label="Go to" />
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

      {/* State switcher — prototype only */}
      <StatePill current={screenState} onChange={setScreenState} states={[ScreenState.NORMAL, ScreenState.LOADING, ScreenState.EMPTY, ScreenState.OFFLINE]} />
    </ScreenShell>
  )
}
