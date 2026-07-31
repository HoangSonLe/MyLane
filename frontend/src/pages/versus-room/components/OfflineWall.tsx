import { IconLock } from '@/components/ui/icons'
import { Card } from '@/components/ui/card'

export function OfflineWall({ onLogIn }: { onLogIn?: () => void }) {
  return (
    <Card className="mx-4 flex flex-col items-center gap-4 text-center" padding="2rem 1.5rem">
      <div
        className="flex items-center justify-center"
        style={{
          height: '2.75rem',
          width: '2.75rem',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--ma-icon-bg)',
        }}
        aria-hidden="true"
      >
        <span style={{ color: 'var(--ma-fg-muted)' }}>
          <IconLock />
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[14px] font-semibold" style={{ color: 'var(--ma-fg)' }}>
          Account required
        </p>
        <p className="text-[12px] leading-relaxed" style={{ color: 'var(--ma-fg-muted)' }}>
          Versus mode requires a free account. Log in to create or join a room.
        </p>
      </div>
      <button
        type="button"
        onClick={onLogIn}
        className={[
          'flex h-11 w-full items-center justify-center',
          'text-[14px] font-semibold',
          'transition-transform duration-[var(--ma-duration-micro)] active:scale-[0.97]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
        ].join(' ')}
        style={{
          borderRadius: 'var(--radius-2xl)',
          background: 'var(--ma-brand)',
          color: 'var(--ma-brand-fg)',
        }}
      >
        Log In / Sign Up
      </button>
    </Card>
  )
}
