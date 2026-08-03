import { create } from 'zustand'

const STORAGE_KEY = 'gb_haptics_enabled_v1'

interface HapticsState {
  enabled: boolean
  setEnabled: (enabled: boolean) => void
  toggleEnabled: () => void
}

function loadHapticsEnabled(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return true // Enabled by default
    return raw === 'true'
  } catch {
    return true
  }
}

export const useHapticsStore = create<HapticsState>((set) => ({
  enabled: loadHapticsEnabled(),
  setEnabled: (enabled: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, String(enabled))
    } catch {
      // Ignore write failures in private window
    }
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
