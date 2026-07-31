// Toast — auto-save confirmation notification

interface ToastProps {
  visible: boolean
}

export function Toast({ visible }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={[
        'fixed left-1/2 top-16 z-50 -translate-x-1/2',
        'flex items-center gap-2 rounded-2xl px-4 py-2.5',
        'text-[13px] font-medium text-[var(--ma-fg)]',
        'transition-all duration-300',
        visible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-2 opacity-0 pointer-events-none',
      ].join(' ')}
      style={{
        background: 'var(--ma-surface-raised)',
        boxShadow: 'var(--ma-shadow-md)',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="var(--ma-active)" />
        <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Saved
    </div>
  )
}
