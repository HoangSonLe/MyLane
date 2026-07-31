/**
 * ConfirmDialog — shared overlay primitive
 *
 * Handles exactly one decision at a time:
 *   one title, one body message, one primary (confirm) action, one cancel.
 *
 * Design constraints (mirrors existing in-project dialogs):
 *   • Backdrop:  fixed inset-0 z-50, oklch(0 0 0 / 0.60)
 *   • Panel:     max-w-xs, --ma-surface, --radius-2xl, --ma-border, --ma-shadow-lg, p-6
 *   • Icon slot: 48×48, --radius-xl, coloured per variant
 *   • Title:     text-[17px] font-bold text-center
 *   • Body:      text-[13px] leading-relaxed text-center --ma-fg-muted
 *   • Primary:   h-12 w-full --radius-2xl, coloured per variant, spinner while busy
 *   • Cancel:    h-12 w-full --radius-2xl, --ma-surface-raised, --ma-border
 *
 * Usage:
 *   <ConfirmDialog
 *     open={showQuit}
 *     variant="danger"                   // "default" | "danger" | "warning"
 *     icon={<IconQuit />}
 *     title="Quit game?"
 *     message="Your progress will be lost. You can start a new round from the Home screen."
 *     confirmLabel="Quit"
 *     cancelLabel="Keep playing"
 *     busy={isQuitting}
 *     onConfirm={handleQuit}
 *     onCancel={() => setShowQuit(false)}
 *   />
 */

import { useId, useEffect, useRef } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

export type DialogVariant = 'default' | 'danger' | 'warning'

export interface ConfirmDialogProps {
  /** Whether the dialog is visible. */
  open: boolean

  /**
   * Visual variant — drives the icon background and primary-button colour.
   * - "default"  → brand amber (confirm = brand, e.g. destructive-neutral)
   * - "danger"   → red  (confirm = danger, e.g. quit, reset, log out)
   * - "warning"  → amber-warning (confirm = warning, e.g. data merge notice)
   */
  variant?: DialogVariant

  /**
   * Optional icon rendered inside the coloured 48×48 icon slot at the top.
   * Pass a 20px SVG. Omit to render nothing in the slot.
   */
  icon?: React.ReactNode

  /** Short, scannable dialog heading. */
  title: string

  /** Single explanatory sentence or two. No interactive content. */
  message: string

  /** Label on the primary confirm button. Defaults to "Confirm". */
  confirmLabel?: string

  /** Label on the secondary cancel button. Defaults to "Cancel". */
  cancelLabel?: string

  /**
   * When true the confirm button shows a spinner and is disabled.
   * The cancel button is also disabled to prevent double-action.
   */
  busy?: boolean

  /** Called when the user confirms. Wire async work here then set busy=true. */
  onConfirm: () => void

  /** Called when the user cancels or presses Escape. */
  onCancel: () => void
}

// ─── Icons (20 px, 1.75 stroke, currentColor) ────────────────────────────────

function IconSpinner() {
  return (
    <svg
      className="animate-spin"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// ─── Variant config ───────────────────────────────────────────────────────────

interface VariantConfig {
  iconBg: string
  iconColor: string
  confirmBg: string
  confirmColor: string
}

const VARIANT_CONFIG: Record<DialogVariant, VariantConfig> = {
  default: {
    iconBg:       'var(--ma-brand)',
    iconColor:    'var(--ma-brand-fg)',
    confirmBg:    'var(--ma-brand)',
    confirmColor: 'var(--ma-brand-fg)',
  },
  danger: {
    iconBg:       'var(--ma-danger)',
    iconColor:    '#fff',
    confirmBg:    'var(--ma-danger)',
    confirmColor: '#fff',
  },
  warning: {
    iconBg:       'oklch(0.78 0.16 65 / 0.18)',
    iconColor:    'var(--ma-warning)',
    confirmBg:    'var(--ma-warning)',
    confirmColor: 'oklch(0.14 0.02 74)',
  },
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ConfirmDialog({
  open,
  variant = 'default',
  icon,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const prevFocusRef = useRef<HTMLElement | null>(null)

  // ── Keyboard: Escape → cancel ──────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !busy) {
        e.preventDefault()
        onCancel()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, busy, onCancel])

  // ── Focus management ───────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      // Remember where focus was before opening
      prevFocusRef.current = document.activeElement as HTMLElement
      // Move focus into the dialog panel
      requestAnimationFrame(() => {
        const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
          'button:not([disabled])',
        )
        firstFocusable?.focus()
      })
    } else {
      // Restore focus when closed
      prevFocusRef.current?.focus()
    }
  }, [open])

  if (!open) return null

  const cfg = VARIANT_CONFIG[variant]

  return (
    /* ── Backdrop ─────────────────────────────────────────────────────────── */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8 sm:items-center"
      style={{ background: 'oklch(0 0 0 / 0.60)' }}
      role="presentation"
      // Clicking outside = cancel (unless busy)
      onPointerDown={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel()
      }}
    >
      {/* ── Panel ────────────────────────────────────────────────────────── */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-xs"
        style={{
          background:    'var(--ma-surface)',
          borderRadius:  'var(--radius-2xl)',
          border:        '1px solid var(--ma-border)',
          boxShadow:     'var(--ma-shadow-lg)',
          padding:       '1.5rem',
        }}
        // Stop backdrop click from firing when clicking inside the panel
        onPointerDown={(e) => e.stopPropagation()}
      >

        {/* ── Icon slot (optional) ─────────────────────────────────────── */}
        {icon !== undefined && (
          <div
            className="mx-auto mb-4 flex items-center justify-center"
            style={{
              height:       '3rem',
              width:        '3rem',
              borderRadius: 'var(--radius-xl)',
              background:   cfg.iconBg,
              color:        cfg.iconColor,
              flexShrink:   0,
            }}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}

        {/* ── Title ────────────────────────────────────────────────────── */}
        <h2
          id={titleId}
          className={[
            'text-[17px] font-bold leading-snug text-balance',
            icon !== undefined ? 'mb-1 text-center' : 'mb-1',
          ].join(' ')}
          style={{ color: 'var(--ma-fg)' }}
        >
          {title}
        </h2>

        {/* ── Body ─────────────────────────────────────────────────────── */}
        <p
          className={[
            'mb-6 text-[13px] leading-relaxed text-pretty',
            icon !== undefined ? 'text-center' : '',
          ].join(' ')}
          style={{ color: 'var(--ma-fg-muted)' }}
        >
          {message}
        </p>

        {/* ── Actions ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          {/* Primary — confirm */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={[
              'flex h-12 w-full items-center justify-center gap-2',
              'text-[15px] font-semibold',
              'transition-transform duration-[var(--ma-duration-micro)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
              busy ? 'cursor-not-allowed opacity-60' : 'active:scale-[0.97]',
            ].join(' ')}
            style={{
              borderRadius: 'var(--radius-2xl)',
              background:   cfg.confirmBg,
              color:        cfg.confirmColor,
            }}
          >
            {busy && <IconSpinner />}
            {busy ? `${confirmLabel}…` : confirmLabel}
          </button>

          {/* Secondary — cancel */}
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className={[
              'flex h-12 w-full items-center justify-center',
              'text-[15px] font-semibold',
              'transition-transform duration-[var(--ma-duration-micro)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
              busy ? 'cursor-not-allowed opacity-60' : 'active:scale-[0.97]',
            ].join(' ')}
            style={{
              borderRadius: 'var(--radius-2xl)',
              background:   'var(--ma-surface-raised)',
              color:        'var(--ma-fg)',
              border:       '1px solid var(--ma-border)',
            }}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
