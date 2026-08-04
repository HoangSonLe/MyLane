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
  skeleton,
  onSelect,
  onLogIn,
}: {
  mode: ModeMeta
  selected: boolean
  isGuest: boolean
  customLocked?: boolean
  skeleton?: boolean
  onSelect?: () => void
  onLogIn?: () => void
}) {
  const { t } = useTranslation()
  const locked = customLocked ?? (isGuest && mode.requiresAccount)

  if (skeleton) {
    return (
      <div
        className="skeleton flex-1"
        style={{ height: '2.25rem', borderRadius: 'var(--radius-xl)' }}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (locked) {
          if (customLocked) return
          onLogIn?.()
        } else {
          onSelect?.()
        }
      }}
      aria-pressed={selected}
      aria-label={customLocked ? `${mode.label} — ${t.gameSelect.endlessUnlockRequirement}` : locked ? `${mode.label} — ${t.gameSelect.requiresAccount}` : mode.label}
      title={customLocked ? t.gameSelect.endlessUnlockRequirement : locked ? t.gameSelect.signInToUnlock : undefined}
      className={[
        'flex flex-1 flex-col items-center justify-center gap-0.5 px-2 py-2.5 text-center',
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
        className="text-[11px] font-semibold leading-snug"
        style={{ color: selected ? '#fff' : 'var(--ma-fg-muted)' }}
      >
        {mode.label}
      </span>
    </button>
  )
}
