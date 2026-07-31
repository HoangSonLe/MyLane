/**
 * DialogDemoScreen — ConfirmDialog demo
 *
 * Shows all three confirmed example instances of ConfirmDialog plus
 * the busy/loading state. Each card triggers the dialog above it.
 * Belongs to the prototype navigator; not a production screen.
 */

import { useState } from 'react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

// ─── Icons for each instance (20 px, 1.75 stroke) ────────────────────────────

function IconMerge() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 3h5v5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 3L11 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function IconQuit() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function IconReset() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 3v5h5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Demo instances ───────────────────────────────────────────────────────────

type DialogId = 'merge' | 'quit' | 'reset' | null

const INSTANCES = [
  {
    id:           'merge' as DialogId,
    variant:      'warning' as const,
    icon:         <IconMerge />,
    title:        'Save your guest progress?',
    message:
      'Your local best score and level will be compared with your account. The higher value is kept — nothing is lost.',
    confirmLabel: 'Merge and save',
    cancelLabel:  'Discard guest data',
    triggerLabel: 'Guest → account conversion',
    description:  'Triggered when a guest creates or links an account. Offers to merge local best score/level (keeps the higher value).',
  },
  {
    id:           'quit' as DialogId,
    variant:      'danger' as const,
    icon:         <IconQuit />,
    title:        'Quit game?',
    message:
      'Your progress in this round will be lost. You can start a new round any time from the Home screen.',
    confirmLabel: 'Quit',
    cancelLabel:  'Keep playing',
    triggerLabel: 'Quit from Pause Overlay',
    description:  'Triggered from the Pause screen when the player chooses Quit. Destructive — progress is not saved.',
  },
  {
    id:           'reset' as DialogId,
    variant:      'danger' as const,
    icon:         <IconReset />,
    title:        'Reset this round?',
    message:
      'The current sequence will restart from the beginning. Your score resets to zero.',
    confirmLabel: 'Reset',
    cancelLabel:  'Cancel',
    triggerLabel: 'Reset mid-round',
    description:  'Triggered from the active gameplay screen via a long-press or settings action. Destructive — score resets to zero.',
  },
]

// ─── Trigger card ─────────────────────────────────────────────────────────────

