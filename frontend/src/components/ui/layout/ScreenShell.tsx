import { useEffect } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import { StatusBanner } from '@/components/ui/StatusBanner'

/**
 * ScreenShell — the outer "relative flex min-h-dvh flex-col" + var(--ma-bg)
 * wrapper repeated identically at the top of every screen. Extracted as-is,
 * no behavior change.
 */
export function ScreenShell({
  children,
  className = '',
  style,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
}) {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  return (
    <div
      className={['relative flex min-h-dvh flex-col', className].filter(Boolean).join(' ')}
      style={{ background: 'var(--ma-bg)', ...style }}
    >
      {children}
    </div>
  )
}

/** ScreenOfflineBanner — the `{isOffline && <div className="pt-16"><StatusBanner .../></div>}` block, identical across screens except for the message text. */
export function ScreenOfflineBanner({
  show,
  message,
}: {
  show: boolean
  message: string
}) {
  if (!show) return null
  return (
    <div className="pt-6">
      <StatusBanner variant="offline" message={message} />
    </div>
  )
}

/**
 * ScreenMain — the `<main id="main-content">` wrapper. Bottom/top padding
 * vary per screen (pb-24 to pb-36, conditional pt-16 vs none), so those stay
 * explicit props rather than a single baked-in variant — each call site
 * passes exactly what it already had.
 */
export function ScreenMain({
  children,
  id = 'main-content',
  gap = true,
  bottomPadding,
  topPadding = 'none',
  offline = false,
  ariaBusy,
  className = '',
}: {
  children: ReactNode
  id?: string
  gap?: boolean
  bottomPadding: string
  topPadding?: 'auto' | 'none'
  offline?: boolean
  ariaBusy?: boolean
  className?: string
}) {
  return (
    <main
      id={id}
      aria-busy={ariaBusy}
      className={[
        'flex flex-1 flex-col',
        gap ? 'gap-5' : '',
        bottomPadding,
        topPadding === 'auto' ? (offline ? '' : 'pt-16') : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </main>
  )
}
