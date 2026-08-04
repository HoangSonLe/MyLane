const FRIEND_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/

export function createFriendLink(friendId: string, origin = window.location.origin): string {
  const url = new URL('/', origin)
  url.searchParams.set('friend', friendId)
  url.searchParams.set('v', '1')
  return url.toString()
}

/** Accepts the app deep link or the compact raw payload used by tests/mocks. */
export function parseFriendCode(payload: string): string | null {
  const value = payload.trim()
  if (!value) return null

  let candidate = value
  try {
    const url = new URL(value)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (url.searchParams.get('v') !== '1') return null
    candidate = url.searchParams.get('friend') || ''
  } catch {
    const prefix = 'mylane:friend:v1:'
    candidate = value.startsWith(prefix) ? value.slice(prefix.length) : value
  }

  return FRIEND_ID_PATTERN.test(candidate) ? candidate : null
}
