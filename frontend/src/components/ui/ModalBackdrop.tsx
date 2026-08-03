import type { ReactNode, MouseEvent } from 'react'

interface ModalBackdropProps {
  /** Whether the modal backdrop is visible. */
  show?: boolean
  open?: boolean
  /** Callback fired when user clicks on the backdrop overlay area outside the modal panel. */
  onClose?: () => void
  onDismiss?: () => void
  /** Modal content panel. */
  children: ReactNode
  /** Optional custom backdrop container class names. */
  className?: string
}

/**
 * ModalBackdrop — Centralized overlay primitive
 * Encapsulates backdrop styling, event propagation isolation (click-through prevention),
 * and outside-click dismissal centrally for all modals & dialogs.
 */
export function ModalBackdrop({
  show = true,
  open = true,
  onClose,
  onDismiss,
  children,
  className = '',
}: ModalBackdropProps) {
  const isVisible = show && open
  if (!isVisible) return null

  const handleClose = () => {
    onClose?.()
    onDismiss?.()
  }

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      e.preventDefault()
      e.stopPropagation()
      handleClose()
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 ${className}`}
      style={{ background: 'oklch(0 0 0 / 0.55)' }}
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full flex justify-center items-center pointer-events-auto"
        onClick={handleBackdropClick}
      >
        {children}
      </div>
    </div>
  )
}
