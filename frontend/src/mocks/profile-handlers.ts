import { http, HttpResponse } from 'msw'
import { decodeToken } from './fake-users'
import { MOCK_PROFILE } from '@/services/profile/profile.mock'
import type { Friend } from '@/services/lobby/lobby.interface'
import type { UserSession } from '@/services/auth/auth.service'

interface MockProfileIdentity {
  username: string
  handle: string
  avatarUrl?: string
}

const profileIdentities = new Map<string, MockProfileIdentity>()

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

function ensureMockIdentity(user: UserSession): MockProfileIdentity {
  const existing = profileIdentities.get(user.id)
  if (existing) return existing
  const identity = {
    username: user.name,
    handle: toHandle(user.name),
    avatarUrl: user.avatarUrl,
  }
  profileIdentities.set(user.id, identity)
  return identity
}

export function resolveMockProfile(friendId: string): Friend | null {
  const identity = profileIdentities.get(friendId)
  if (!identity) return null
  return {
    id: friendId,
    name: identity.username,
    handle: identity.handle,
    avatarUrl: identity.avatarUrl,
    elo: 1000,
    status: 'online',
    friendshipStatus: 'none',
  }
}

export const profileHandlers = [
  http.get('/api/profile', ({ request }) => {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = token ? decodeToken(token) : null
    if (!user || user.isGuest) {
      return HttpResponse.json({ message: 'Account required.' }, { status: 401 })
    }
    const identity = ensureMockIdentity(user)
    return HttpResponse.json({
      profile: {
        ...MOCK_PROFILE,
        ...identity,
        overallElo: user.elo,
      },
    })
  }),
  http.patch('/api/profile', async ({ request }) => {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = token ? decodeToken(token) : null
    if (!user || user.isGuest) {
      return HttpResponse.json({ message: 'Account required.' }, { status: 401 })
    }

    const body = await request.json() as Partial<MockProfileIdentity>
    const username = body.username?.trim() || user.name
    const handle = body.handle?.trim().toLowerCase() || toHandle(username)
    const duplicate = [...profileIdentities.entries()].some(
      ([id, profile]) => id !== user.id && profile.handle === handle,
    )
    if (duplicate) {
      return HttpResponse.json({ message: 'PROFILE_HANDLE_TAKEN' }, { status: 409 })
    }

    const identity = { username, handle, avatarUrl: body.avatarUrl }
    profileIdentities.set(user.id, identity)
    return HttpResponse.json({ profile: identity })
  }),
]
