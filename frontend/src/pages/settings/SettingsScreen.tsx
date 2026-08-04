import { useCallback, useEffect, useRef, useState } from 'react'
import { SettingsSection, SettingsRow } from '@/components/ui/settings'
import { ScreenShell, ScreenOfflineBanner, ScreenMain } from '@/components/ui/layout'
import { BottomNavBar } from '@/components/ui/BottomNavBar'
import { StatusBanner } from '@/components/ui/StatusBanner'
import { Toast } from '@/components/ui/Toast'
import { ProfileCard } from './components/ProfileCard'
import { LogOutDialog } from './components/LogOutDialog'
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
import { IconBook, IconSparkles } from '@/components/ui/icons'
import { settingsService } from '@/services/settings/settings.service'
import { isSupabaseConfigured } from '@/services/backend-config'
import { supabaseService } from '@/services/supabase'
import type { LinkedMethod } from '@/services/settings/settings.interface'
import { useAuthStore } from '@/stores/auth.store'
import { useThemeStore } from '@/stores/theme.store'
import { useHapticsStore } from '@/stores/haptics.store'
import { useSoundsStore } from '@/stores/sounds.store'
import { useNetworkStatus } from '@/lib/hooks/useNetworkStatus'
import { useTranslation } from '@/i18n/useTranslation'
import { ScoringRulesModal } from '@/components/ui/modal/ScoringRulesModal'
import { BeginnerGuideModal } from '@/components/ui/modal/BeginnerGuideModal'
import { PrivacyPolicyModal } from '@/components/ui/modal/PrivacyPolicyModal'
import { TermsOfServiceModal } from '@/components/ui/modal/TermsOfServiceModal'
import { AppVersionModal } from '@/components/ui/modal/AppVersionModal'

