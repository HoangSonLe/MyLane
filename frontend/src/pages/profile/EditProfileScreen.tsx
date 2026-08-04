import { useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { StatusBanner } from '@/components/ui/StatusBanner'
import {
  ScreenHeaderWithBack,
  ScreenMain,
  ScreenOfflineBanner,
  ScreenShell,
} from '@/components/ui/layout'
import { useTranslation } from '@/i18n/useTranslation'
import { useNetworkStatus } from '@/lib/hooks/useNetworkStatus'
import { prepareAvatarImage } from '@/lib/utils/avatar-image'
import { getInitials } from '@/lib/utils'
import { profileService } from '@/services/profile/profile.service'
import { useAuthStore } from '@/stores/auth.store'

const HANDLE_PATTERN = /^[a-z0-9._]{3,20}$/

function IconCamera() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h3l1.5-2h7L17 7h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}

export function EditProfileScreen({
  onBack,
  onSaved,
}: {
  onBack?: () => void
  onSaved?: () => void
}) {
  const { t } = useTranslation()
  const { isOffline } = useNetworkStatus()
  const updateProfileIdentity = useAuthStore((state) => state.updateProfileIdentity)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewObjectUrlRef = useRef<string | null>(null)

  const [initial, setInitial] = useState({ username: '', handle: '', avatarUrl: '' })
  const [username, setUsername] = useState('')
  const [handle, setHandle] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showDiscard, setShowDiscard] = useState(false)

  const load = async () => {
    setIsLoading(true)
    setLoadError(false)
    try {
      const profile = await profileService.getProfile()
      const next = {
        username: profile.username,
        handle: profile.handle,
        avatarUrl: profile.avatarUrl || '',
      }
      setInitial(next)
      setUsername(next.username)
      setHandle(next.handle)
      setAvatarUrl(next.avatarUrl)
    } catch {
      setLoadError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
    return () => {
      if (previewObjectUrlRef.current) URL.revokeObjectURL(previewObjectUrlRef.current)
    }
  }, [])

  const normalizedHandle = handle.trim().toLowerCase()
  const nameIsValid = username.trim().length >= 2 && username.trim().length <= 30
  const handleIsValid = HANDLE_PATTERN.test(normalizedHandle)
  const isDirty =
    username.trim() !== initial.username ||
    normalizedHandle !== initial.handle ||
    Boolean(avatarFile)

  const fieldError = useMemo(() => {
    if (username.length > 0 && !nameIsValid) return t.editProfile.nameInvalid
    if (handle.length > 0 && !handleIsValid) return t.editProfile.handleInvalid
    return null
  }, [handle.length, handleIsValid, nameIsValid, t, username.length])

  function requestBack() {
    if (isDirty) setShowDiscard(true)
    else onBack?.()
  }

  async function chooseAvatar(file?: File) {
    if (!file) return
    setErrorMessage(null)
    try {
      const prepared = await prepareAvatarImage(file)
      if (previewObjectUrlRef.current) URL.revokeObjectURL(previewObjectUrlRef.current)
      const previewUrl = URL.createObjectURL(prepared)
      previewObjectUrlRef.current = previewUrl
      setAvatarFile(prepared)
      setAvatarUrl(previewUrl)
    } catch (error) {
      const code = error instanceof Error ? error.message : ''
      setErrorMessage(
        code === 'PROFILE_AVATAR_TYPE'
          ? t.editProfile.avatarType
          : code === 'PROFILE_AVATAR_SIZE'
            ? t.editProfile.avatarSize
            : t.editProfile.avatarInvalid,
      )
    }
  }

  async function save() {
    if (!nameIsValid || !handleIsValid || isOffline || isSaving) return
    setIsSaving(true)
    setErrorMessage(null)
    try {
      let savedAvatarUrl = initial.avatarUrl || undefined
      if (avatarFile) savedAvatarUrl = await profileService.uploadAvatar(avatarFile)
      const profile = await profileService.updateProfile({
        username: username.trim(),
        handle: normalizedHandle,
        avatarUrl: savedAvatarUrl,
      })
      updateProfileIdentity({ name: profile.username, avatarUrl: profile.avatarUrl })
      onSaved?.()
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      setErrorMessage(
        message.includes('PROFILE_HANDLE_TAKEN')
          ? t.editProfile.handleTaken
          : t.editProfile.saveError,
      )
    } finally {
      setIsSaving(false)
    }
  }

  const displayName = username.trim() || t.profile.guestLabel

  return (
    <ScreenShell>
      <ScreenHeaderWithBack onBack={requestBack} title={t.editProfile.title} />
      <ScreenOfflineBanner show={isOffline} message={t.editProfile.offline} />

      {loadError && <StatusBanner variant="error" message={t.editProfile.loadError} onRetry={() => void load()} />}
      {errorMessage && <StatusBanner variant="error" message={errorMessage} />}

      <ScreenMain bottomPadding="pb-10" ariaBusy={isLoading || isSaving}>
        {isLoading ? (
          <div className="flex flex-col gap-5 px-4 pt-4">
            <div className="skeleton mx-auto h-24 w-24 rounded-[var(--radius-2xl)]" />
            <div className="skeleton h-12 rounded-[var(--radius-xl)]" />
            <div className="skeleton h-12 rounded-[var(--radius-xl)]" />
          </div>
        ) : !loadError ? (
          <form
            className="flex flex-col gap-5 px-4 pt-3"
            onSubmit={(event) => {
              event.preventDefault()
              void save()
            }}
          >
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-[var(--radius-2xl)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
                style={{ background: 'var(--ma-surface-raised)', border: '2px solid var(--ma-border)' }}
                aria-label={t.editProfile.changeAvatar}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[26px] font-bold text-[var(--ma-fg-muted)]">{getInitials(displayName)}</span>
                )}
                <span className="absolute inset-x-0 bottom-0 flex h-8 items-center justify-center bg-black/55 text-white">
                  <IconCamera />
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => {
                  void chooseAvatar(event.target.files?.[0])
                  event.currentTarget.value = ''
                }}
              />
              <p className="max-w-xs text-center text-[12px] leading-relaxed text-[var(--ma-fg-subtle)]">
                {t.editProfile.avatarHint}
              </p>
            </div>

            <label className="flex flex-col gap-1.5" htmlFor="profile-display-name">
              <span className="text-[13px] font-medium text-[var(--ma-fg-muted)]">{t.editProfile.displayName}</span>
              <input
                id="profile-display-name"
                value={username}
                maxLength={30}
                autoComplete="name"
                onChange={(event) => setUsername(event.target.value)}
                className="h-12 rounded-[var(--radius-xl)] border border-[var(--ma-border)] bg-[var(--ma-surface-raised)] px-4 text-[15px] text-[var(--ma-fg)] outline-none focus:ring-2 focus:ring-[var(--ma-ring)]"
              />
            </label>

            <label className="flex flex-col gap-1.5" htmlFor="profile-handle">
              <span className="text-[13px] font-medium text-[var(--ma-fg-muted)]">{t.editProfile.handle}</span>
              <div className="flex h-12 items-center rounded-[var(--radius-xl)] border border-[var(--ma-border)] bg-[var(--ma-surface-raised)] px-4 focus-within:ring-2 focus-within:ring-[var(--ma-ring)]">
                <span className="text-[15px] text-[var(--ma-fg-subtle)]">@</span>
                <input
                  id="profile-handle"
                  value={handle}
                  maxLength={20}
                  autoCapitalize="none"
                  autoCorrect="off"
                  onChange={(event) => setHandle(event.target.value.toLowerCase())}
                  className="h-full min-w-0 flex-1 bg-transparent pl-1 text-[15px] text-[var(--ma-fg)] outline-none"
                />
              </div>
              <span className="text-[11px] text-[var(--ma-fg-subtle)]">{t.editProfile.handleHint}</span>
            </label>

            {fieldError && <p role="alert" className="text-[12px] font-medium text-[var(--ma-danger)]">{fieldError}</p>}

            <div className="mt-2 flex flex-col gap-3">
              <Button
                type="submit"
                variant="brand"
                size="app-12"
                disabled={!isDirty || !nameIsValid || !handleIsValid || isOffline || isSaving}
                className="w-full active:scale-[0.98]"
              >
                {isSaving ? t.editProfile.saving : t.editProfile.save}
              </Button>
              <Button type="button" variant="surface" size="app-12" onClick={requestBack} disabled={isSaving} className="w-full">
                {t.common.cancel}
              </Button>
            </div>
          </form>
        ) : null}
      </ScreenMain>

      <ConfirmDialog
        open={showDiscard}
        title={t.editProfile.discardTitle}
        message={t.editProfile.discardMessage}
        confirmLabel={t.editProfile.discard}
        cancelLabel={t.editProfile.keepEditing}
        onConfirm={() => onBack?.()}
        onCancel={() => setShowDiscard(false)}
      />
    </ScreenShell>
  )
}
