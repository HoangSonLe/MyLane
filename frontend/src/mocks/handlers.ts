import { authHandlers } from './auth-handlers'
import { homeHandlers } from './home-handlers'
import { gameSelectHandlers } from './game-select-handlers'
import { lobbyHandlers } from './lobby-handlers'
import { versusRoomHandlers } from './versus-room-handlers'
import { profileHandlers } from './profile-handlers'
import { settingsHandlers } from './settings-handlers'
import { leaderboardHandlers } from './leaderboard-handlers'
import { resultHandlers } from './result-handlers'

export const handlers = [
  ...authHandlers,
  ...homeHandlers,
  ...gameSelectHandlers,
  ...lobbyHandlers,
  ...versusRoomHandlers,
  ...profileHandlers,
  ...settingsHandlers,
  ...leaderboardHandlers,
  ...resultHandlers,
]
