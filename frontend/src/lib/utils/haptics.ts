import { useHapticsStore } from '@/stores/haptics.store'

/**
 * Haptic feedback utility using Web Vibration API (`navigator.vibrate`)
 * Provides tactile vibration pulse feedback on mobile & supported browsers.
 * Respects user's global Settings > Haptic Feedback toggle.
 */
export const hapticFeedback = {
  /** Light pulse for tile / answer button clicks (12ms) */
  light: () => {
    if (!useHapticsStore.getState().enabled) return
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12)
      } catch {
        // Silently ignore if blocked by browser permission policy
      }
    }
  },
  /** Medium pulse for level / stage completion */
  success: () => {
    if (!useHapticsStore.getState().enabled) return
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([15, 30, 20])
      } catch {}
    }
  },
  /** Warning pulse pattern for wrong answer / sequence failure */
  error: () => {
    if (!useHapticsStore.getState().enabled) return
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([30, 40, 50])
      } catch {}
    }
  },
}
