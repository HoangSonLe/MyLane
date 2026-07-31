// EmptyState — shown when settings profile hasn't loaded yet

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
      <div
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--ma-surface)]"
        style={{ boxShadow: 'var(--ma-shadow-sm)' }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="var(--ma-fg-subtle)" strokeWidth="1.5" strokeDasharray="4 3" />
          <path d="M9 9h.01M15 9h.01M9.5 14.5s.5 1.5 2.5 1.5 2.5-1.5 2.5-1.5"
            stroke="var(--ma-fg-subtle)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="mb-1.5 text-[15px] font-semibold text-[var(--ma-fg)]">No settings yet</h3>
      <p className="text-[13px] leading-relaxed text-[var(--ma-fg-muted)]">
        Your preferences will appear here once your profile is set up.
      </p>
    </div>
  )
}
