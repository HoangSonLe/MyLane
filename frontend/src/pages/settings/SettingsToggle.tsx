interface SettingsToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
  id?: string
  label?: string
}

export function SettingsToggle({
  checked,
  onChange,
  disabled = false,
  id,
  label,
}: SettingsToggleProps) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={[
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full',
        'toggle-track focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
        'transition-colors duration-200',
        disabled ? 'cursor-not-allowed opacity-35' : '',
        checked
          ? 'bg-[var(--ma-toggle-on)]'
          : 'bg-[var(--ma-toggle-off)]',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        className={[
          'toggle-thumb pointer-events-none inline-block h-4 w-4 rounded-full',
          'bg-white shadow-sm',
          checked ? 'translate-x-6' : 'translate-x-1',
        ].join(' ')}
      />
    </button>
  )
}
