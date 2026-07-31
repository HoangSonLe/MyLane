import { useState } from 'react'

import { BottomNavBar } from '@/components/ui/BottomNavBar'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { StatePill } from '@/components/ui/StatePill'
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
import { MOCK_PROFILE } from '@/services/profile/profile.mock'
import type { MatchEntry } from '@/services/profile/profile.interface'

import { ScreenState } from '@/configs/enum'

interface Props {
  onBack?: () => void
  onEditProfile?: () => void
  onSettings?: () => void
  onNavigate?: (screen: string) => void
}

// ─── Main component ───────────────────────────────────────────────
export function ProfileScreen({
  onBack,
  onEditProfile,
  onSettings,
  onNavigate,
}: Props) {
  const [screenState, setScreenState] = useState<ScreenState>(ScreenState.NORMAL)
  const [selectedMatch, setSelectedMatch] = useState<MatchEntry | null>(null)

  const isLoading = screenState === ScreenState.LOADING
  const isEmpty   = screenState === ScreenState.EMPTY   // guest
  const isError   = screenState === ScreenState.ERROR
  const isOffline = screenState === ScreenState.OFFLINE

  const data = MOCK_PROFILE

  return (
    <ScreenShell>
      <ScreenOfflineBanner
        show={isOffline}
        message="You're offline. Profile data may be out of date."
      />

      <ScreenMain bottomPadding="pb-32" offline={isOffline} ariaBusy={isLoading}>
        {/* Header */}
        <ProfileHeader
          skeleton={isLoading}
          onBack={onBack}
          onSettings={onSettings}
        />

        {/* Divider */}
        <div
          className="mx-4"
          style={{ height: '1px', background: 'var(--ma-border-subtle)' }}
          aria-hidden="true"
        />

        {/* ── Loading ── */}
        {isLoading && (
          <>
            <LoadingIndicator />
            <AvatarHero skeleton data={data} />
            <EloCard skeleton data={data} />
            <BestScoresCard skeleton data={data} />
            <RecordStatsCard skeleton data={data} />
            <FriendsCard skeleton data={data} />
            <MatchHistoryCard skeleton data={data} onOpenMatch={() => {}} />
          </>
        )}

        {/* ── Guest / empty ── */}
        {isEmpty && (
          <>
            {/* Still show an anonymous avatar hero */}
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
                aria-label="Guest avatar"
              >
                <span className="text-[28px] font-bold" style={{ color: 'var(--ma-fg-subtle)' }}>
                  ?
                </span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <p className="text-[19px] font-bold" style={{ color: 'var(--ma-fg)' }}>Guest</p>
                <p className="text-[13px]" style={{ color: 'var(--ma-fg-subtle)' }}>Not signed in</p>
              </div>
            </div>
            <GuestWall onLogIn={() => onNavigate?.('login')} />
          </>
        )}

        {/* ── Error ── */}
        {isError && (
          <ErrorState onRetry={() => setScreenState(ScreenState.NORMAL)} />
        )}

        {/* ── Normal (and offline with cached data) ── */}
        {(screenState === ScreenState.NORMAL || isOffline) && (
          <>
            <AvatarHero data={data} onEdit={onEditProfile} />

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <SectionLabel label="Elo" />
                <EloCard data={data} />
              </div>

              <div className="flex flex-col gap-3">
                <SectionLabel label="Best Scores" />
                <BestScoresCard data={data} />
              </div>

              <div className="flex flex-col gap-3">
                <SectionLabel label="Record" />
                <RecordStatsCard data={data} />
              </div>

              <div className="flex flex-col gap-3">
                <SectionLabel label="Friends" />
                <FriendsCard data={data} />
              </div>

              <div className="flex flex-col gap-3">
                <SectionLabel label="History" />
                <MatchHistoryCard data={data} onOpenMatch={setSelectedMatch} />
              </div>
            </div>
          </>
        )}
      </ScreenMain>

      {/* Bottom nav */}
      <BottomNavBar active="stats" onNavigate={onNavigate} />

      {/* Prototype state pill */}
      <StatePill
        current={screenState}
        onChange={setScreenState}
        states={[ScreenState.NORMAL, ScreenState.LOADING, ScreenState.EMPTY, ScreenState.ERROR, ScreenState.OFFLINE]}
      />

      {/* Match detail dialog */}
      <MatchDetailDialog
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
      />
    </ScreenShell>
  )
}
