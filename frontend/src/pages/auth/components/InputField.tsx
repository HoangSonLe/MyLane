// InputField — labeled input with optional right slot (e.g. password toggle)

interface InputFieldProps {
  id: string
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  autoComplete?: string
  rightSlot?: React.ReactNode
}

export function InputField({
  id,
  label,
  type,
  value,
  onChange,
  disabled,
  autoComplete,
  rightSlot,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
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
          ].join(' ')}
          style={{
            background: 'var(--ma-surface-raised)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--ma-border)',
            color: 'var(--ma-fg)',
          }}
          placeholder=" "
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
