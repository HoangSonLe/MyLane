import { create } from 'zustand'

export type MuteDurationOption = '5m' | '15m' | '30m' | 'session'

const STORAGE_KEY = 'gb_muted_inviters_v1'

interface MuteRecord {
  until: number // timestamp in ms
  sessionOnly?: boolean
}

interface InviteMuteState {
  mutedMap: Record<string, MuteRecord>
  muteUser: (userHandle: string, option: MuteDurationOption) => void
  unmuteUser: (userHandle: string) => void
  isMuted: (userHandle: string) => boolean
}

function loadMutedMap(): Record<string, MuteRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, MuteRecord>
    const now = Date.now()
    const cleaned: Record<string, MuteRecord> = {}
    for (const [key, val] of Object.entries(parsed)) {
      if (!val.sessionOnly && val.until > now) {
        cleaned[key] = val
      }
    }
    return cleaned
  } catch {
    return {}
  }
}

function saveMutedMap(map: Record<string, MuteRecord>) {
  try {
    const persistentEntries = Object.entries(map).filter(([, record]) => !record.sessionOnly)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(persistentEntries)))
  } catch {
    // ignore storage write errors
  }
}

export const useInviteMuteStore = create<InviteMuteState>((set, get) => ({
  mutedMap: loadMutedMap(),

  muteUser: (userHandle: string, option: MuteDurationOption) => {
    const now = Date.now()
    let durationMs = 0
    const sessionOnly = option === 'session'
    switch (option) {
      case '5m':
        durationMs = 5 * 60 * 1000
        break
      case '15m':
        durationMs = 15 * 60 * 1000
        break
      case '30m':
        durationMs = 30 * 60 * 1000
        break
      case 'session':
        durationMs = Number.MAX_SAFE_INTEGER - now
        break
    }

    const until = now + durationMs
    const updated = {
      ...get().mutedMap,
      [userHandle.toLowerCase()]: { until, sessionOnly },
    }

    saveMutedMap(updated)
    set({ mutedMap: updated })
  },

  unmuteUser: (userHandle: string) => {
    const updated = { ...get().mutedMap }
    delete updated[userHandle.toLowerCase()]
    saveMutedMap(updated)
    set({ mutedMap: updated })
  },

  isMuted: (userHandle: string) => {
    const record = get().mutedMap[userHandle.toLowerCase()]
    if (!record) return false
    return Date.now() < record.until
  },
}))