function TriggerCard({
  label,
  description,
  variant,
  onOpen,
}: {
  label:       string
  description: string
  variant:     'default' | 'danger' | 'warning'
  onOpen:      () => void
}) {
  const accentColor =
    variant === 'danger'
      ? 'var(--ma-danger)'
      : variant === 'warning'
      ? 'var(--ma-warning)'
      : 'var(--ma-brand)'

  return (
    <div
      className="flex flex-col gap-3 p-4"
      style={{
        borderRadius: 'var(--radius-2xl)',
        background:   'var(--ma-surface)',
        border:       '1px solid var(--ma-border)',
      }}
    >
      {/* Variant chip */}
      <div className="flex items-center gap-2">
        <div
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: accentColor }}
          aria-hidden="true"
        />
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: 'var(--ma-fg-subtle)' }}
        >
          {variant}
        </span>
      </div>

      {/* Title */}
      <p className="text-[15px] font-semibold leading-snug" style={{ color: 'var(--ma-fg)' }}>
        {label}
      </p>

      {/* Description */}
      <p className="text-[13px] leading-relaxed" style={{ color: 'var(--ma-fg-muted)' }}>
        {description}
      </p>

      {/* Open button */}
      <button
        type="button"
        onClick={onOpen}
        className={[
          'mt-1 flex h-10 items-center justify-center',
          'text-[13px] font-semibold',
          'transition-transform duration-[var(--ma-duration-micro)] active:scale-[0.97]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
        ].join(' ')}
        style={{
          borderRadius: 'var(--radius-xl)',
          background:   'var(--ma-surface-raised)',
          color:        accentColor,
          border:       '1px solid var(--ma-border)',
        }}
      >
        Open dialog
      </button>
    </div>
  )
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export function DialogDemoScreen() {
  const [active,   setActive]   = useState<DialogId>(null)
  const [busy,     setBusy]     = useState(false)
  const [lastDone, setLastDone] = useState<string | null>(null)

  const currentInstance = INSTANCES.find((i) => i.id === active) ?? null

  function handleOpen(id: DialogId) {
    setBusy(false)
    setLastDone(null)
    setActive(id)
  }

  function handleConfirm() {
    setBusy(true)
    // Simulate an async action (1.4 s)
    setTimeout(() => {
      setBusy(false)
      setLastDone(currentInstance?.triggerLabel ?? null)
      setActive(null)
    }, 1400)
  }

  function handleCancel() {
    if (busy) return
    setLastDone(null)
    setActive(null)
  }

  return (
    <div
      className="flex min-h-dvh flex-col"
      style={{ background: 'var(--ma-bg)' }}
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="px-4 pb-3 pt-20">
        <h1
          className="text-[20px] font-bold leading-tight tracking-tight"
          style={{ color: 'var(--ma-fg)' }}
        >
          ConfirmDialog
        </h1>
        <p className="mt-1 text-[13px] leading-relaxed" style={{ color: 'var(--ma-fg-muted)' }}>
          Shared overlay primitive. One decision at a time — title, message, confirm, cancel.
        </p>
      </header>

      {/* ── Divider ─────────────────────────────────────────────────────────── */}
      <div
        className="mx-4 mb-2"
        style={{ height: '1px', background: 'var(--ma-border-subtle)' }}
        aria-hidden="true"
      />

      {/* ── Last action feedback ─────────────────────────────────────────────── */}
      {lastDone !== null && (
        <div className="mx-4 mb-4">
          <div
            className="flex items-center gap-2 px-3 py-2.5"
            style={{
              borderRadius: 'var(--radius-lg)',
              background:   'oklch(0.70 0.15 145 / 0.10)',
              border:       '1px solid oklch(0.70 0.15 145 / 0.25)',
            }}
          >
            <span
              className="text-[12px] font-semibold"
              style={{ color: 'var(--ma-success)' }}
            >
              Confirmed:
            </span>
            <span className="text-[12px]" style={{ color: 'var(--ma-fg-muted)' }}>
              {lastDone}
            </span>
          </div>
        </div>
      )}

      {/* ── Instance cards ──────────────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col gap-3 px-4 pb-32">
        {INSTANCES.map((inst) => (
          <TriggerCard
            key={inst.id as string}
            label={inst.triggerLabel}
            description={inst.description}
            variant={inst.variant}
            onOpen={() => handleOpen(inst.id)}
          />
        ))}

        {/* ── Spec reference ─────────────────────────────────────────────── */}
        <div
          className="flex flex-col gap-2 p-4"
          style={{
            borderRadius: 'var(--radius-2xl)',
            background:   'var(--ma-surface)',
            border:       '1px solid var(--ma-border)',
          }}
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: 'var(--ma-fg-subtle)' }}
          >
            Props reference
          </p>

          {[
            ['open',         'boolean — controls visibility'],
            ['variant',      '"default" | "danger" | "warning"'],
            ['icon?',        'ReactNode — 20 px SVG for the icon slot'],
            ['title',        'string — short heading'],
            ['message',      'string — single explanatory body'],
            ['confirmLabel', 'string — defaults to "Confirm"'],
            ['cancelLabel',  'string — defaults to "Cancel"'],
            ['busy?',        'boolean — spinner + disabled while submitting'],
            ['onConfirm',    '() => void — primary action handler'],
            ['onCancel',     '() => void — secondary / Escape handler'],
          ].map(([prop, desc]) => (
            <div key={prop} className="flex items-start gap-3">
              <code
                className="shrink-0 text-[12px] font-mono"
                style={{ color: 'var(--ma-brand)', minWidth: '7rem' }}
              >
                {prop}
              </code>
              <span className="text-[12px] leading-relaxed" style={{ color: 'var(--ma-fg-muted)' }}>
                {desc}
              </span>
            </div>
          ))}
        </div>
      </main>

      {/* ── The shared component ─────────────────────────────────────────────── */}
      {currentInstance !== null && (
        <ConfirmDialog
          open
          variant={currentInstance.variant}
          icon={currentInstance.icon}
          title={currentInstance.title}
          message={currentInstance.message}
          confirmLabel={currentInstance.confirmLabel}
          cancelLabel={currentInstance.cancelLabel}
          busy={busy}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}
