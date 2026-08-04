import { useEffect, useState } from 'react'
import { IconSwords } from '@/components/ui/icons'
import type { ModeMeta } from '@/services/game-select/game-select.interface'
import { useTranslation } from '@/i18n/useTranslation'

function IconLock() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function ModeChip({
  mode,
  selected,
  isGuest,
  customLocked,
  currentLevel,
  skeleton,
  onSelect,
  onLogIn,
}: {
  mode: ModeMeta
  selected: boolean
  isGuest: boolean
  customLocked?: boolean
  /** This game's own highest level reached — only used to word the Endless unlock hint. */
  currentLevel?: number
  skeleton?: boolean
  onSelect?: () => void
  onLogIn?: () => void
}) {
  const { t } = useTranslation()
  const locked = customLocked ?? (isGuest && mode.requiresAccount)
  const hintText = t.gameSelect.endlessUnlockRequirement(currentLevel ?? 1)
  // `title` only shows on mouse hover, never on tap — this app is mobile-first,
  // so tapping a customLocked (Endless, under-level) chip needs its own
  // visible, tap-triggered hint instead of relying on the native tooltip.
  const [showTapHint, setShowTapHint] = useState(false)

  useEffect(() => {
    if (!showTapHint) return
    const timeout = setTimeout(() => setShowTapHint(false), 2500)
    return () => clearTimeout(timeout)
  }, [showTapHint])

  if (skeleton) {
    return (
      <div
        className="skeleton flex-1"
        style={{ height: '3.5rem', borderRadius: 'var(--radius-xl)' }}
      />
    )
  }

  return (
    <div className="relative flex flex-col flex-1">
      {showTapHint && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 z-10 mb-1.5 w-max max-w-[220px] -translate-x-1/2 rounded-lg px-2.5 py-1.5 text-center text-[11px] font-medium leading-snug shadow-lg"
          style={{ background: 'var(--ma-fg)', color: 'var(--ma-bg, #fff)' }}
        >
          {hintText}
        </div>
      )}
      <button
        type="button"
        onClick={() => {
          if (locked) {
            if (customLocked) {
              setShowTapHint(true)
              return
            }
            onLogIn?.()
          } else {
            onSelect?.()
          }
        }}
        aria-pressed={selected}
        aria-label={customLocked ? `${mode.label} — ${hintText}` : locked ? `${mode.label} — ${t.gameSelect.requiresAccount}` : mode.label}
        title={customLocked ? hintText : locked ? t.gameSelect.signInToUnlock : undefined}
        className={[
          'flex h-full w-full flex-col items-center justify-center gap-1 px-1 py-2 text-center',
          'transition-all duration-[var(--ma-duration-micro)] active:scale-95',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
          locked ? 'opacity-50 hover:opacity-100' : '',
        ].join(' ')}
        style={{
          borderRadius: 'var(--radius-xl)',
          background: selected ? 'var(--ma-active)' : 'var(--ma-surface-raised)',
          border: `1px solid ${selected ? 'var(--ma-active)' : 'var(--ma-border)'}`,
        }}
      >
        {locked && (
          <span style={{ color: selected ? '#fff' : 'var(--ma-fg-subtle)' }}>
            <IconLock />
          </span>
        )}
        {mode.versusFlow && !locked && (
          <span style={{ color: selected ? '#fff' : 'var(--ma-fg-subtle)' }}>
            <IconSwords />
          </span>
        )}
        <span
          className="text-[11px] font-semibold leading-tight"
          style={{ color: selected ? '#fff' : 'var(--ma-fg-muted)' }}
        >
          {mode.label}
        </span>
      </button>
    </div>
  )
}