// ─── Main component ────────────────────────────────────────────
export function SettingsScreen({
  onBack,
  onBeforeLogOut,
  onLogOut,
  onNavigate,
}: {
  /** Navigate back to wherever the player came from. */
  onBack?: () => void
  /** Called right before sign-out — e.g. leave any 'waiting' versus room. */
  onBeforeLogOut?: () => Promise<void>
  /** Called after log-out is confirmed — navigate to Landing / First Run. */
  onLogOut?: () => void
  /** Bottom nav tab taps ('home' / 'play' / 'stats' / 'settings'). */
  onNavigate?: (id: string) => void
}) {
  const { isOffline } = useNetworkStatus()
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const checkSession = useAuthStore((s) => s.checkSession)
  const { t, locale, setLocale } = useTranslation()
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const hapticEnabled = useHapticsStore((s) => s.enabled)
  const setHapticEnabled = useHapticsStore((s) => s.setEnabled)
  const soundsEnabled = useSoundsStore((s) => s.enabled)
  const setSoundsEnabled = useSoundsStore((s) => s.setEnabled)

  const [linkedMethods, setLinkedMethods] = useState<LinkedMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  // Settings toggles — initialized from the server fetch below.
  const [notifications, setNotifications] = useState(true)
  const [sounds, setSounds] = useState(true)
  const [haptics, setHaptics] = useState(false)

  // Shared toast — "Saved" after a real toggle, or a notice for not-yet-built actions.
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Log-out dialog
  const [logOutDialogVisible, setLogOutDialogVisible] = useState(false)
  const [logOutBusy, setLogOutBusy] = useState(false)
  const [scoringRulesModalVisible, setScoringRulesModalVisible] = useState(false)
  const [beginnerGuideModalVisible, setBeginnerGuideModalVisible] = useState(false)
  const [privacyPolicyModalVisible, setPrivacyPolicyModalVisible] = useState(false)
  const [termsOfServiceModalVisible, setTermsOfServiceModalVisible] = useState(false)
  const [appVersionModalVisible, setAppVersionModalVisible] = useState(false)

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToastMessage(message)
    toastTimer.current = setTimeout(() => setToastMessage(null), 2000)
  }, [])

  function toggleLanguage() {
    const newLocale = locale === 'en' ? 'vi' : 'en'
    setLocale(newLocale)
    showToast(t.settings.saved)

    if (isSupabaseConfigured()) {
      supabaseService.updateSettings({ language: newLocale })
    } else {
      const { user } = useAuthStore.getState()
      if (user && !user.isGuest) {
        settingsService.saveLocale(newLocale).catch(() => {
          setLocale(locale)
          showToast(t.settings.notImplemented)
        })
      }
    }
  }

  const load = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    try {
      await checkSession()
      if (isSupabaseConfigured()) {
        const remote = await supabaseService.getSettings()
        if (remote) {
          if (remote.preferred_language) setLocale(remote.preferred_language)
          if (typeof remote.sounds_enabled === 'boolean') setSoundsEnabled(remote.sounds_enabled)
          if (typeof remote.haptics_enabled === 'boolean') setHapticEnabled(remote.haptics_enabled)
          if (typeof remote.notifications_enabled === 'boolean') setNotifications(remote.notifications_enabled)
        }
      } else {
        const settings = await settingsService.getSettings()
        setLinkedMethods(settings.linkedMethods)
        setNotifications(settings.notifications)
        setSounds(settings.sounds)
        setHaptics(settings.haptics)
      }
    } catch {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }, [checkSession, setLocale, setSoundsEnabled, setHapticEnabled])

  useEffect(() => {
    load()
  }, [load])

  /** Toggle rows save locally only for now — see docs/technical/known-gaps.md. */
  function handleToggle<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v)
      showToast(t.settings.saved)
    }
  }

  function notImplemented() {
    showToast(t.settings.notImplemented)
  }

  async function handleLogOutConfirm() {
    setLogOutBusy(true)
    await onBeforeLogOut?.().catch(() => {})
    await logout()
    setLogOutBusy(false)
    setLogOutDialogVisible(false)
    onLogOut?.()
  }

  return (
    <ScreenShell>
      <Toast visible={toastMessage !== null} message={toastMessage ?? ''} />

      {/* Log-out confirmation */}
      <LogOutDialog
        visible={logOutDialogVisible}
        busy={logOutBusy}
        onConfirm={handleLogOutConfirm}
        onCancel={() => setLogOutDialogVisible(false)}
      />

      {/* Scoring rules explanation modal */}
      <ScoringRulesModal
        visible={scoringRulesModalVisible}
        onClose={() => setScoringRulesModalVisible(false)}
      />

      {/* ── HEADER ── */}
      <header className="px-4 pb-2 pt-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label={t.common.back}
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
              {t.settings.title}
            </h1>
            {!isLoading && (
              <p className="mt-0.5 text-[13px] text-[var(--ma-fg-muted)]">
                {t.settings.subtitle}
              </p>
            )}
          </div>
          {!isLoading && (
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
          message={t.settings.loadError}
          onRetry={load}
        />
      )}
      <ScreenOfflineBanner show={isOffline} message={t.settings.offlineBanner} />

      {/* ── MAIN CONTENT ── */}
      <ScreenMain bottomPadding="pb-24" topPadding="none" className="overflow-y-auto">
        <div className="flex flex-col gap-5 px-4 pt-3">

          {/* Profile card */}
          <ProfileCard skeleton={isLoading} user={user} />

          {/* Login methods */}
          <SettingsSection title={t.settings.loginMethods} skeleton={isLoading}>
            {linkedMethods.map((m) => (
              <LinkedMethodRow key={m.id} method={m} skeleton={isLoading} />
            ))}

            {/* Add login method — disabled offline */}
            {!isLoading && (
              <SettingsRow
                icon={<IconLink />}
                label={t.settings.addLoginMethod}
                description={isOffline ? t.settings.needsConnection : undefined}
                variant="nav"
                onClick={isOffline ? undefined : notImplemented}
                disabled={isOffline}
              />
            )}
          </SettingsSection>

          {/* Game settings */}
          <SettingsSection title={t.settings.game} skeleton={isLoading}>
            <SettingsRow
              icon={<IconBell />}
              label={t.settings.notifications}
              description={t.settings.notificationsDesc}
              variant="toggle"
              checked={notifications}
              onToggle={handleToggle(setNotifications)}
              skeleton={isLoading}
            />
            <SettingsRow
              icon={<IconVolume />}
              label={t.settings.soundEffects}
              description={t.settings.soundEffectsDesc}
              variant="toggle"
              checked={soundsEnabled}
              onToggle={(next) => {
                setSoundsEnabled(next)
                showToast(t.settings.saved)
                if (isSupabaseConfigured()) supabaseService.updateSettings({ sounds: next })
              }}
              skeleton={isLoading}
            />
            <SettingsRow
              icon={<IconVibrate />}
              label={t.settings.hapticFeedback}
              description={t.settings.hapticFeedbackDesc}
              variant="toggle"
              checked={hapticEnabled}
              onToggle={(next) => {
                setHapticEnabled(next)
                showToast(t.settings.saved)
                if (isSupabaseConfigured()) supabaseService.updateSettings({ haptics: next })
              }}
              skeleton={isLoading}
            />
            <SettingsRow
              icon={<IconSparkles width={18} height={18} />}
              label={t.settings.beginnerGuide}
              description={t.settings.beginnerGuideDesc}
              variant="nav"
              onClick={() => setBeginnerGuideModalVisible(true)}
              skeleton={isLoading}
            />
            <SettingsRow
              icon={<IconBook />}
              label={t.settings.scoringRules}
              description={t.settings.scoringRulesDesc}
              variant="nav"
              onClick={() => setScoringRulesModalVisible(true)}
              skeleton={isLoading}
            />
          </SettingsSection>

          {/* Display */}
          <SettingsSection title={t.settings.display} skeleton={isLoading}>
            <SettingsRow
              icon={<IconMoon />}
              label={t.settings.darkMode}
              description={t.settings.darkModeDesc}
              variant="toggle"
              checked={theme === 'dark'}
              onToggle={() => {
                const nextTheme = theme === 'dark' ? 'light' : 'dark'
                toggleTheme()
                showToast(t.settings.saved)
                settingsService.saveTheme(nextTheme)
              }}
              skeleton={isLoading}
            />
            <SettingsRow
              icon={<IconLanguage />}
              label={t.settings.language}
              variant="value"
              value={locale === 'en' ? t.settings.languageEnglish : t.settings.languageVietnamese}
              onClick={toggleLanguage}
              skeleton={isLoading}
            />
          </SettingsSection>

          {/* About */}
          <SettingsSection title={t.settings.about} skeleton={isLoading}>
            <SettingsRow
              icon={<IconInfo />}
              label={t.settings.appVersion}
              variant="value"
              value="1.1.0"
              onClick={() => setAppVersionModalVisible(true)}
              skeleton={isLoading}
            />
            <SettingsRow
              icon={<IconShield />}
              label={t.settings.privacyPolicy}
              variant="nav"
              onClick={() => setPrivacyPolicyModalVisible(true)}
              skeleton={isLoading}
            />
            <SettingsRow
              icon={<IconDocument />}
              label={t.settings.termsOfService}
              variant="nav"
              onClick={() => setTermsOfServiceModalVisible(true)}
              skeleton={isLoading}
            />
          </SettingsSection>

          {/* Danger zone — only when content is loaded */}
          {!isLoading && (
            <SettingsSection title={t.settings.dangerZone}>
              <SettingsRow
                icon={<IconTrash />}
                label={t.settings.resetProgress}
                description={t.settings.resetProgressDesc}
                variant="danger"
                onClick={notImplemented}
              />
            </SettingsSection>
          )}

          {/* Session / Log out */}
          {!isLoading && (
            <SettingsSection title={t.settings.session}>
              <SettingsRow
                icon={<IconLogOut />}
                label={t.settings.logOut}
                variant="danger"
                onClick={() => setLogOutDialogVisible(true)}
              />
            </SettingsSection>
          )}

          {isOffline && !isLoading && (
            <p className="pb-2 text-center text-[11px] text-[var(--ma-fg-subtle)]">
              {t.settings.offlineNote}
            </p>
          )}

        </div>
      </ScreenMain>

      {/* Modals */}
      <BeginnerGuideModal
        visible={beginnerGuideModalVisible}
        onClose={() => setBeginnerGuideModalVisible(false)}
      />

      <ScoringRulesModal
        visible={scoringRulesModalVisible}
        onClose={() => setScoringRulesModalVisible(false)}
      />

      <PrivacyPolicyModal
        visible={privacyPolicyModalVisible}
        onClose={() => setPrivacyPolicyModalVisible(false)}
      />

      <TermsOfServiceModal
        visible={termsOfServiceModalVisible}
        onClose={() => setTermsOfServiceModalVisible(false)}
      />

      <AppVersionModal
        visible={appVersionModalVisible}
        onClose={() => setAppVersionModalVisible(false)}
      />

      {/* ── NAVIGATION ── */}
      <BottomNavBar active="settings" onNavigate={onNavigate} />
    </ScreenShell>
  )
}
