import { useEffect } from 'react'
import { useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query'
import { lobbyService } from './lobby.service'
import type { Friend } from './lobby.interface'
import { useAuthStore } from '@/stores/auth.store'

/**
 * Shared TanStack Query hooks for friends/friend-requests data, previously
 * fetched independently (with their own poll + Realtime-subscribe wiring)
 * by HomeScreen, LobbyScreen, and ProfileScreen. `lobbyService` itself is
 * unchanged — these hooks just call into it and share the resulting cache.
 */
function useFriendsGate() {
  const user = useAuthStore((s) => s.user)
  const isGuest = user?.isGuest ?? true
  return { userId: user?.id, enabled: !!user?.id && !isGuest }
}

export function useFriendsQuery(options?: { refetchInterval?: number }): UseQueryResult<Friend[]> {
  const { userId, enabled } = useFriendsGate()
  return useQuery({
    queryKey: ['friends', userId],
    queryFn: () => lobbyService.getFriends(),
    enabled,
    refetchInterval: options?.refetchInterval,
  })
}

export function useIncomingFriendRequestsQuery(options?: { refetchInterval?: number }): UseQueryResult<Friend[]> {
  const { userId, enabled } = useFriendsGate()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!userId) return
    return lobbyService.subscribeToFriendRequests(userId, () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests', userId] })
    })
  }, [userId, queryClient])

  return useQuery({
    queryKey: ['friendRequests', userId],
    queryFn: () => lobbyService.getIncomingFriendRequests(),
    enabled,
    refetchInterval: options?.refetchInterval,
  })
}

/** Invalidates both queries — wire this as `onFriendAdded`/`onUpdate` on AddFriendModal, FriendQrModal, and FriendNotificationsModal so a mutation on one screen updates every screen's view of the same data. */
export function useInvalidateFriendsData() {
  const { userId } = useFriendsGate()
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['friends', userId] })
    queryClient.invalidateQueries({ queryKey: ['friendRequests', userId] })
  }
}
