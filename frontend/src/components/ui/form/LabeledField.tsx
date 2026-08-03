import type { ReactNode } from 'react'

export interface LabeledFieldProps {
  id: string
  label: ReactNode
  type?: string
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  autoComplete?: string
  rightSlot?: ReactNode
  placeholder?: string
  className?: string
}

export function LabeledField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  disabled,
  autoComplete,
  rightSlot,
  placeholder = ' ',
  className = '',
}: LabeledFieldProps) {
  return (
    <div className={['flex flex-col gap-1.5', className].filter(Boolean).join(' ')}>
      <label
        htmlFor={id}
        className="text-[13px] font-medium"
        style={{ color: 'var(--ma-fg-muted)' }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete={autoComplete}
          className={[
            'h-12 w-full px-4 text-[15px]',
            'transition-colors duration-[var(--ma-duration-micro)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--ma-ring)]',
            rightSlot ? 'pr-11' : '',
            disabled ? 'cursor-not-allowed opacity-50' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{
            background: 'var(--ma-surface-raised)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--ma-border)',
            color: 'var(--ma-fg)',
          }}
          placeholder={placeholder}
        />
        {rightSlot && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5">
            {rightSlot}
          </div>
        )}
      </div>
    </div>
  )
}
