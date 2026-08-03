import type { UserSession } from '@/services/auth/auth.service'

/**
 * Mock-JWT codec used only by the fake backends (MSW + mock-server/).
 * No signature, no expiry — this stands in for a real ASP.NET Core +
 * JWT token (see docs/technical/README.md) until that backend exists.
 * Mirrored in plain JS at mock-server/fake-users.mjs — keep both in sync.
 */
export function encodeToken(user: UserSession): string {
  return `mock.${btoa(JSON.stringify(user))}`
}

export function decodeToken(token: string): UserSession | null {
  try {
    const [prefix, payload] = token.split('.')
    if (prefix !== 'mock' || !payload) return null
    return JSON.parse(atob(payload)) as UserSession
  } catch {
    return null
  }
}

export function makeGuestUser(): UserSession {
  return {
    id: `guest_${Math.random().toString(36).substring(2, 9)}`,
    name: 'Guest Player',
    isGuest: true,
    elo: 1000,
  }
}

export function makeEmailUser(email: string): UserSession {
  const nameFromEmail = email.split('@')[0]
  return {
    id: `user_${Math.random().toString(36).substring(2, 9)}`,
    name: nameFromEmail ? nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1) : 'Player',
    email,
    isGuest: false,
    elo: 1000,
  }
}

export function makeOAuthUser(provider: 'google' | 'discord'): UserSession {
  return {
    id: `${provider}_${Math.random().toString(36).substring(2, 9)}`,
    name: provider === 'google' ? 'Alex Rivera' : 'CyberKnight',
    email: `${provider}_user@example.com`,
    isGuest: false,
    elo: 1250,
  }
}
