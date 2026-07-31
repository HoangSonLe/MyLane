/**
 * Mock-JWT codec + fake user builders — plain-JS mirror of
 * src/mocks/fake-users.ts (the standalone server is a separate Node
 * process, not part of the Vite bundle, so it can't import that TS
 * module directly). Keep both in sync if the shape changes.
 */
export function encodeToken(user) {
  return `mock.${Buffer.from(JSON.stringify(user)).toString('base64')}`
}

export function decodeToken(token) {
  try {
    const [prefix, payload] = token.split('.')
    if (prefix !== 'mock' || !payload) return null
    return JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'))
  } catch {
    return null
  }
}

export function makeGuestUser() {
  return {
    id: `guest_${Math.random().toString(36).substring(2, 9)}`,
    name: 'Guest Player',
    isGuest: true,
    elo: 1000,
  }
}

export function makeEmailUser(email) {
  const nameFromEmail = email.split('@')[0]
  return {
    id: `user_${Math.random().toString(36).substring(2, 9)}`,
    name: nameFromEmail ? nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1) : 'Player',
    email,
    isGuest: false,
    elo: 1200,
  }
}

export function makeOAuthUser(provider) {
  return {
    id: `${provider}_${Math.random().toString(36).substring(2, 9)}`,
    name: provider === 'google' ? 'Alex Rivera' : 'CyberKnight',
    email: `${provider}_user@example.com`,
    isGuest: false,
    elo: 1250,
  }
}
