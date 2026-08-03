import type { ReactNode } from 'react'

export interface ToastProps {
  /** Whether the toast is visible */
  show?: boolean
  visible?: boolean
  /** Message content string or custom node */
  message: ReactNode
  /** Visual variant: 'info' (default) | 'success' | 'warning' | 'error' */
  variant?: 'info' | 'success' | 'warning' | 'error'
  /** Optional callback when dismissed */
  onClose?: () => void
}

function IconCheckCircle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="var(--ma-success)" />
      <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconInfoCircle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="var(--ma-brand)" />
      <path d="M12 8v4M12 16h.01" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function IconWarningCircle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="var(--ma-warning)" />
      <path d="M12 8v4M12 16h.01" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function IconErrorCircle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="var(--ma-danger)" />
      <path d="M15 9l-6 6M9 9l6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function Toast({ show, visible, message, variant = 'info', onClose }: ToastProps) {
  const isVisible = show ?? visible ?? false

  if (!isVisible || !message) return null

  const renderIcon = () => {
    switch (variant) {
      case 'success':
        return <IconCheckCircle />
      case 'warning':
        return <IconWarningCircle />
      case 'error':
        return <IconErrorCircle />
      case 'info':
      default:
        return <IconInfoCircle />
    }
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed left-1/2 top-5 z-[100] flex w-[92%] max-w-sm sm:max-w-md -translate-x-1/2 items-center justify-between gap-3 rounded-2xl px-4 py-3 text-[13px] font-semibold shadow-2xl transition-all animate-in fade-in slide-in-from-top-4 duration-200"
      style={{
        background: 'var(--ma-surface-raised)',
        border: '1px solid var(--ma-border)',
        color: 'var(--ma-fg)',
        boxShadow: '0 12px 32px -4px rgba(0, 0, 0, 0.4), var(--ma-shadow-xl)',
      }}
    >
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        <span className="shrink-0 flex items-center justify-center mt-0.5">{renderIcon()}</span>
        <span className="leading-relaxed text-[12px] sm:text-[13px] font-semibold break-words flex-1" style={{ color: 'var(--ma-fg)' }}>
          {message}
        </span>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--ma-surface)] text-[var(--ma-fg-subtle)] hover:text-[var(--ma-fg)] transition-colors text-[11px]"
          aria-label="Dismiss toast"
        >
          ✕
        </button>
      )}
    </div>
  )
}
