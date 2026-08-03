import { http, HttpResponse } from 'msw'
import { decodeToken } from './fake-users'
import { MOCK_PROFILE } from '@/services/profile/profile.mock'

/**
 * Fake backend for Profile stats (docs/gameplay/README.md § "Recorded per
 * player"). `username`/`handle`/`overallElo` come from the real session —
 * everything else is the static seed. Guests get a 401 (docs/product:
 * guest progress has no server-side save) — ProfileScreen shows its own
 * GuestWall instead of calling this.
 */
function toHandle(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '_')
}

export const profileHandlers = [
  http.get('/api/profile', ({ request }) => {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = token ? decodeToken(token) : null
    if (!user || user.isGuest) {
      return HttpResponse.json({ message: 'Account required.' }, { status: 401 })
    }
    return HttpResponse.json({
      profile: {
        ...MOCK_PROFILE,
        username: user.name,
        handle: toHandle(user.name),
        overallElo: user.elo,
      },
    })
  }),
]
