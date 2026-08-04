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
        className="w-[calc(100vw-2rem)] sm:w-full sm:max-w-md max-h-[85vh] overflow-y-auto p-4 sm:p-5 transition-all relative"
        style={{
          borderRadius: 'var(--radius-2xl)',
          background: 'var(--ma-surface-raised)',
          border: '1px solid var(--ma-border)',
          boxShadow: 'var(--ma-shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-right close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ma-surface)] text-[var(--ma-fg-subtle)] hover:text-[var(--ma-fg)] active:scale-95 transition-all"
          aria-label={t.common.close}
        >
          ✕
        </button>

        {/* Toast notification */}
        {toastMsg && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-full text-[12px] font-semibold bg-[var(--ma-brand)] text-white shadow-lg animate-bounce">
            {toastMsg}
          </div>
        )}

        {/* Top Header & App Badge */}
        <div className="flex flex-col items-center text-center pt-1 pb-3">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl mb-2.5 shadow-md border border-white/20"
            style={{
              background: 'linear-gradient(135deg, var(--ma-brand) 0%, #3b82f6 100%)',
              color: '#ffffff',
            }}
          >
            <span className="text-2xl font-black tracking-tight leading-none">ML</span>
          </div>

          <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[var(--ma-fg)] leading-tight">
            My Lane GameBoard
          </h2>
          <p className="text-[12px] text-[var(--ma-fg-subtle)] mt-0.5">
            {m.subtitle}
          </p>

          <div className="flex items-center gap-2 mt-2.5">
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
          className="p-3.5 rounded-xl flex flex-col gap-1.5 my-2"
          style={{
            background: 'var(--ma-surface)',
            border: '1px solid var(--ma-border-subtle)',
          }}
        >
          <h3 className="font-bold text-[12px] sm:text-[13px] text-[var(--ma-fg)] uppercase tracking-wider">
            {m.whatsNewTitle}
          </h3>
          <ul className="space-y-1.5 text-[12px] text-[var(--ma-fg-muted)] leading-relaxed pt-0.5">
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

        {/* Footer Actions (Side by Side) */}
        <div className="pt-2.5 grid grid-cols-2 gap-2 border-t border-[var(--ma-border-subtle)]">
          <button
            type="button"
            onClick={handleCheckUpdates}
            disabled={checking}
            className="w-full py-2.5 rounded-xl font-bold text-[12px] sm:text-[13px] border border-[var(--ma-border)] bg-[var(--ma-surface)] text-[var(--ma-fg)] hover:bg-[var(--ma-brand-soft)] hover:text-[var(--ma-brand)] active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            {checking ? (
              <>
                <span className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
                <span className="truncate">{m.checkingUpdates}</span>
              </>
            ) : (
              <span className="truncate">{m.checkUpdatesBtn}</span>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-bold text-[13px] sm:text-[14px] active:scale-95 transition-all"
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
