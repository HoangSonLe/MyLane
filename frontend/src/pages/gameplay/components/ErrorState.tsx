import { IconRefresh } from './icons'

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-2xl"
        style={{ background: 'oklch(0.62 0.19 22 / 0.12)', boxShadow: 'var(--ma-shadow-md)' }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="var(--ma-danger)" strokeWidth="1.5" />
          <path d="M12 7v5M12 16v.5" stroke="var(--ma-danger)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <h2 className="text-[17px] font-bold" style={{ color: 'var(--ma-fg)' }}>Connection lost</h2>
        <p className="mt-1 text-[13px] leading-relaxed" style={{ color: 'var(--ma-fg-muted)' }}>
          The versus match was interrupted. Check your connection and try again.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center gap-2 rounded-2xl px-8 py-4 text-[15px] font-semibold transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
        style={{ background: 'var(--ma-surface-raised)', border: '1px solid var(--ma-border)', color: 'var(--ma-fg)' }}
      >
        <IconRefresh />
        Retry
      </button>
    </div>
  )
}
