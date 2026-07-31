import { useState } from 'react'
import { StatusBanner } from '@/components/ui/StatusBanner'
import { StatePill } from '@/components/ui/StatePill'

import { ScreenState } from '@/configs/enum'

// ─── Spinner icon ────────────────────────────────────────────────
function IconSpinner() {
  return (
    <svg
      className="animate-spin"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12" cy="12" r="9"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.25"
      />
      <path
        d="M21 12a9 9 0 00-9-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ─── Brand logo area ─────────────────────────────────────────────
function BrandArea({ skeleton }: { skeleton?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-5">
      {/* Icon container — uses --ma-icon-bg / --ma-brand per system */}
      <div
        className="flex items-center justify-center"
        style={{
          height: '5rem',
          width: '5rem',
          borderRadius: 'var(--radius-2xl)',
          background: skeleton ? undefined : 'var(--ma-icon-bg)',
          boxShadow: skeleton ? undefined : 'var(--ma-shadow-md)',
        }}
        aria-hidden={skeleton ? 'true' : undefined}
      >
        {skeleton ? (
          <div
            className="skeleton"
            style={{ height: '5rem', width: '5rem', borderRadius: 'var(--radius-2xl)' }}
          />
        ) : (
          // Brain icon — same SVG already in SequenceMemoryScreen
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            aria-label="Memory Arena icon"
            style={{ color: 'var(--ma-brand)' }}
          >
            <path
              d="M9.5 2C7 2 5 4 5 6.5c0 .8.2 1.5.5 2.1C4 9.3 3 10.8 3 12.5 3 15 5 17 7.5 17H9v2.5a2.5 2.5 0 005 0V17h1.5C18 17 21 14.5 21 11.5c0-2-1.1-3.7-2.8-4.6.1-.4.3-.9.3-1.4C18.5 3.1 16.5 2 14.5 2c-1 0-1.8.4-2.5 1C11.3 2.4 10.4 2 9.5 2z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {/* Wordmark */}
      {skeleton ? (
        <div className="flex flex-col items-center gap-2">
          <div
            className="skeleton"
            style={{ height: '2rem', width: '11rem', borderRadius: 'var(--radius-sm)' }}
          />
          <div
            className="skeleton"
            style={{ height: '1rem', width: '8rem', borderRadius: 'var(--radius-sm)' }}
          />
        </div>
      ) : (
        <div className="text-center">
          <h1
            className="text-[28px] font-bold leading-tight tracking-tight"
            style={{ color: 'var(--ma-fg)' }}
          >
            Memory Arena
          </h1>
          <p
            className="mt-1 text-[14px] leading-relaxed"
            style={{ color: 'var(--ma-fg-muted)' }}
          >
            Train your mind. Beat your best.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── CTA area ────────────────────────────────────────────────────
function CtaArea({
  skeleton,
  disabled,
  onPlayNow,
  onLogIn,
}: {
  skeleton?: boolean
  disabled?: boolean
  onPlayNow: () => void
  onLogIn: () => void
}) {
  if (skeleton) {
    return (
      <div className="flex w-full flex-col gap-3">
        <div
          className="skeleton"
          style={{ height: '3.5rem', width: '100%', borderRadius: 'var(--radius-2xl)' }}
        />
        <div
          className="skeleton"
          style={{ height: '3.5rem', width: '100%', borderRadius: 'var(--radius-2xl)' }}
        />
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {/* Primary — Play Now (Guest) */}
      <button
        type="button"
        onClick={onPlayNow}
        disabled={disabled}
        aria-label="Play Now as a guest"
        className={[
          'flex h-14 w-full items-center justify-center gap-2',
          'text-[15px] font-semibold',
          'transition-transform duration-[var(--ma-duration-micro)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
          disabled
            ? 'cursor-not-allowed opacity-40'
            : 'active:scale-[0.97]',
        ].join(' ')}
        style={{
          borderRadius: 'var(--radius-2xl)',
          background: 'var(--ma-brand)',
          color: 'var(--ma-brand-fg)',
          boxShadow: disabled
            ? undefined
            : '0 4px 24px oklch(0.78 0.16 75 / 0.30)',
        }}
      >
        {disabled && <IconSpinner />}
        {disabled ? 'Checking session…' : 'Play Now'}
      </button>

      {/* Secondary — Log In */}
      <button
        type="button"
        onClick={onLogIn}
        disabled={disabled}
        aria-label="Log in to your account"
        className={[
          'flex h-14 w-full items-center justify-center',
          'text-[15px] font-semibold',
          'transition-transform duration-[var(--ma-duration-micro)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
          disabled
            ? 'cursor-not-allowed opacity-40'
            : 'active:scale-[0.97]',
        ].join(' ')}
        style={{
          borderRadius: 'var(--radius-2xl)',
          background: 'var(--ma-surface-raised)',
          color: 'var(--ma-fg)',
          border: '1px solid var(--ma-border)',
        }}
      >
        Log In
      </button>
    </div>
  )
}

// ─── Guest footnote ──────────────────────────────────────────────
function GuestNote() {
  return (
    <p
      className="text-center text-[12px] leading-relaxed"
      style={{ color: 'var(--ma-fg-subtle)' }}
    >
      Guest progress is saved locally.{' '}
      <span style={{ color: 'var(--ma-fg-muted)' }}>Log in to sync across devices.</span>
    </p>
  )
}

// ─── Main component ──────────────────────────────────────────────
export function LandingScreen({
  onPlayNow,
  onLogIn,
}: {
  onPlayNow?: () => void
  onLogIn?: () => void
}) {
  const [screenState, setScreenState] = useState<ScreenState>(ScreenState.NORMAL)

  const isLoading = screenState === ScreenState.LOADING
  const isOffline = screenState === ScreenState.OFFLINE

  return (
    <div
      className="relative flex min-h-dvh flex-col"
      style={{ background: 'var(--ma-bg)' }}
    >
      {/* ── Main content — vertically centred ── */}
      <main
        id="main-content"
        className="flex flex-1 flex-col items-center justify-center px-6 pt-16"
      >
        {/* Offline banner — appears above the centred card, inside the flow */}
        {isOffline && (
          <div className="mb-6 w-full max-w-xs">
            <StatusBanner
              variant="offline"
              message="You're offline. Play Now will start a local session."
            />
          </div>
        )}
        <div className="flex w-full max-w-xs flex-col items-center gap-10">
          <BrandArea skeleton={isLoading} />

          <CtaArea
            skeleton={isLoading}
            disabled={isLoading}
            onPlayNow={onPlayNow ?? (() => {})}
            onLogIn={onLogIn ?? (() => {})}
          />

          {!isLoading && <GuestNote />}
        </div>
      </main>

      {/* ── State switcher (prototype only) ── */}
      <StatePill
        current={screenState}
        onChange={setScreenState}
        states={[ScreenState.NORMAL, ScreenState.LOADING, ScreenState.OFFLINE]}
        position="bottom-8"
      />
    </div>
  )
}
