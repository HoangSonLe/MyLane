import { useState, useEffect } from 'react'
import { StatusBanner } from '@/components/ui/StatusBanner'
import { ScreenShell, ScreenMain } from '@/components/ui/layout'
import { useNetworkStatus } from '@/lib/hooks/useNetworkStatus'
import { useAuthStore } from '@/stores/auth.store'
import { useTranslation } from '@/i18n/useTranslation'
import type { ResumeState } from '@/lib/utils/session-resume'

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
function BrandArea({ skeleton, t }: { skeleton?: boolean; t: ReturnType<typeof useTranslation>['t'] }) {
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
            aria-label="My Lane icon"
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
            My Lane
          </h1>
          <p
            className="mt-1 text-[14px] leading-relaxed"
            style={{ color: 'var(--ma-fg-muted)' }}
          >
            {t.landing.tagline}
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
  t,
}: {
  skeleton?: boolean
  disabled?: boolean
  onPlayNow: () => void
  onLogIn: () => void
  t: ReturnType<typeof useTranslation>['t']
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
        {disabled ? t.landing.initializing : t.landing.playNow}
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
        {t.landing.logIn}
      </button>
    </div>
  )
}

// ─── Language switch — top-right corner, reachable before Play Now/Log In ──
function LanguageSwitch({
  locale,
  setLocale,
  label,
}: {
  locale: 'en' | 'vi'
  setLocale: (locale: 'en' | 'vi') => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={() => setLocale(locale === 'en' ? 'vi' : 'en')}
      aria-label={label}
      className={[
        'flex h-8 items-center justify-center gap-1 px-3',
        'text-[13px] font-semibold',
        'transition-transform duration-[var(--ma-duration-micro)] active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
      ].join(' ')}
      style={{
        borderRadius: 'var(--radius-xl)',
        background: 'var(--ma-surface-raised)',
        color: 'var(--ma-fg)',
        border: '1px solid var(--ma-border)',
      }}
    >
      {locale === 'en' ? 'EN' : 'VI'}
    </button>
  )
}

// ─── Guest footnote ──────────────────────────────────────────────
function GuestNote({ t }: { t: ReturnType<typeof useTranslation>['t'] }) {
  return (
    <p
      className="text-center text-[12px] leading-relaxed"
      style={{ color: 'var(--ma-fg-subtle)' }}
    >
      {t.landing.guestNote}{' '}
      <span style={{ color: 'var(--ma-fg-muted)' }}>{t.landing.guestNoteSync}</span>
    </p>
  )
}

// ─── Main component ──────────────────────────────────────────────
export function LandingScreen({
  onPlayNow,
  onLogIn,
  resumeTarget,
  onResume,
}: {
  onPlayNow?: () => void
  onLogIn?: () => void
  /** Screen/session to jump back into after a reload mid Solo/Versus — see App.tsx. */
  resumeTarget?: ResumeState | null
  onResume?: (resume: ResumeState) => void
}) {
  const { isOffline } = useNetworkStatus()
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const errorMessage = useAuthStore((s) => s.errorMessage)
  const checkSession = useAuthStore((s) => s.checkSession)
  const loginAsGuest = useAuthStore((s) => s.loginAsGuest)
  const clearError = useAuthStore((s) => s.clearError)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const { t, locale, setLocale } = useTranslation()

  useEffect(() => {
    let isMounted = true
    checkSession().then((session) => {
      if (!isMounted) return
      if (session) {
        // A real (non-guest) session survived the reload — resuming a guest's
        // in-progress run isn't supported, matching "guest progress has no
        // server-side save" (docs/technical/known-gaps.md).
        if (resumeTarget && !session.isGuest) {
          onResume?.(resumeTarget)
          return
        }
        onPlayNow?.()
        return
      }
      setIsCheckingSession(false)
    })
    return () => { isMounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkSession, resumeTarget])

  async function handlePlayNow() {
    clearError()
    try {
      await loginAsGuest()
      onPlayNow?.()
    } catch {
      // Error captured in useAuthStore
    }
  }

  return (
    <ScreenShell>
      {/* ── Language switch — reachable before Play Now / Log In ── */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitch locale={locale} setLocale={setLocale} label={t.settings.language} />
      </div>

      {/* ── Main content — vertically centred ── */}
      <ScreenMain
        bottomPadding="pb-0"
        topPadding="none"
        className="items-center justify-center px-6 pt-6"
      >
        {/* Offline banner */}
        {isOffline && (
          <div className="mb-6 w-full max-w-xs">
            <StatusBanner
              variant="offline"
              message={t.landing.offlineBanner}
            />
          </div>
        )}

        {/* Real Error banner if session creation fails */}
        {errorMessage && (
          <div className="mb-6 w-full max-w-xs">
            <StatusBanner
              variant="error"
              message={errorMessage}
              onRetry={handlePlayNow}
            />
          </div>
        )}

        <div className="flex w-full max-w-xs flex-col items-center gap-10">
          <BrandArea skeleton={isCheckingSession} t={t} />

          <CtaArea
            skeleton={isCheckingSession}
            disabled={isLoading}
            onPlayNow={handlePlayNow}
            onLogIn={onLogIn ?? (() => {})}
            t={t}
          />

          {!isCheckingSession && <GuestNote t={t} />}
        </div>
      </ScreenMain>
    </ScreenShell>
  )
}
