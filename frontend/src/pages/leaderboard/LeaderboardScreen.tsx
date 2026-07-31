import { useState } from 'react'

import { BottomNavBar } from '@/components/ui/BottomNavBar'
import { StatePill } from '@/components/ui/StatePill'
import { Card } from '@/components/ui/card'
import {
  ScreenShell,
  ScreenMain,
  ScreenOfflineBanner,
} from '@/components/ui/layout'
import { LeaderboardHeader } from './components/LeaderboardHeader'
import { BoardTabs } from './components/BoardTabs'
import { FilterRow } from './components/FilterRow'
import { SkeletonRows } from './components/SkeletonRows'
import { PinnedPlayerRow } from './components/PinnedPlayerRow'
import { ListHeader } from './components/ListHeader'
import { ResetLabel } from './components/ResetLabel'
import { EmptyState } from './components/EmptyState'
import { ErrorState } from './components/ErrorState'
import { OfflineNotice } from './components/OfflineNotice'
import { GuestNotice } from './components/GuestNotice'
import { LeaderboardRow } from './components/LeaderboardRow'
import {
  isEmptyBoard,
  getCurrentUserRank,
  makeMockEntries,
  makeCurrentUserEntry,
} from '@/services/leaderboard/leaderboard.mock'
import type { BoardType, Category, SortMetric } from '@/services/leaderboard/leaderboard.interface'

import { ScreenState } from '@/configs/enum'

interface Props {
  onBack?: () => void
  onViewProfile?: (userId: string) => void
  onNavigate?: (screen: string) => void
}

// ─── Main screen ─────────────────────────────────────────────────
export function LeaderboardScreen({ onBack, onViewProfile, onNavigate }: Props) {
  const [screenState, setScreenState] = useState<ScreenState>(ScreenState.NORMAL)
  const [board, setBoard] = useState<BoardType>('global-alltime')
  const [category, setCategory] = useState<Category>('number')
  const [metric, setMetric] = useState<SortMetric>('score')

  const isLoading  = screenState === ScreenState.LOADING
  const isError    = screenState === ScreenState.ERROR
  const isEmpty    = screenState === ScreenState.EMPTY || isEmptyBoard(board, category)
  const isOffline  = screenState === ScreenState.OFFLINE
  const isGuest    = screenState === ScreenState.GUEST

  const userRank = getCurrentUserRank(board, category)
  const userInTopRange = userRank <= 20
  const entries = makeMockEntries(board, category, metric, userInTopRange ? userRank : 999)
  const pinnedEntry = !userInTopRange ? makeCurrentUserEntry(board, category, metric, userRank) : null

  // Endless board forces score metric
  const effectiveMetric = board === 'endless' ? 'score' : metric

  return (
    <ScreenShell>
      <ScreenOfflineBanner
        show={isOffline}
        message="You're offline. Leaderboard data may be stale."
      />

      {/* ── Screen header ── */}
      <div className={isOffline ? '' : 'pt-16'}>
        <LeaderboardHeader
          skeleton={isLoading}
          onBack={onBack}
        />
      </div>

      <ScreenMain bottomPadding="pb-36" gap={false} topPadding="none">
        {/* ── Board-type tab bar ── */}
        <div className="flex flex-col gap-3 pt-2 pb-1">
          <BoardTabs
            active={board}
            onChange={(b) => { setBoard(b); }}
            skeleton={isLoading}
          />

          {/* ── Category + metric filters ── */}
          {!isLoading && (
            <FilterRow
              activeCategory={category}
              activeMetric={effectiveMetric}
              onCategoryChange={setCategory}
              onMetricChange={setMetric}
              boardType={board}
              skeleton={isLoading}
            />
          )}
        </div>

        {/* ── Divider ── */}
        <div
          className="mx-4 my-2"
          style={{ height: '1px', background: 'var(--ma-border-subtle)' }}
          aria-hidden="true"
        />

        {/* ── Offline notice ── */}
        {isOffline && (
          <div className="mb-3">
            <OfflineNotice />
          </div>
        )}

        {/* ── Guest notice ── */}
        {isGuest && (
          <div className="mb-3">
            <GuestNotice onLogIn={() => onNavigate?.('login')} />
          </div>
        )}

        {/* ── Main content area ── */}
        <Card className="mx-4 overflow-hidden" shadow="sm">
          {/* Loading skeleton */}
          {isLoading && (
            <>
              {/* Fake list header */}
              <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid var(--ma-border-subtle)' }}>
                <div className="skeleton" style={{ height: '0.75rem', width: '8rem', borderRadius: 'var(--radius-sm)' }} />
                <div className="skeleton" style={{ height: '0.75rem', width: '3rem', borderRadius: 'var(--radius-sm)' }} />
              </div>
              <SkeletonRows count={10} />
            </>
          )}

          {/* Error state */}
          {isError && <ErrorState onRetry={() => setScreenState(ScreenState.NORMAL)} />}

          {/* Empty state */}
          {!isLoading && !isError && isEmpty && (
            <EmptyState boardType={board} category={category} />
          )}

          {/* Normal / offline / guest list */}
          {!isLoading && !isError && !isEmpty && (
            <>
              <ListHeader metric={effectiveMetric} boardType={board} category={category} />

              {/* Ranked rows */}
              {entries.map((entry, idx) => (
                <div
                  key={entry.userId}
                  style={{ borderTop: idx > 0 ? '1px solid var(--ma-border-subtle)' : undefined }}
                >
                  <LeaderboardRow
                    entry={entry}
                    metric={effectiveMetric}
                    isCurrentUser={!isGuest && !!entry.isCurrentUser}
                    onPress={() => onViewProfile?.(entry.userId)}
                  />
                </div>
              ))}

              {/* Pinned out-of-range player row */}
              {!isGuest && pinnedEntry && (
                <div style={{ borderTop: '1px solid var(--ma-border-subtle)' }}>
                  <PinnedPlayerRow
                    entry={pinnedEntry}
                    metric={effectiveMetric}
                    onPress={() => onViewProfile?.(pinnedEntry.userId)}
                  />
                </div>
              )}
            </>
          )}
        </Card>

        {/* Board reset label */}
        {!isLoading && !isError && <ResetLabel boardType={board} />}
      </ScreenMain>

      <BottomNavBar active="leaderboard" onNavigate={onNavigate} />
      <StatePill
        current={screenState}
        onChange={setScreenState}
        states={[ScreenState.NORMAL, ScreenState.LOADING, ScreenState.EMPTY, ScreenState.ERROR, ScreenState.OFFLINE, ScreenState.GUEST]}
      />
    </ScreenShell>
  )
}
