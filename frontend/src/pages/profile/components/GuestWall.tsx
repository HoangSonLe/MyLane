import { IconUserOff } from '@/components/ui/icons'
import { Card } from '@/components/ui/card'

export function GuestWall({ onLogIn }: { onLogIn?: () => void }) {
  return (
    <Card className="mx-4 flex flex-col items-center gap-4 text-center" padding="2.5rem 1.5rem">
      <div
        className="flex items-center justify-center"
        style={{
          height: '3rem',
          width: '3rem',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--ma-icon-bg)',
        }}
        aria-hidden="true"
      >
        <span style={{ color: 'var(--ma-fg-subtle)' }}>
          <IconUserOff />
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[15px] font-bold" style={{ color: 'var(--ma-fg)' }}>
          You&apos;re playing as a Guest
        </p>
        <p className="text-[13px] leading-relaxed" style={{ color: 'var(--ma-fg-muted)' }}>
          Create a free account to save your scores, track Elo, view match history, and connect with friends.
        </p>
      </div>
      <button
        type="button"
        onClick={onLogIn}
        className={[
          'flex h-12 w-full items-center justify-center',
          'text-[14px] font-semibold',
          'transition-transform duration-[var(--ma-duration-micro)] active:scale-[0.97]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
        ].join(' ')}
        style={{
          borderRadius: 'var(--radius-2xl)',
          background: 'var(--ma-brand)',
          color: 'var(--ma-brand-fg)',
          boxShadow: '0 4px 24px oklch(0.78 0.16 75 / 0.28)',
        }}
      >
        Log In / Sign Up
      </button>
    </Card>
  )
}
