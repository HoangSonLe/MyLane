import { useCallback, useEffect, useState } from 'react'

import { BottomNavBar } from '@/components/ui/BottomNavBar'
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
import { leaderboardService } from '@/services/leaderboard/leaderboard.service'
import type { BoardType, Category, LeaderboardBoard, LeaderboardEntry, SortMetric } from '@/services/leaderboard/leaderboard.interface'
import { FriendProfileModal } from '@/pages/lobby/components/FriendProfileModal'
import type { Friend } from '@/services/lobby/lobby.interface'
import { useNetworkStatus } from '@/lib/hooks/useNetworkStatus'
import { useAuthStore } from '@/stores/auth.store'
import { useTranslation } from '@/i18n/useTranslation'

interface Props {
  onBack?: () => void
  onNavigate?: (screen: string) => void
}

const EMPTY_BOARD: LeaderboardBoard = { entries: [], pinnedEntry: null, isEmpty: true }

/** Seeds FriendProfileModal instantly from the row's own data; the modal
 * re-fetches full records/win-rate itself (same as Lobby's friend rows). */
function entryToFriend(entry: LeaderboardEntry): Friend {
  return {
    id: entry.userId,
    name: entry.username,
    handle: entry.handle,
    avatarUrl: entry.avatarUrl,
    elo: entry.elo,
    status: 'offline',
  }
}

// ─── Main screen ─────────────────────────────────────────────────
export function LeaderboardScreen({ onBack, onNavigate }: Props) {
  const { isOffline } = useNetworkStatus()
  const user = useAuthStore((s) => s.user)
  const isGuest = user?.isGuest ?? true
  const { t } = useTranslation()

  const [board, setBoard] = useState<BoardType>('global-alltime')
  const [category, setCategory] = useState<Category>('color')
  const [metric, setMetric] = useState<SortMetric>('score')

  const [data, setData] = useState<LeaderboardBoard>(EMPTY_BOARD)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<Friend | null>(null)

  // Endless board forces score metric
  // Endless/Weekly/Monthly are score-only — FilterRow already hides the
  // Score/Elo toggle for them (Elo doesn't have a meaningful weekly/monthly
  // "reset"), so force score here too rather than leaving a stale 'elo'
  // selection from a previous board silently reach the backend.
  const effectiveMetric = board === 'endless' || board === 'weekly' || board === 'monthly' ? 'score' : metric

  const load = useCallback(async () => {
    if (isGuest) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setIsError(false)
    try {
      setData(await leaderboardService.getBoard({ board, category, metric: effectiveMetric }))
    } catch {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }, [isGuest, board, category, effectiveMetric])

  useEffect(() => {
    load()
  }, [load])

  return (
    <ScreenShell>
      <ScreenOfflineBanner
        show={isOffline}
        message={t.leaderboard.offlineBanner}
      />

      {/* ── Screen header ── */}
      <LeaderboardHeader
        skeleton={false}
        onBack={onBack}
      />

      <ScreenMain bottomPadding="pb-36" gap={false} topPadding="none">
        {/* ── Board-type tab bar ── */}
        <div className="flex flex-col gap-3 pt-2 pb-1">
          <BoardTabs
            active={board}
            onChange={setBoard}
            skeleton={false}
          />

          {/* ── Category + metric filters ── */}
          <FilterRow
            activeCategory={category}
            activeMetric={effectiveMetric}
            onCategoryChange={setCategory}
            onMetricChange={setMetric}
            boardType={board}
            skeleton={false}
          />
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
        {!isGuest && (
          <Card className="mx-4 overflow-hidden" shadow="sm">
            {/* List Header — Statically mounted to avoid layout shifts */}
            <ListHeader metric={effectiveMetric} boardType={board} category={category} />

            {/* Loading skeleton */}
            {isLoading && <SkeletonRows count={5} />}

            {/* Error state */}
            {!isLoading && isError && <ErrorState onRetry={load} />}

            {/* Empty state */}
            {!isLoading && !isError && data.isEmpty && (
              <EmptyState boardType={board} category={category} />
            )}

            {/* Normal / real list */}
            {!isLoading && !isError && !data.isEmpty && (
              <>
                {data.entries.map((entry, idx) => (
                  <div
                    key={entry.userId}
                    style={{ borderTop: idx > 0 ? '1px solid var(--ma-border-subtle)' : undefined }}
                  >
                    <LeaderboardRow
                      entry={entry}
                      metric={effectiveMetric}
                      isCurrentUser={!!entry.isCurrentUser}
                      onPress={() => setSelectedProfile(entryToFriend(entry))}
                    />
                  </div>
                ))}

                {/* Pinned out-of-range player row */}
                {data.pinnedEntry && (
                  <div style={{ borderTop: '1px solid var(--ma-border-subtle)' }}>
                    <PinnedPlayerRow
                      entry={data.pinnedEntry}
                      metric={effectiveMetric}
                      onPress={() => setSelectedProfile(entryToFriend(data.pinnedEntry!))}
                    />
                  </div>
                )}
              </>
            )}
          </Card>
        )}

        {/* Board reset label */}
        {!isGuest && !isLoading && !isError && <ResetLabel boardType={board} />}
      </ScreenMain>

      <BottomNavBar active="leaderboard" onNavigate={onNavigate} />

      <FriendProfileModal
        friend={selectedProfile}
        show={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
      />
    </ScreenShell>
  )
}
