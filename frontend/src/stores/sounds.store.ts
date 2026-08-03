import { create } from 'zustand'

const STORAGE_KEY = 'gb_sounds_enabled_v1'

interface SoundsState {
  enabled: boolean
  setEnabled: (enabled: boolean) => void
  toggleEnabled: () => void
}

function loadSoundsEnabled(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return true // Enabled by default
    return raw === 'true'
  } catch {
    return true
  }
}

export const useSoundsStore = create<SoundsState>((set) => ({
  enabled: loadSoundsEnabled(),
  setEnabled: (enabled: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, String(enabled))
    } catch {}
    set({ enabled })
  },
  toggleEnabled: () => {
    set((state) => {
      const next = !state.enabled
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
      } catch {}
      return { enabled: next }
    })
  },
}))
