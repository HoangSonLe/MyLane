import { getSupabaseClient } from './supabase.client'
import { authSupabaseService } from './auth.supabase'
import { profileSupabaseService } from './profile.supabase'
import { lobbySupabaseService } from './lobby.supabase'
import { gameSupabaseService } from './game.supabase'
import { versusSupabaseService } from './versus.supabase'
import { matchInviteSupabaseService } from './match-invite.supabase'
import { settingsSupabaseService } from './settings.supabase'
import { matchmakingSupabaseService } from './matchmaking.supabase'

export { getSupabaseClient } from './supabase.client'
export { authSupabaseService } from './auth.supabase'
export { profileSupabaseService } from './profile.supabase'
export { lobbySupabaseService } from './lobby.supabase'
export { gameSupabaseService } from './game.supabase'
export { versusSupabaseService } from './versus.supabase'
export { matchInviteSupabaseService } from './match-invite.supabase'
export { settingsSupabaseService } from './settings.supabase'
export { matchmakingSupabaseService } from './matchmaking.supabase'

/**
 * Unified Supabase Service Facade (Aggregates all domain Supabase services)
 * Provides 100% backward compatibility for legacy single-object callers.
 */
export const supabaseService = {
  // Auth
  registerWithEmail: authSupabaseService.registerWithEmail.bind(authSupabaseService),
  loginWithEmail: authSupabaseService.loginWithEmail.bind(authSupabaseService),
  loginAsGuest: authSupabaseService.loginAsGuest.bind(authSupabaseService),
  logout: authSupabaseService.logout.bind(authSupabaseService),

  // Profile & Stats
  getProfile: profileSupabaseService.getProfile.bind(profileSupabaseService),

  // Lobby, Friends & Presence
  updatePresence: lobbySupabaseService.updatePresence.bind(lobbySupabaseService),
  getFriends: lobbySupabaseService.getFriends.bind(lobbySupabaseService),
  searchProfiles: lobbySupabaseService.searchProfiles.bind(lobbySupabaseService),
  addFriend: lobbySupabaseService.addFriend.bind(lobbySupabaseService),
  getIncomingFriendRequests: lobbySupabaseService.getIncomingFriendRequests.bind(lobbySupabaseService),
  respondToFriendRequest: lobbySupabaseService.respondToFriendRequest.bind(lobbySupabaseService),
  subscribeToFriendRequests: lobbySupabaseService.subscribeToFriendRequests.bind(lobbySupabaseService),
  getRecommendedFriends: lobbySupabaseService.getRecommendedFriends.bind(lobbySupabaseService),

  // Game & Leaderboard
  submitResult: gameSupabaseService.submitResult.bind(gameSupabaseService),
  getStats: gameSupabaseService.getStats.bind(gameSupabaseService),
  getLeaderboard: gameSupabaseService.getLeaderboard.bind(gameSupabaseService),

  // Versus Rooms
  subscribeToRoom: versusSupabaseService.subscribeToRoom.bind(versusSupabaseService),
  getAvailableRooms: versusSupabaseService.getAvailableRooms.bind(versusSupabaseService),
  createRoom: versusSupabaseService.createRoom.bind(versusSupabaseService),
  quickJoinRoom: versusSupabaseService.quickJoinRoom.bind(versusSupabaseService),
  joinRoom: versusSupabaseService.joinRoom.bind(versusSupabaseService),
  leaveRoom: versusSupabaseService.leaveRoom.bind(versusSupabaseService),
  setRoomReady: versusSupabaseService.setRoomReady.bind(versusSupabaseService),
  startRoom: versusSupabaseService.startRoom.bind(versusSupabaseService),
  submitRound: versusSupabaseService.submitRound.bind(versusSupabaseService),
  forfeitMatch: versusSupabaseService.forfeitMatch.bind(versusSupabaseService),
  toggleRoomPrivacy: versusSupabaseService.toggleRoomPrivacy.bind(versusSupabaseService),
  getRoom: versusSupabaseService.getRoom.bind(versusSupabaseService),
  subscribeToAvailableRooms: versusSupabaseService.subscribeToAvailableRooms.bind(versusSupabaseService),

  // Match Invites
  sendChallengeInvite: matchInviteSupabaseService.sendChallengeInvite.bind(matchInviteSupabaseService),
  respondToInvite: matchInviteSupabaseService.respondToInvite.bind(matchInviteSupabaseService),
  cancelChallengeInvite: matchInviteSupabaseService.cancelChallengeInvite.bind(matchInviteSupabaseService),
  subscribeToIncomingInvites: matchInviteSupabaseService.subscribeToIncomingInvites.bind(matchInviteSupabaseService),
  subscribeToInviteResponse: matchInviteSupabaseService.subscribeToInviteResponse.bind(matchInviteSupabaseService),
  checkPendingInvite: matchInviteSupabaseService.checkPendingInvite.bind(matchInviteSupabaseService),
  checkInviteStatus: matchInviteSupabaseService.checkInviteStatus.bind(matchInviteSupabaseService),

  // Settings
  updateSettings: settingsSupabaseService.updateSettings.bind(settingsSupabaseService),
  getSettings: settingsSupabaseService.getSettings.bind(settingsSupabaseService),
}
