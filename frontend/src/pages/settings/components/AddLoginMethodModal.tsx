import { useState, type ComponentType } from 'react'
import { ModalBackdrop } from '@/components/ui/ModalBackdrop'
import { authService } from '@/services/auth/auth.service'
import { useTranslation } from '@/i18n/useTranslation'
import { IconGoogle, IconDiscord } from '@/components/ui/icons'

interface Props {
  show: boolean
  onClose: () => void
  /** Providers already linked — offered again but disabled, not hidden, so
   * the picker's shape doesn't shift as methods get linked. */
  linkedProviderIds: string[]
}

const PROVIDERS: { id: 'google' | 'discord'; label: string; Icon: ComponentType }[] = [
  { id: 'google', label: 'Google', Icon: () => <IconGoogle width={16} height={16} /> },
  { id: 'discord', label: 'Discord', Icon: () => <IconDiscord width={16} height={16} /> },
]

export function AddLoginMethodModal({ show, onClose, linkedProviderIds }: Props) {
  const { t } = useTranslation()
  const [pendingProvider, setPendingProvider] = useState<'google' | 'discord' | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!show) return null

  async function handleLink(provider: 'google' | 'discord') {
    setError(null)
    setPendingProvider(provider)
    try {
      // Redirects the whole page to the provider's consent screen — this
      // call not resolving before navigation is expected, same as
      // authService.loginWithOAuth.
      await authService.linkOAuthMethod(provider)
    } catch (err) {
      setPendingProvider(null)
      setError(err instanceof Error ? err.message : (t.settings.notImplemented || 'Something went wrong.'))
    }
  }

  return (
    <ModalBackdrop show={show} onClose={pendingProvider ? undefined : onClose}>
      <div
        className="w-full max-w-sm p-4 sm:p-5 animate-in fade-in zoom-in-95 duration-200"
        style={{
          borderRadius: 'var(--radius-2xl)',
          background: 'var(--ma-surface-raised)',
          border: '1px solid var(--ma-border)',
          boxShadow: 'var(--ma-shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--ma-border-subtle)' }}>
          <h3 className="text-[16px] font-bold text-[var(--ma-fg)]">{t.settings.addLoginMethod}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ma-surface)] text-[var(--ma-fg-subtle)] hover:text-[var(--ma-fg)] transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] font-medium text-center">
            {error}
          </div>
        )}

        <div className="mt-3 flex flex-col gap-2">
          {PROVIDERS.map(({ id, label, Icon }) => {
            const alreadyLinked = linkedProviderIds.includes(id)
            return (
              <button
                key={id}
                type="button"
                disabled={alreadyLinked || pendingProvider !== null}
                onClick={() => handleLink(id)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors disabled:opacity-50"
                style={{ background: 'var(--ma-surface)', border: '1px solid var(--ma-border-subtle)', color: 'var(--ma-fg)' }}
              >
                <Icon />
                <span className="flex-1 text-left">{label}</span>
                {alreadyLinked && (
                  <span className="text-[11px] font-semibold" style={{ color: 'var(--ma-success)' }}>
                    {t.settings.linked}
                  </span>
                )}
                {pendingProvider === id && <span className="text-[11px]">…</span>}
              </button>
            )
          })}
        </div>
      </div>
    </ModalBackdrop>
  )
}
