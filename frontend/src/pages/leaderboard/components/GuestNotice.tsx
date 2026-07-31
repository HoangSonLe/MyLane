function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}

function IconLogIn() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="10 17 15 12 10 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="15" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

export function GuestNotice({ onLogIn }: { onLogIn?: () => void }) {
  return (
    <div
      className="mx-4 flex items-start gap-3 rounded-[var(--radius-xl)] px-4 py-3"
      style={{
        background: 'var(--ma-surface-raised)',
        border: '1px solid var(--ma-border)',
      }}
      role="status"
    >
      <span className="mt-0.5 shrink-0" style={{ color: 'var(--ma-fg-muted)' }}>
        <IconUser />
      </span>
      <div className="flex flex-1 flex-col gap-1.5">
        <p className="text-[13px] font-medium leading-snug" style={{ color: 'var(--ma-fg)' }}>
          You&apos;re browsing as a guest
        </p>
        <p className="text-[12px] leading-relaxed" style={{ color: 'var(--ma-fg-muted)' }}>
          Your personal rank won&apos;t appear here because guest scores aren&apos;t saved to the leaderboard. Log in to track your position.
        </p>
        {onLogIn && (
          <button
            type="button"
            onClick={onLogIn}
            className={[
              'mt-1 flex w-fit items-center gap-2 px-3 py-1.5',
              'text-[12px] font-semibold',
              'transition-transform duration-[var(--ma-duration-micro)] active:scale-95',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
            ].join(' ')}
            style={{
              borderRadius: 'var(--radius-xl)',
              background: 'var(--ma-brand)',
              color: 'var(--ma-brand-fg)',
            }}
          >
            <IconLogIn />
            Log in
          </button>
        )}
      </div>
    </div>
  )
}
