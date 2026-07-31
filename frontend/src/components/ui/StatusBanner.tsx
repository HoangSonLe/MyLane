import { useEffect, useRef } from 'react'

interface StatusBannerProps {
  variant: 'error' | 'offline'
  message: string
  onRetry?: () => void
}

export function StatusBanner({ variant, message, onRetry }: StatusBannerProps) {
  const isError = variant === 'error'
  const retryRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isError && onRetry && retryRef.current) {
      retryRef.current.focus()
    }
  }, [isError, onRetry])

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={[
        'mx-4 mb-4 flex items-start gap-3 rounded-2xl px-4 py-3.5',
        isError
          ? 'bg-[var(--ma-danger)]/10 text-[var(--ma-danger)]'
          : 'bg-[var(--ma-warning)]/10 text-[var(--ma-warning)]',
      ].join(' ')}
    >
      <span className="mt-0.5 shrink-0" aria-hidden="true">
        {isError ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 8v5M12 16.01V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M8.5 16.5a5 5 0 017 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M5 13a9 9 0 0114 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M2 9.5a13 13 0 0120 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="20" r="1" fill="currentColor" />
            <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </span>
      <div className="flex-1">
        <p className="text-[13px] font-medium leading-snug">{message}</p>
        {onRetry && (
          <button
            ref={retryRef}
            onClick={onRetry}
            className="mt-1 text-[12px] font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:rounded"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  )
}
