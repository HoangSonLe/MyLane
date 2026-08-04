import { http, HttpResponse } from 'msw'
import { decodeToken } from './fake-users'
import { MOCK_FRIENDS } from '@/services/lobby/lobby.mock'
import { resolveMockProfile } from './profile-handlers'

/**
 * Fake backend for Lobby friends (docs/ui/screen-inventory-and-flow.md § Lobby).
 * Lobby requires an account per docs/product/README.md ("Guest mode ... no
 * Versus") — guests/unauthenticated requests get a 401, same as a real API
 * gating a social feature behind login.
 */
export const lobbyHandlers = [
  http.get('/api/lobby/friends', ({ request }) => {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = token ? decodeToken(token) : null
    if (!user || user.isGuest) {
      return HttpResponse.json({ message: 'Account required.' }, { status: 401 })
    }
    return HttpResponse.json({ friends: MOCK_FRIENDS })
  }),
  http.get('/api/lobby/users/:friendId', ({ params, request }) => {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = token ? decodeToken(token) : null
    if (!user || user.isGuest) {
      return HttpResponse.json({ message: 'Account required.' }, { status: 401 })
    }
    const friendId = String(params.friendId || '')
    if (!friendId || friendId === user.id) {
      return HttpResponse.json({ friend: null })
    }
    const friend = resolveMockProfile(friendId) || MOCK_FRIENDS.find((item) => item.id === friendId) || null
    return HttpResponse.json({ friend })
  }),
]
