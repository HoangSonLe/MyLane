/**
 * Generic get/set/remove for a JSON value in sessionStorage, swallowing
 * failures (private browsing, quota, corrupt JSON) so a storage hiccup never
 * crashes the app — just falls back to "nothing was saved". Shared by
 * session-resume.ts and gameplay-checkpoint.ts, which used to each hand-roll
 * their own try/catch around get/set/remove.
 */
export function readSessionJSON<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeSessionJSON(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage unavailable — the value simply won't persist.
  }
}

export function clearSessionJSON(key: string) {
  try {
    sessionStorage.removeItem(key)
  } catch {
    // ignore
  }
}
