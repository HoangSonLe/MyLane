import { IconLink, IconGoogle, IconDiscord } from './icons'

interface LinkedMethod {
  id: string
  label: string
  handle: string
}

function LinkedMethodIcon({ id }: { id: string }) {
  if (id === 'google') return <IconGoogle />
  if (id === 'discord') return <IconDiscord />
  return <IconLink />
}

interface LinkedMethodRowProps {
  method: LinkedMethod
  skeleton?: boolean
}

export function LinkedMethodRow({ method, skeleton }: LinkedMethodRowProps) {
  if (skeleton) {
    return (
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="skeleton h-8 w-8" style={{ borderRadius: 'var(--radius-md)' }} />
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="skeleton h-3.5 w-16 rounded" />
          <div className="skeleton h-3 w-28 rounded" />
        </div>
        <div className="skeleton h-6 w-14 rounded-full" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center"
        style={{
          borderRadius: 'var(--radius-md)',
          background: 'var(--ma-icon-bg)',
          color: 'var(--ma-icon-fg)',
        }}
        aria-hidden="true"
      >
        <LinkedMethodIcon id={method.id} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium leading-snug" style={{ color: 'var(--ma-fg)' }}>
          {method.label}
        </p>
        <p className="mt-0.5 truncate text-[12px]" style={{ color: 'var(--ma-fg-muted)' }}>
          {method.handle}
        </p>
      </div>

      <div
        className="shrink-0 px-2 py-1 text-[11px] font-semibold"
        style={{
          borderRadius: 'var(--radius-lg)',
          background: 'var(--ma-success)',
          color: 'oklch(0.14 0.04 145)',
        }}
        aria-label={`${method.label} linked`}
      >
        Linked
      </div>
    </div>
  )
}
