import { useState, type ReactNode } from 'react'
import { Card } from './Card'

interface CollapsibleCardProps {
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  children: ReactNode
  defaultCollapsed?: boolean
  className?: string
}

export function IconChevronDown({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-transform duration-200"
      style={{
        color: 'var(--ma-fg-subtle)',
        transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
      }}
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export function CollapsibleCard({
  title,
  subtitle,
  action,
  children,
  defaultCollapsed = false,
  className = 'mx-4 overflow-hidden transition-all',
}: CollapsibleCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  return (
    <Card className={className} shadow="sm">
      {/* Header Bar */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none transition-colors hover:opacity-85"
        onClick={() => setIsCollapsed((prev) => !prev)}
        style={{ borderBottom: isCollapsed ? 'none' : '1px solid var(--ma-border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          {typeof title === 'string' ? (
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ma-fg-subtle)' }}>
              {title}
            </p>
          ) : (
            title
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {subtitle && (
            <span className="text-[11px] font-semibold tabular-nums" style={{ color: 'var(--ma-fg-subtle)' }}>
              {subtitle}
            </span>
          )}
          {action}
          <IconChevronDown isCollapsed={isCollapsed} />
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && children}
    </Card>
  )
}
