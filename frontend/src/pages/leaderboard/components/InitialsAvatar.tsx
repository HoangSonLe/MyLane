import { getInitials } from '@/lib/utils'

export function InitialsAvatar({
  name,
  size = 36,
  highlight = false,
}: {
  name: string
  size?: number
  highlight?: boolean
}) {
  const initials = getInitials(name)

  return (
    <div
      className="shrink-0 flex items-center justify-center"
      style={{
        height: size,
        width: size,
        borderRadius: 'var(--radius-lg)',
        background: highlight ? 'var(--ma-active-soft)' : 'var(--ma-surface-raised)',
        border: highlight
          ? '1.5px solid oklch(0.58 0.11 230 / 0.4)'
          : '1px solid var(--ma-border)',
      }}
      aria-hidden="true"
    >
      <span
        className="text-[12px] font-bold"
        style={{ color: highlight ? 'var(--ma-active)' : 'var(--ma-fg-muted)' }}
      >
        {initials}
      </span>
    </div>
  )
}
