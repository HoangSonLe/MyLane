import { IconUserOff } from '@/components/ui/icons'

export function GuestNotice() {
  return (
    <div
      className="mx-4 flex items-start gap-3 px-4 py-3.5"
      style={{
        borderRadius: 'var(--radius-2xl)',
        background: 'oklch(0.58 0.11 230 / 0.08)',
        border: '1px solid oklch(0.58 0.11 230 / 0.25)',
      }}
      role="note"
    >
      <span className="mt-0.5 shrink-0" style={{ color: 'var(--ma-active)' }} aria-hidden="true">
        <IconUserOff />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-[13px] font-semibold" style={{ color: 'var(--ma-fg)' }}>
          Playing as Guest
        </p>
        <p className="text-[12px] leading-relaxed" style={{ color: 'var(--ma-fg-muted)' }}>
          Your score won&apos;t be saved. Create a free account to track progress, unlock ranked play, and compete with friends.
        </p>
      </div>
    </div>
  )
}
