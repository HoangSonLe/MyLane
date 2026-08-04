import { useState } from 'react'
import { ModalBackdrop } from '@/components/ui/ModalBackdrop'
import { useTranslation } from '@/i18n/useTranslation'

interface Props {
  visible: boolean
  onClose: () => void
}

export function AppVersionModal({ visible, onClose }: Props) {
  const { t } = useTranslation()
  const m = t.appVersionModal

  const [checking, setChecking] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  if (!visible) return null

  const handleCheckUpdates = () => {
    setChecking(true)
    setTimeout(() => {
      setChecking(false)
      setToastMsg(m.alreadyLatestToast)
      setTimeout(() => setToastMsg(null), 2500)
    }, 800)
  }

  return (
    <ModalBackdrop show={visible} onClose={onClose}>
      <div
        className="w-[calc(100vw-2rem)] sm:w-full sm:max-w-md max-h-[85vh] flex flex-col overflow-hidden p-4 sm:p-5 transition-all relative"
        style={{
          borderRadius: 'var(--radius-2xl)',
          background: 'var(--ma-surface-raised)',
          border: '1px solid var(--ma-border)',
          boxShadow: 'var(--ma-shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast notification */}
        {toastMsg && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-full text-[12px] font-semibold bg-[var(--ma-brand)] text-white shadow-lg animate-bounce">
            {toastMsg}
          </div>
        )}

        {/* Top Header & App Badge */}
        <div className="flex flex-col items-center text-center pt-2 pb-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl mb-3 shadow-md border border-white/20"
            style={{
              background: 'linear-gradient(135deg, var(--ma-brand) 0%, #3b82f6 100%)',
              color: '#ffffff',
            }}
          >
            <span className="text-3xl font-black tracking-tight leading-none">ML</span>
          </div>

          <h2 className="text-[20px] font-extrabold text-[var(--ma-fg)] leading-tight">
            My Lane GameBoard
          </h2>
          <p className="text-[12px] text-[var(--ma-fg-subtle)] mt-0.5">
            {m.subtitle}
          </p>

          <div className="flex items-center gap-2 mt-3">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[var(--ma-surface)] text-[var(--ma-fg)] border border-[var(--ma-border-subtle)]">
              {m.versionLabel}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {m.upToDate}
            </span>
          </div>
        </div>

        {/* Release Notes */}
        <div
          className="p-4 rounded-xl flex flex-col gap-2 my-1"
          style={{
            background: 'var(--ma-surface)',
            border: '1px solid var(--ma-border-subtle)',
          }}
        >
          <h3 className="font-bold text-[13px] text-[var(--ma-fg)] uppercase tracking-wider">
            {m.whatsNewTitle}
          </h3>
          <ul className="space-y-2 text-[12px] text-[var(--ma-fg-muted)] leading-relaxed pt-1">
            <li className="flex items-start gap-1.5">{m.feature1}</li>
            <li className="flex items-start gap-1.5">{m.feature2}</li>
            <li className="flex items-start gap-1.5">{m.feature3}</li>
            <li className="flex items-start gap-1.5">{m.feature4}</li>
            <li className="flex items-start gap-1.5">{m.feature5}</li>
          </ul>
        </div>

        {/* Build metadata */}
        <div className="text-center text-[11px] text-[var(--ma-fg-subtle)] py-2">
          {m.buildLabel} • My Lane Gaming Engine
        </div>

        {/* Footer Actions */}
        <div className="pt-3 shrink-0 flex flex-col gap-2" style={{ borderTop: '1px solid var(--ma-border-subtle)' }}>
          <button
            type="button"
            onClick={handleCheckUpdates}
            disabled={checking}
            className="w-full py-2.5 rounded-xl font-bold text-[13px] border border-[var(--ma-border)] bg-[var(--ma-surface)] text-[var(--ma-fg)] hover:bg-[var(--ma-brand-soft)] hover:text-[var(--ma-brand)] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {checking ? (
              <>
                <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>{m.checkingUpdates}</span>
              </>
            ) : (
              <span>{m.checkUpdatesBtn}</span>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-bold text-[14px] active:scale-95 transition-all"
            style={{
              background: 'var(--ma-brand)',
              color: 'var(--ma-brand-fg, #ffffff)',
            }}
          >
            {m.close}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  )
}
