import type { ReactNode, MouseEvent } from 'react'
import { ModalBackdrop } from '@/components/ui/ModalBackdrop'

/**
 * Shared shell for the four "read-only info" modals (Privacy Policy, Terms of
 * Service, Scoring Rules, Beginner Guide) — same backdrop panel, header
 * (icon + title/subtitle + close), and single full-width footer button,
 * previously copy-pasted across all four with only content differing.
 *
 * `variant` captures the two sizing/spacing looks that already existed:
 * "legal" (Privacy/Terms — wider panel, taller, title badge + info bar slots)
 * and "info" (ScoringRules/BeginnerGuide — compact, no badge/info bar).
 */
interface InfoModalShellProps {
  visible: boolean
  onClose: () => void
  closeLabel: string
  icon: ReactNode
  title: ReactNode
  subtitle: ReactNode
  variant: 'legal' | 'info'
  /** Small pill next to the title — "legal" variant only (e.g. version badge). */
  titleBadge?: ReactNode
  /** Row rendered between the header and the scrollable content — "legal" variant only. */
  infoBar?: ReactNode
  footerLabel: ReactNode
  children: ReactNode
  /** Extra classes on the outer panel (e.g. BeginnerGuideModal's `relative`). */
  className?: string
  onPanelClick?: (e: MouseEvent<HTMLDivElement>) => void
}

export function InfoModalShell({
  visible,
  onClose,
  closeLabel,
  icon,
  title,
  subtitle,
  variant,
  titleBadge,
  infoBar,
  footerLabel,
  children,
  className = '',
}: InfoModalShellProps) {
  if (!visible) return null
  const legal = variant === 'legal'

  return (
    <ModalBackdrop show={visible} onClose={onClose}>
      <div
        className={[
          'w-[calc(100vw-2rem)] sm:w-full',
          legal ? 'sm:max-w-xl' : 'sm:max-w-lg',
          'max-h-[78dvh]',
          legal ? 'sm:max-h-[88vh]' : 'sm:max-h-[85vh]',
          'flex flex-col overflow-hidden',
          legal ? 'p-4 sm:p-6' : 'p-4 sm:p-5',
          'transition-all',
          className,
        ].join(' ')}
        style={{
          borderRadius: 'var(--radius-2xl)',
          background: 'var(--ma-surface-raised)',
          border: '1px solid var(--ma-border)',
          boxShadow: 'var(--ma-shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between gap-3 ${legal ? 'pb-3.5' : 'pb-3'} shrink-0 border-b border-[var(--ma-border-subtle)]`}>
          <div className={`flex items-center ${legal ? 'gap-3' : 'gap-2.5'} min-w-0 flex-1`}>
            <div
              className={`flex ${legal ? 'h-10 w-10 rounded-2xl' : 'h-9 w-9 rounded-xl'} items-center justify-center shrink-0`}
              style={{ background: 'var(--ma-brand-soft)', color: 'var(--ma-brand)' }}
            >
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] sm:text-[18px] font-bold text-[var(--ma-fg)] leading-tight truncate">
                  {title}
                </h2>
                {titleBadge}
              </div>
              <p className={`${legal ? 'text-[11px] sm:text-[12px]' : 'text-[12px]'} text-[var(--ma-fg-subtle)] truncate mt-0.5`}>
                {subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--ma-surface)] text-[var(--ma-fg-subtle)] hover:text-[var(--ma-fg)] ${legal ? 'active:scale-95 transition-all' : 'transition-colors'}`}
            aria-label={closeLabel}
          >
            ✕
          </button>
        </div>

        {infoBar}

        {/* Scrollable content */}
        <div className={`flex-1 overflow-y-auto ${legal ? 'pt-2 space-y-3.5' : 'pt-4 space-y-4'} pb-2 pr-1 text-[13px] sm:text-[14px]`}>
          {children}
        </div>

        {/* Footer */}
        <div className={`${legal ? 'pt-3.5' : 'pt-3'} shrink-0 flex items-center gap-3`} style={{ borderTop: '1px solid var(--ma-border-subtle)' }}>
          <button
            type="button"
            onClick={onClose}
            className={`w-full py-2.5 rounded-xl font-bold text-[14px] ${legal ? 'active:scale-95 transition-all' : 'transition-colors'}`}
            style={{ background: 'var(--ma-brand)', color: 'var(--ma-brand-fg, #ffffff)' }}
          >
            {footerLabel}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  )
}
