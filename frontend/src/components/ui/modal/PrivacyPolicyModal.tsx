import { ModalBackdrop } from '@/components/ui/ModalBackdrop'
import { IconShield } from '@/pages/settings/components/icons'
import { useTranslation } from '@/i18n/useTranslation'

interface Props {
  visible: boolean
  onClose: () => void
}

export function PrivacyPolicyModal({ visible, onClose }: Props) {
  const { t } = useTranslation()
  const m = t.privacyPolicyModal

  if (!visible) return null

  return (
    <ModalBackdrop show={visible} onClose={onClose}>
      <div
        className="w-[calc(100vw-2rem)] sm:w-full sm:max-w-xl max-h-[78dvh] sm:max-h-[88vh] flex flex-col overflow-hidden p-4 sm:p-6 transition-all"
        style={{
          borderRadius: 'var(--radius-2xl)',
          background: 'var(--ma-surface-raised)',
          border: '1px solid var(--ma-border)',
          boxShadow: 'var(--ma-shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-3.5 shrink-0 border-b border-[var(--ma-border-subtle)]">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl shrink-0"
              style={{
                background: 'var(--ma-brand-soft)',
                color: 'var(--ma-brand)',
              }}
            >
              <IconShield />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] sm:text-[18px] font-bold text-[var(--ma-fg)] leading-tight truncate">
                  {m.title}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--ma-brand-soft)] text-[var(--ma-brand)] shrink-0">
                  v1.1
                </span>
              </div>
              <p className="text-[11px] sm:text-[12px] text-[var(--ma-fg-subtle)] truncate mt-0.5">
                {m.subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--ma-surface)] text-[var(--ma-fg-subtle)] hover:text-[var(--ma-fg)] active:scale-95 transition-all"
            aria-label={t.common.close}
          >
            ✕
          </button>
        </div>

        {/* Date badge */}
        <div className="py-2.5 px-3.5 my-2 rounded-xl bg-[var(--ma-surface)] border border-[var(--ma-border-subtle)] text-[11px] sm:text-[12px] flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3">
          <span className="text-[var(--ma-fg-subtle)] font-medium flex items-center gap-1.5 shrink-0">
            <span>🛡️</span>
            <span>{m.officialBadge || 'Văn bản pháp lý chính thức'}</span>
          </span>
          <span className="font-semibold text-[var(--ma-fg-muted)] shrink-0 pl-[1.35rem] sm:pl-0">
            {m.lastUpdated}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pt-2 pb-2 pr-1 space-y-3.5 text-[13px] sm:text-[14px]">
          {/* Article 1 */}
          <div
            className="p-4 rounded-xl flex flex-col gap-2"
            style={{
              background: 'var(--ma-surface)',
              border: '1px solid var(--ma-border-subtle)',
            }}
          >
            <h3 className="font-bold text-[14px] text-[var(--ma-fg)]">
              {m.sec1Title}
            </h3>
            <p className="text-[12px] sm:text-[13px] text-[var(--ma-fg-muted)] leading-relaxed">
              {m.sec1Body}
            </p>
            <ul className="list-disc list-inside space-y-1 text-[12px] text-[var(--ma-fg-subtle)] pl-1">
              <li>{m.sec1Item1}</li>
              <li>{m.sec1Item2}</li>
              <li>{m.sec1Item3}</li>
            </ul>
          </div>

          {/* Article 2 */}
          <div
            className="p-4 rounded-xl flex flex-col gap-2"
            style={{
              background: 'var(--ma-surface)',
              border: '1px solid var(--ma-border-subtle)',
            }}
          >
            <h3 className="font-bold text-[14px] text-[var(--ma-fg)]">
              {m.sec2Title}
            </h3>
            <p className="text-[12px] sm:text-[13px] text-[var(--ma-fg-muted)] leading-relaxed">
              {m.sec2Body}
            </p>
            <ul className="list-disc list-inside space-y-1 text-[12px] text-[var(--ma-fg-subtle)] pl-1">
              <li>{m.sec2Item1}</li>
              <li>{m.sec2Item2}</li>
              <li>{m.sec2Item3}</li>
            </ul>
          </div>

          {/* Article 3 */}
          <div
            className="p-4 rounded-xl flex flex-col gap-2"
            style={{
              background: 'var(--ma-surface)',
              border: '1px solid var(--ma-border-subtle)',
            }}
          >
            <h3 className="font-bold text-[14px] text-[var(--ma-fg)]">
              {m.sec3Title}
            </h3>
            <p className="text-[12px] sm:text-[13px] text-[var(--ma-fg-muted)] leading-relaxed">
              {m.sec3Body}
            </p>
            <ul className="list-disc list-inside space-y-1 text-[12px] text-[var(--ma-fg-subtle)] pl-1">
              <li>{m.sec3Item1}</li>
              <li>{m.sec3Item2}</li>
              <li>{m.sec3Item3}</li>
            </ul>
          </div>

          {/* Article 4 */}
          <div
            className="p-4 rounded-xl flex flex-col gap-2"
            style={{
              background: 'var(--ma-surface)',
              border: '1px solid var(--ma-border-subtle)',
            }}
          >
            <h3 className="font-bold text-[14px] text-[var(--ma-fg)]">
              {m.sec4Title}
            </h3>
            <p className="text-[12px] sm:text-[13px] text-[var(--ma-fg-muted)] leading-relaxed">
              {m.sec4Body}
            </p>
            <ul className="list-disc list-inside space-y-1 text-[12px] text-[var(--ma-fg-subtle)] pl-1">
              <li>{m.sec4Item1}</li>
              <li>{m.sec4Item2}</li>
            </ul>
          </div>

          {/* Article 5 */}
          <div
            className="p-4 rounded-xl flex flex-col gap-1.5"
            style={{
              background: 'var(--ma-surface)',
              border: '1px solid var(--ma-border-subtle)',
            }}
          >
            <h3 className="font-bold text-[14px] text-[var(--ma-fg)]">
              {m.sec5Title}
            </h3>
            <p className="text-[12px] sm:text-[13px] text-[var(--ma-fg-muted)] leading-relaxed">
              {m.sec5Body}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3.5 shrink-0 flex items-center gap-3" style={{ borderTop: '1px solid var(--ma-border-subtle)' }}>
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
