function IconWifi() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M16.72 11.06A10.94 10.94 0 0119 12.55" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M5 12.55a10.94 10.94 0 015.17-2.39" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M10.71 5.05A16 16 0 0122.56 9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M1.42 9a15.91 15.91 0 014.7-2.88" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M13.73 18.31a4 4 0 00-3.46 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="12" cy="21" r="1" fill="currentColor" />
    </svg>
  )
}

export function OfflineBanner() {
  return (
    <div
      className="mx-4 mt-2 flex items-center gap-2 rounded-xl px-4 py-2.5"
      style={{ background: 'oklch(0.80 0.17 65 / 0.12)', border: '1px solid oklch(0.80 0.17 65 / 0.2)' }}
      role="status"
    >
      <span style={{ color: 'var(--ma-warning)' }}><IconWifi /></span>
      <p className="text-xs font-medium" style={{ color: 'var(--ma-warning)' }}>
        You&apos;re offline — scores won&apos;t sync until reconnected.
      </p>
    </div>
  )
}
