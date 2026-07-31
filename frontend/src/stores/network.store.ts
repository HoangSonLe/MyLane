import { create } from 'zustand'

interface NetworkState {
  isOffline: boolean
  isOnline: boolean
  setOffline: (offline: boolean) => void
}

/**
 * Zustand global store for client network status (online / offline).
 * Specified in docs/technical/README.md (§ Stack Version 1: Client state = Zustand).
 */
export const useNetworkStore = create<NetworkState>((set) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => set({ isOffline: false, isOnline: true }))
    window.addEventListener('offline', () => set({ isOffline: true, isOnline: false }))
  }

  return {
    isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    setOffline: (offline: boolean) => set({ isOffline: offline, isOnline: !offline }),
  }
})
