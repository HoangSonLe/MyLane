import { useState, useId, useRef, FormEvent } from 'react'
import { StatusBanner } from '@/components/ui/StatusBanner'
import { Card } from '@/components/ui/card'
import { InputField } from './components/InputField'
import { MergeDialog } from './components/MergeDialog'
import { IconSpinner, IconGoogle, IconDiscord, IconMail, IconEye } from './components/icons'
import { useNetworkStatus } from '@/lib/hooks/useNetworkStatus'
import { useAuthStore } from '@/stores/auth.store'

// ─── Main component ───────────────────────────────────────────────
export function LoginScreen({
  fromGuest = false,
  onSuccess,
  onBack,
}: {
  /** Was this login triggered by a guest wanting to convert their account? */
  fromGuest?: boolean
  /** Called after successful auth (and after merge decision if fromGuest). */
  onSuccess?: () => void
  /** Navigate back to landing / continue as guest. */
  onBack?: () => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showMergeDialog, setShowMergeDialog] = useState(false)

  const { isOffline } = useNetworkStatus()
  const { isLoading, errorMessage, loginWithEmail, loginWithOAuth, clearError } = useAuthStore()

  const emailId = useId()
  const passwordId = useId()
  const formRef = useRef<HTMLFormElement>(null)

  const isDisabled = isLoading || isOffline

  // Real Email/Password login with error handling
  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email || !password || isDisabled) return
    clearError()

    try {
      await loginWithEmail({ email, password })
      if (fromGuest) {
        setShowMergeDialog(true)
      } else {
        onSuccess?.()
      }
    } catch {
      // Error is stored in useAuthStore
    }
  }

  // Real OAuth login (Google / Discord) with error handling
  async function handleOAuth(provider: 'google' | 'discord') {
    if (isDisabled) return
    clearError()

    try {
      await loginWithOAuth(provider)
      if (fromGuest) {
        setShowMergeDialog(true)
      } else {
        onSuccess?.()
      }
    } catch {
      // Error is stored in useAuthStore
    }
  }

  function handleMerge() {
    setShowMergeDialog(false)
    onSuccess?.()
  }

  function handleSkip() {
    setShowMergeDialog(false)
    onSuccess?.()
  }

  return (
    <div
      className="relative flex min-h-dvh flex-col"
      style={{ background: 'var(--ma-bg)' }}
    >
      {/* ── Back / Guest link — top-left ── */}
      <div className="flex items-center px-5 pt-8">
        <button
          type="button"
          onClick={onBack}
          className={[
            'flex items-center gap-1.5 text-[13px] font-medium',
            'transition-colors duration-[var(--ma-duration-micro)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)] rounded-lg px-1',
          ].join(' ')}
          style={{ color: 'var(--ma-fg-muted)' }}
          aria-label="Back to landing screen"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {fromGuest ? 'Continue as guest' : 'Back'}
        </button>
      </div>

      {/* ── Main content ── */}
      <main
        id="main-content"
        className="flex flex-1 flex-col items-center px-6 pb-32 pt-6"
      >
        {/* Offline banner — in-flow, above card */}
        {isOffline && (
          <div className="mb-4 w-full max-w-xs">
            <StatusBanner
              variant="offline"
              message="You're offline. Log in requires a connection."
            />
          </div>
        )}

        <Card className="w-full max-w-xs" shadow="md" padding="1.5rem">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1
              className="text-[20px] font-bold leading-snug tracking-tight"
              style={{ color: 'var(--ma-fg)' }}
            >
              {fromGuest ? 'Create your account' : 'Welcome back'}
            </h1>
            <p
              className="mt-1 text-[13px] leading-relaxed"
              style={{ color: 'var(--ma-fg-muted)' }}
            >
              {fromGuest
                ? 'Save progress, unlock Elo & leaderboards.'
                : 'Log in to access Versus, Elo, and friends.'}
            </p>
          </div>

          {/* ── Inline error ── */}
          {errorMessage && (
            <div className="mb-4">
              <StatusBanner
                variant="error"
                message={errorMessage}
                onRetry={clearError}
              />
            </div>
          )}

          {/* ── OAuth buttons ── */}
          <div className="flex flex-col gap-3">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={isDisabled}
              aria-label="Continue with Google"
              className={[
                'flex h-12 w-full items-center justify-center gap-2.5',
                'text-[14px] font-semibold',
                'transition-transform duration-[var(--ma-duration-micro)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
                isDisabled ? 'cursor-not-allowed opacity-40' : 'active:scale-[0.97]',
              ].join(' ')}
              style={{
                borderRadius: 'var(--radius-2xl)',
                background: 'var(--ma-surface-raised)',
                color: 'var(--ma-fg)',
                border: '1px solid var(--ma-border)',
              }}
            >
              <IconGoogle />
              Continue with Google
            </button>

            {/* Discord */}
            <button
              type="button"
              onClick={() => handleOAuth('discord')}
              disabled={isDisabled}
              aria-label="Continue with Discord"
              className={[
                'flex h-12 w-full items-center justify-center gap-2.5',
                'text-[14px] font-semibold',
                'transition-transform duration-[var(--ma-duration-micro)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
                isDisabled ? 'cursor-not-allowed opacity-40' : 'active:scale-[0.97]',
              ].join(' ')}
              style={{
                borderRadius: 'var(--radius-2xl)',
                background: 'var(--ma-surface-raised)',
                color: 'var(--ma-fg)',
                border: '1px solid var(--ma-border)',
              }}
            >
              <IconDiscord />
              Continue with Discord
            </button>
          </div>

          {/* ── Divider ── */}
          <div className="my-5 flex items-center gap-3" aria-hidden="true">
            <div className="h-px flex-1" style={{ background: 'var(--ma-border)' }} />
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ma-fg-subtle)' }}>
              or
            </span>
            <div className="h-px flex-1" style={{ background: 'var(--ma-border)' }} />
          </div>

          {/* ── Email / password form ── */}
          <form ref={formRef} onSubmit={handleEmailSubmit} noValidate>
            <fieldset
              disabled={isDisabled}
              className="flex flex-col gap-3 border-0 p-0 m-0"
              aria-label="Email and password"
            >
              {/* Section label with icon */}
              <div className="flex items-center gap-1.5 mb-0.5">
                <div
                  className="flex items-center justify-center"
                  style={{
                    height: '1.75rem',
                    width: '1.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--ma-icon-bg)',
                  }}
                >
                  <IconMail />
                </div>
                <span className="text-[12px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ma-fg-subtle)' }}>
                  Email &amp; Password
                </span>
              </div>

              <InputField
                id={emailId}
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                disabled={isDisabled}
                autoComplete="email"
              />

              <InputField
                id={passwordId}
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={setPassword}
                disabled={isDisabled}
                autoComplete="current-password"
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="flex items-center justify-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{ color: 'var(--ma-fg-subtle)' }}
                    tabIndex={0}
                  >
                    <IconEye off={showPassword} />
                  </button>
                }
              />

              {/* Submit */}
              <button
                type="submit"
                disabled={isDisabled || !email || !password}
                className={[
                  'flex h-12 w-full items-center justify-center gap-2',
                  'text-[15px] font-semibold',
                  'transition-transform duration-[var(--ma-duration-micro)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
                  isDisabled || !email || !password
                    ? 'cursor-not-allowed opacity-40'
                    : 'active:scale-[0.97]',
                ].join(' ')}
                style={{
                  borderRadius: 'var(--radius-2xl)',
                  background: 'var(--ma-brand)',
                  color: 'var(--ma-brand-fg)',
                  marginTop: '0.25rem',
                }}
              >
                {isLoading && <IconSpinner />}
                Log In
              </button>
            </fieldset>
          </form>
        </Card>

        {/* ── Guest footnote ── */}
        <p
          className="mt-6 text-center text-[12px] leading-relaxed"
          style={{ color: 'var(--ma-fg-subtle)' }}
        >
          Versus, Elo, leaderboard, and friends require an account.{' '}
          <button
            type="button"
            onClick={onBack}
            className="font-medium underline underline-offset-2 focus-visible:outline-none focus-visible:rounded"
            style={{ color: 'var(--ma-fg-muted)' }}
          >
            Continue as guest
          </button>
        </p>
      </main>

      {/* ── Merge dialog ── */}
      <MergeDialog
        visible={showMergeDialog}
        onMerge={handleMerge}
        onSkip={handleSkip}
      />
    </div>
  )
}
