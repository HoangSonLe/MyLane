import { useState, useTransition, useCallback, useRef } from 'react'
import { SettingsSection } from './SettingsSection'
import { SettingsRow } from './SettingsRow'
import { BottomNavBar } from '@/components/ui/BottomNavBar'
import { StatusBanner } from '@/components/ui/StatusBanner'
import { StatePill } from '@/components/ui/StatePill'
import { Toast } from './components/Toast'
import { ProfileCard } from './components/ProfileCard'
import { LogOutDialog } from './components/LogOutDialog'
import { EmptyState } from './components/EmptyState'
import { LinkedMethodRow } from './components/LinkedMethodRow'
import {
  IconBell,
  IconVolume,
  IconVibrate,
  IconMoon,
  IconLanguage,
  IconInfo,
  IconShield,
  IconDocument,
  IconTrash,
  IconLink,
  IconLogOut,
  IconBack,
} from './components/icons'
import { MOCK_LINKED_METHODS } from '@/services/settings/settings.mock'

import { ScreenState } from '@/configs/enum'

// ─── Main component ────────────────────────────────────────────
export function SettingsScreen({
  onBack,
  onLogOut,
}: {
  /** Navigate back to Home. */
  onBack?: () => void
  /** Called after log-out is confirmed — navigate to Landing / First Run. */
  onLogOut?: () => void
}) {
  const [screenState, setScreenState] = useState<ScreenState>(ScreenState.NORMAL)
  const [, startTransition] = useTransition()

  // Settings toggles
  const [notifications, setNotifications] = useState(true)
  const [sounds, setSounds] = useState(true)
  const [haptics, setHaptics] = useState(false)
  const [darkMode] = useState(true)

  // Auto-save toast
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Log-out dialog
  const [logOutDialogVisible, setLogOutDialogVisible] = useState(false)
  const [logOutBusy, setLogOutBusy] = useState(false)

  const triggerSave = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToastVisible(true)
    toastTimer.current = setTimeout(() => setToastVisible(false), 2000)
  }, [])

  function handleToggle<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v)
      triggerSave()
    }
  }

  function handleStateChange(s: ScreenState) {
    startTransition(() => setScreenState(s))
  }

  function handleLogOutConfirm() {
    setLogOutBusy(true)
    setTimeout(() => {
      setLogOutBusy(false)
      setLogOutDialogVisible(false)
      onLogOut?.()
    }, 1200)
  }

  const isLoading = screenState === ScreenState.LOADING
  const isError   = screenState === ScreenState.ERROR
  const isOffline = screenState === ScreenState.OFFLINE
  const isEmpty   = screenState === ScreenState.EMPTY

  return (
    <div className="relative flex min-h-dvh flex-col bg-[var(--ma-bg)]">
      {/* Prototype state switcher */}
      <StatePill current={screenState} onChange={handleStateChange} states={[ScreenState.NORMAL, ScreenState.LOADING, ScreenState.EMPTY, ScreenState.ERROR, ScreenState.OFFLINE]} />

      {/* Auto-save toast */}
      <Toast visible={toastVisible} />

      {/* Log-out confirmation */}
      <LogOutDialog
        visible={logOutDialogVisible}
        busy={logOutBusy}
        onConfirm={handleLogOutConfirm}
        onCancel={() => setLogOutDialogVisible(false)}
      />

      {/* ── HEADER ── */}
      <header className="px-4 pb-2 pt-16">
        <div className="flex items-center gap-3">
          {/* Back → Home */}
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to Home"
            className={[
              'flex h-9 w-9 shrink-0 items-center justify-center',
              'transition-colors duration-[var(--ma-duration-micro)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
              'active:bg-[var(--ma-surface-raised)]',
            ].join(' ')}
            style={{
              borderRadius: 'var(--radius-xl)',
              background: 'var(--ma-surface)',
              border: '1px solid var(--ma-border)',
              color: 'var(--ma-fg-muted)',
            }}
          >
            <IconBack />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="text-[22px] font-bold tracking-tight text-[var(--ma-fg)]">
              Settings
            </h1>
            {!isLoading && !isEmpty && (
              <p className="mt-0.5 text-[13px] text-[var(--ma-fg-muted)]">
                Preferences saved automatically
              </p>
            )}
          </div>
          {!isLoading && !isEmpty && (
            <span className="shrink-0 rounded-xl bg-[var(--ma-surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--ma-fg-subtle)]">
              v1.1
            </span>
          )}
        </div>
      </header>

      {/* ── Status banners ── */}
      {isError && (
        <StatusBanner
          variant="error"
          message="Failed to load settings. Please try again."
          onRetry={() => handleStateChange(ScreenState.NORMAL)}
        />
      )}
      {isOffline && (
        <StatusBanner
          variant="offline"
          message="You&apos;re offline. Changes will sync when reconnected."
        />
      )}

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-y-auto pb-24" id="main-content">
        {isEmpty ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-5 px-4 pt-3">

            {/* Profile card */}
            <ProfileCard skeleton={isLoading} />

            {/* Login methods */}
            <SettingsSection title="Login methods" skeleton={isLoading}>
              {MOCK_LINKED_METHODS.map((m) => (
                <LinkedMethodRow key={m.id} method={m} skeleton={isLoading} />
              ))}

              {/* Add login method — disabled offline */}
              {!isLoading && (
                <SettingsRow
                  icon={<IconLink />}
                  label="Add login method"
                  description={isOffline ? 'Needs a connection' : undefined}
                  variant="nav"
                  onClick={isOffline ? undefined : () => {}}
                  disabled={isOffline}
                />
              )}
            </SettingsSection>

            {/* Game settings */}
            <SettingsSection title="Game" skeleton={isLoading}>
              <SettingsRow
                icon={<IconBell />}
                label="Notifications"
                description="Daily reminders and streak alerts"
                variant="toggle"
                checked={notifications}
                onToggle={handleToggle(setNotifications)}
                skeleton={isLoading}
              />
              <SettingsRow
                icon={<IconVolume />}
                label="Sound effects"
                description="Audio feedback during gameplay"
                variant="toggle"
                checked={sounds}
                onToggle={handleToggle(setSounds)}
                skeleton={isLoading}
              />
              <SettingsRow
                icon={<IconVibrate />}
                label="Haptic feedback"
                description="Vibration on interactions"
                variant="toggle"
                checked={haptics}
                onToggle={handleToggle(setHaptics)}
                skeleton={isLoading}
              />
            </SettingsSection>

            {/* Display */}
            <SettingsSection title="Display" skeleton={isLoading}>
              <SettingsRow
                icon={<IconMoon />}
                label="Dark mode"
                description="Always on for Memory Arena"
                variant="toggle"
                checked={darkMode}
                onToggle={() => {}}
                skeleton={isLoading}
                disabled
              />
              <SettingsRow
                icon={<IconLanguage />}
                label="Language"
                variant="value"
                value="English"
                onClick={() => {}}
                skeleton={isLoading}
              />
            </SettingsSection>

            {/* About */}
            <SettingsSection title="About" skeleton={isLoading}>
              <SettingsRow
                icon={<IconInfo />}
                label="App version"
                variant="value"
                value="1.1.0"
                skeleton={isLoading}
              />
              <SettingsRow
                icon={<IconShield />}
                label="Privacy policy"
                variant="nav"
                onClick={() => {}}
                skeleton={isLoading}
              />
              <SettingsRow
                icon={<IconDocument />}
                label="Terms of service"
                variant="nav"
                onClick={() => {}}
                skeleton={isLoading}
              />
            </SettingsSection>

            {/* Danger zone — only when content is loaded */}
            {!isLoading && (
              <SettingsSection title="Danger zone">
                <SettingsRow
                  icon={<IconTrash />}
                  label="Reset all progress"
                  description="This cannot be undone"
                  variant="danger"
                  onClick={() => {}}
                />
              </SettingsSection>
            )}

            {/* Session / Log out */}
            {!isLoading && (
              <SettingsSection title="Session">
                <SettingsRow
                  icon={<IconLogOut />}
                  label="Log out"
                  variant="danger"
                  onClick={() => setLogOutDialogVisible(true)}
                />
              </SettingsSection>
            )}

            {isOffline && !isLoading && (
              <p className="pb-2 text-center text-[11px] text-[var(--ma-fg-subtle)]">
                Changes saved locally · syncs when back online
              </p>
            )}

          </div>
        )}
      </main>

      {/* ── NAVIGATION ── */}
      <BottomNavBar active="settings" onNavigate={() => {}} />
    </div>
  )
}
