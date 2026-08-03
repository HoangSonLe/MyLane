import { useSoundsStore } from '@/stores/sounds.store'

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

/**
 * Web Audio API synthesizer for zero-latency UI & gameplay sound effects.
 * 100% offline, zero network requests, lightweight and crisp.
 * Respects user's global Settings > Sound Effects toggle.
 */
export const soundEffects = {
  /** Short pleasant tap tone for button & tile clicks (40ms) */
  tap: () => {
    if (!useSoundsStore.getState().enabled) return
    try {
      const ctx = getAudioContext()
      if (!ctx) return

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.04) // A5

      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.04)
    } catch {
      // Ignore Web Audio errors on unsupported environments
    }
  },

  /** Cheerful ascending chord for correct answer / level complete */
  correct: () => {
    if (!useSoundsStore.getState().enabled) return
    try {
      const ctx = getAudioContext()
      if (!ctx) return

      const notes = [523.25, 659.25, 783.99] // C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07)

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.07)
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + idx * 0.07 + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.15)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(ctx.currentTime + idx * 0.07)
        osc.stop(ctx.currentTime + idx * 0.07 + 0.15)
      })
    } catch {}
  },

  /** Descending buzz tone for wrong answer */
  wrong: () => {
    if (!useSoundsStore.getState().enabled) return
    try {
      const ctx = getAudioContext()
      if (!ctx) return

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(260, ctx.currentTime)
      osc.frequency.linearRampToValueAtTime(140, ctx.currentTime + 0.18)

      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.18)
    } catch {}
  },
}
