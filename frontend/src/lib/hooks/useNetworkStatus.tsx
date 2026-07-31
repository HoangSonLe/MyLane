import { useNetworkStore } from '@/stores/network.store'

/**
 * Global hook to consume app-wide network status (isOffline, isOnline) via Zustand store.
 */
export function useNetworkStatus() {
  const isOffline = useNetworkStore((state) => state.isOffline)
  const isOnline = useNetworkStore((state) => state.isOnline)
  return { isOffline, isOnline }
}
