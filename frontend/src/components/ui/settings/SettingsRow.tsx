import type { ReactNode } from 'react'

import { SettingsToggle } from './SettingsToggle'

type RowVariant = 'toggle' | 'nav' | 'value' | 'danger'

interface SettingsRowProps {
  icon: ReactNode
  label: string
  description?: string
  variant?: RowVariant
  checked?: boolean
  onToggle?: (v: boolean) => void
  value?: string
  onClick?: () => void
  skeleton?: boolean
  disabled?: boolean
}

export function SettingsRow({
  icon,
  label,
  description,
  variant = 'toggle',
  checked = false,
  onToggle,
  value,
  onClick,
  skeleton = false,
  disabled = false,
}: SettingsRowProps) {
  const isInteractive = variant === 'nav' || variant === 'value' || variant === 'danger'
  const isDanger = variant === 'danger'

  const inner = (
    <div
      className={[
        'flex items-center gap-3 px-4 py-3',
        isInteractive && !skeleton
          ? 'transition-colors duration-[var(--ma-duration-micro)] active:bg-[var(--ma-surface-raised)]'
          : '',
        disabled ? 'opacity-40' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={[
          'flex h-5 w-5 shrink-0 items-center justify-center',
          isDanger
            ? 'text-[var(--ma-danger)]'
            : 'text-[var(--ma-icon-fg)]',
          skeleton ? 'skeleton h-5 w-5 rounded' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-hidden="true"
      >
        {!skeleton && icon}
      </div>

      <div className="min-w-0 flex-1">
        {skeleton ? (
          <>
            <div className="skeleton mb-1.5 h-3.5 w-28 rounded" />
            {description !== undefined && (
              <div className="skeleton h-3 w-20 rounded" />
            )}
          </>
        ) : (
          <>
            <p
              className={[
                'text-[15px] font-medium leading-snug',
                isDanger
                  ? 'text-[var(--ma-danger)]'
                  : 'text-[var(--ma-fg)]',
              ].join(' ')}
            >
              {label}
            </p>
            {description && (
              <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--ma-fg-muted)]">
                {description}
              </p>
            )}
          </>
        )}
      </div>

      {!skeleton && (
        <>
          {variant === 'toggle' && onToggle && (
            <SettingsToggle
              checked={checked}
              onChange={onToggle}
              disabled={disabled}
              label={label}
            />
          )}
          {variant === 'nav' && <ChevronRight />}
          {variant === 'value' && (
            <div className="flex items-center gap-1.5">
              {value && (
                <span className="text-[13px] text-[var(--ma-fg-muted)]">{value}</span>
              )}
              <ChevronRight />
            </div>
          )}
        </>
      )}
    </div>
  )

  if (isInteractive && !skeleton) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ma-ring)]"
        aria-label={label}
      >
        {inner}
      </button>
    )
  }

  return <div>{inner}</div>
}

function ChevronRight() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-[var(--ma-fg-subtle)]"
    >
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
