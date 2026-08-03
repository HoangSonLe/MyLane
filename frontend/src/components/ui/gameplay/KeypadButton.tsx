import type { ReactNode } from 'react'
import { hapticFeedback } from '@/lib/utils/haptics'
import { soundEffects } from '@/lib/utils/audio'

export function KeypadButton({
  label,
  disabled,
  onPress,
  isAction = false,
  ariaLabel,
  icon,
}: {
  label: string
  disabled: boolean
  onPress: () => void
  isAction?: boolean
  ariaLabel?: string
  icon?: ReactNode
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        hapticFeedback.light()
        soundEffects.tap()
        onPress()
      }}
      aria-label={ariaLabel ?? label}
      className={[
        'flex h-14 w-full items-center justify-center rounded-xl text-[20px] font-semibold',
        'transition-all duration-[var(--ma-duration-micro)] active:scale-[0.93]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
        disabled ? 'opacity-40 cursor-default' : 'cursor-pointer',
        isAction ? 'text-[var(--ma-fg-muted)]' : 'text-[var(--ma-fg)]',
      ].join(' ')}
      style={{
        background: 'var(--ma-surface-raised)',
        border: '1px solid var(--ma-border)',
        boxShadow: 'var(--ma-shadow-sm)',
        borderRadius: 'var(--radius-xl)',
      }}
    >
      {icon ?? label}
    </button>
  )
}
