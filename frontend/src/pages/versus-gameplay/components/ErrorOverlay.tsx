import { IconX } from './icons'

function IconRefresh() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M23 4v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ErrorOverlay({ onRetry, onQuit }: { onRetry: () => void; onQuit: () => void }) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center"
      style={{ background: 'oklch(0 0 0 / 0.65)', backdropFilter: 'blur(6px)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Connection error"
    >
      <div
        className="w-full max-w-sm mb-6 mx-4 flex flex-col items-center gap-5 rounded-3xl p-6 text-center"
        style={{ background: 'var(--ma-surface)', border: '1px solid var(--ma-border)', boxShadow: 'var(--ma-shadow-lg)' }}
      >
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: 'oklch(0.62 0.19 22 / 0.12)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="var(--ma-danger)" strokeWidth="1.5" />
            <path d="M12 7v5M12 16v.5" stroke="var(--ma-danger)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p className="text-[17px] font-bold" style={{ color: 'var(--ma-fg)' }}>Connection error</p>
          <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: 'var(--ma-fg-muted)' }}>
            The match connection was lost. Reconnect to continue or quit to the lobby.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2.5">
          <button
            type="button"
            onClick={onRetry}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
            style={{ background: 'var(--ma-brand)', color: 'var(--ma-brand-fg)', boxShadow: 'var(--ma-shadow-md)' }}
          >
            <IconRefresh />
            Reconnect
          </button>
          <button
            type="button"
            onClick={onQuit}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
            style={{
              background: 'oklch(0.62 0.19 22 / 0.10)',
              border: '1px solid oklch(0.62 0.19 22 / 0.25)',
              color: 'var(--ma-danger)',
            }}
          >
            <IconX />
            Quit match
          </button>
        </div>
      </div>
    </div>
  )
}
