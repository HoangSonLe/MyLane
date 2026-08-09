import { InfoModalShell } from './InfoModalShell'
import { IconDocument } from '@/pages/settings/components/icons'
import { useTranslation } from '@/i18n/useTranslation'

interface Props {
  visible: boolean
  onClose: () => void
}

export function TermsOfServiceModal({ visible, onClose }: Props) {
  const { t } = useTranslation()
  const m = t.termsOfServiceModal

  return (
    <InfoModalShell
      visible={visible}
      onClose={onClose}
      closeLabel={t.common.close}
      variant="legal"
      icon={<IconDocument />}
      title={m.title}
      subtitle={m.subtitle}
      titleBadge={
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--ma-brand-soft)] text-[var(--ma-brand)] shrink-0">
          v1.1
        </span>
      }
      infoBar={
        <div className="py-2.5 px-3.5 my-2 rounded-xl bg-[var(--ma-surface)] border border-[var(--ma-border-subtle)] text-[11px] sm:text-[12px] flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3">
          <span className="text-[var(--ma-fg-subtle)] font-medium flex items-center gap-1.5 shrink-0">
            <span>⚖️</span>
            <span>{m.bindingBadge || 'Điều khoản có giá trị pháp lý'}</span>
          </span>
          <span className="font-semibold text-[var(--ma-fg-muted)] shrink-0 pl-[1.35rem] sm:pl-0">
            {m.effectiveDate}
          </span>
        </div>
      }
      footerLabel={m.close}
    >
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
    </InfoModalShell>
  )
}
