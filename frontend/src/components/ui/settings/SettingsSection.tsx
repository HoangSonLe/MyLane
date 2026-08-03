import type { ReactNode } from 'react'

interface SettingsSectionProps {
  title?: string
  children: ReactNode
  skeleton?: boolean
}

export function SettingsSection({ title, children, skeleton }: SettingsSectionProps) {
  return (
    <section aria-label={title ?? 'Settings section'}>
      {title && (
        <div className="mb-2 px-1">
          {skeleton ? (
            <div className="skeleton h-3 w-20 rounded" />
          ) : (
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ma-fg-muted)]">
              {title}
            </h2>
          )}
        </div>
      )}
      <div
        className="overflow-hidden rounded-2xl bg-[var(--ma-surface)]"
        style={{ boxShadow: '0 1px 8px oklch(0 0 0 / 0.20)' }}
      >
        <div className="divide-y divide-[var(--ma-border-subtle)]">
          {children}
        </div>
      </div>
    </section>
  )
}
