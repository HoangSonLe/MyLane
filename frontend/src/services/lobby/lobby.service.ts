import { apiClient } from '@/services/http/api-client'
import { isSupabaseConfigured } from '@/services/backend-config'
import { lobbySupabaseService } from '@/services/supabase'
import type { Friend } from './lobby.interface'
import { MOCK_FRIENDS } from './lobby.mock'

export const lobbyService = {
  /** Update user online/offline/in-game presence status */
  async updatePresence(status: 'online' | 'offline' | 'in-game' = 'online'): Promise<void> {
    if (isSupabaseConfigured()) {
      return lobbySupabaseService.updatePresence(status)
    }
  },

  /** Fetches the signed-in player's friends list from Supabase/API. */
  async getFriends(): Promise<Friend[]> {
    if (isSupabaseConfigured()) {
      return lobbySupabaseService.getFriends()
    }

    const { data } = await apiClient.get<{ friends: Friend[] }>('/lobby/friends')
    return data.friends
  },

  /** Fetch the public stats shown by FriendProfileModal. */
  async getFriendProfile(friendId: string, handle?: string): Promise<Friend | null> {
    if (isSupabaseConfigured()) {
      return lobbySupabaseService.getFriendProfile(friendId, handle)
    }

    const { data } = await apiClient.get<{ friends: Friend[] }>('/lobby/friends')
    return data.friends.find((friend) => friend.id === friendId || (handle && friend.handle === handle)) ?? null
  },

  /** Searches users by handle or name */
  async searchUsers(query: string): Promise<Friend[]> {
    if (isSupabaseConfigured()) {
      return lobbySupabaseService.searchProfiles(query)
    }

    return MOCK_FRIENDS.filter(
      (f) => f.name.toLowerCase().includes(query.toLowerCase()) || f.handle.toLowerCase().includes(query.toLowerCase())
    )
  },

  /** Add user as friend */
  async addFriend(friendId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      return lobbySupabaseService.addFriend(friendId)
    }
    return true
  },

  /** Get incoming pending friend requests */
  async getIncomingFriendRequests(): Promise<Friend[]> {
    if (isSupabaseConfigured()) {
      return lobbySupabaseService.getIncomingFriendRequests()
    }
    return []
  },

  /** Respond to friend request (accept or decline) */
  async respondToFriendRequest(requesterId: string, accept: boolean): Promise<boolean> {
    if (isSupabaseConfigured()) {
      return lobbySupabaseService.respondToFriendRequest(requesterId, accept)
    }
    return true
  },

  /** Subscribe to realtime friend requests / friendship changes */
  subscribeToFriendRequests(userId: string, callback: () => void): () => void {
    if (isSupabaseConfigured()) {
      return lobbySupabaseService.subscribeToFriendRequests(userId, callback)
    }
    return () => {}
  },

  /** Get recommended active players to connect with */
  async getRecommendedFriends(): Promise<Friend[]> {
    if (isSupabaseConfigured()) {
      return lobbySupabaseService.getRecommendedFriends()
    }
    return MOCK_FRIENDS
  },
}
