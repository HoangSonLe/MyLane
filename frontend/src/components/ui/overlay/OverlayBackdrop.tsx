import type { ReactNode } from 'react'

interface OverlayBackdropProps {
  ariaLabel: string
  /** Backdrop dim strength — varies slightly per overlay (pause/tutorial vs connection-loss vs match-result). */
  dim: number
  /** Backdrop blur strength in px. */
  blur: number
  children: ReactNode
}

/**
 * Shared full-screen dim+blur backdrop for gameplay bottom-sheet overlays
 * (pause/tutorial/offline in Solo, error/reconnect/result-transition in
 * Versus) — same `fixed inset-0` dialog wrapper previously copy-pasted
 * verbatim across both gameplay screens. Each caller keeps its own sheet/card
 * markup as children, since padding, radius source, and content differ
 * enough per screen not to force into one shape.
 */
export function OverlayBackdrop({ ariaLabel, dim, blur, children }: OverlayBackdropProps) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center"
      style={{ background: `oklch(0 0 0 / ${dim})`, backdropFilter: `blur(${blur}px)` }}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      {children}
    </div>
  )
}
