import { ModalBackdrop } from '@/components/ui/ModalBackdrop'
import {
  IconCategoryNumber,
  IconCategoryAlphabet,
  IconCategoryGrid,
  IconCategorySequence,
  IconCategoryColor,
  IconSparkles,
} from '@/components/ui/icons'
import { useTranslation } from '@/i18n/useTranslation'

interface Props {
  visible: boolean
  onClose: () => void
}

export function BeginnerGuideModal({ visible, onClose }: Props) {
  const { t } = useTranslation()
  const m = t.beginnerGuideModal

  if (!visible) return null

  return (
    <ModalBackdrop show={visible} onClose={onClose}>
      <div
        className="w-[calc(100vw-2rem)] sm:w-full sm:max-w-lg max-h-[85vh] flex flex-col overflow-hidden p-4 sm:p-5 transition-all relative"
        style={{
          borderRadius: 'var(--radius-2xl)',
          background: 'var(--ma-surface-raised)',
          border: '1px solid var(--ma-border)',
          boxShadow: 'var(--ma-shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-3 shrink-0 border-b border-[var(--ma-border-subtle)]">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
              style={{
                background: 'var(--ma-brand-soft)',
                color: 'var(--ma-brand)',
              }}
            >
              <IconSparkles width={20} height={20} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-[16px] sm:text-[18px] font-bold text-[var(--ma-fg)] leading-tight truncate">
                {m.title}
              </h2>
              <p className="text-[12px] text-[var(--ma-fg-subtle)] truncate">
                {m.subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--ma-surface)] text-[var(--ma-fg-subtle)] hover:text-[var(--ma-fg)] transition-colors"
            aria-label={t.common.close}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pt-4 pb-2 pr-1 space-y-4 text-[13px] sm:text-[14px]">

          {/* Section 1: Game Modes Overview */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[13px] font-bold text-[var(--ma-brand)] uppercase tracking-wider">
              {m.modesTitle}
            </h3>
            <div className="space-y-2">
              <div
                className="p-3 rounded-xl flex flex-col gap-1"
                style={{ background: 'var(--ma-surface)', border: '1px solid var(--ma-border-subtle)' }}
              >
                <div className="font-bold text-[13px] text-[var(--ma-fg)] flex items-center gap-1.5">
                  <span>🎯</span> {m.soloPracticeTitle}
                </div>
                <p className="text-[12px] text-[var(--ma-fg-muted)] leading-relaxed">
                  {m.soloPracticeDesc}
                </p>
              </div>

              <div
                className="p-3 rounded-xl flex flex-col gap-1"
                style={{ background: 'var(--ma-surface)', border: '1px solid var(--ma-border-subtle)' }}
              >
                <div className="font-bold text-[13px] text-[var(--ma-fg)] flex items-center gap-1.5">
                  <span>🏆</span> {m.soloRankedTitle}
                </div>
                <p className="text-[12px] text-[var(--ma-fg-muted)] leading-relaxed">
                  {m.soloRankedDesc}
                </p>
              </div>

              <div
                className="p-3 rounded-xl flex flex-col gap-1"
                style={{ background: 'var(--ma-surface)', border: '1px solid var(--ma-border-subtle)' }}
              >
                <div className="font-bold text-[13px] text-[var(--ma-fg)] flex items-center gap-1.5">
                  <span>⚔️</span> {m.versusTitle}
                </div>
                <p className="text-[12px] text-[var(--ma-fg-muted)] leading-relaxed">
                  {m.versusDesc}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: 5 Memory Categories */}
          <div className="flex flex-col gap-2 pt-2">
            <h3 className="text-[13px] font-bold text-[var(--ma-brand)] uppercase tracking-wider">
              {m.categoriesTitle}
            </h3>
            <div className="space-y-2">
              <div
                className="p-3 rounded-xl flex flex-col gap-1"
                style={{ background: 'var(--ma-surface)', border: '1px solid var(--ma-border-subtle)' }}
              >
                <div className="font-bold text-[13px] text-[var(--ma-fg)] flex items-center gap-2">
                  <span className="text-[var(--ma-brand)]"><IconCategoryNumber width={16} height={16} /></span>
                  {m.numberTitle}
                </div>
                <p className="text-[12px] text-[var(--ma-fg-muted)] leading-relaxed">
                  {m.numberDesc}
                </p>
              </div>

              <div
                className="p-3 rounded-xl flex flex-col gap-1"
                style={{ background: 'var(--ma-surface)', border: '1px solid var(--ma-border-subtle)' }}
              >
                <div className="font-bold text-[13px] text-[var(--ma-fg)] flex items-center gap-2">
                  <span className="text-[var(--ma-brand)]"><IconCategoryAlphabet width={16} height={16} /></span>
                  {m.alphabetTitle}
                </div>
                <p className="text-[12px] text-[var(--ma-fg-muted)] leading-relaxed">
                  {m.alphabetDesc}
                </p>
              </div>

              <div
                className="p-3 rounded-xl flex flex-col gap-1"
                style={{ background: 'var(--ma-surface)', border: '1px solid var(--ma-border-subtle)' }}
              >
                <div className="font-bold text-[13px] text-[var(--ma-fg)] flex items-center gap-2">
                  <span className="text-[var(--ma-brand)]"><IconCategoryGrid width={16} height={16} /></span>
                  {m.gridTitle}
                </div>
                <p className="text-[12px] text-[var(--ma-fg-muted)] leading-relaxed">
                  {m.gridDesc}
                </p>
              </div>

              <div
                className="p-3 rounded-xl flex flex-col gap-1"
                style={{ background: 'var(--ma-surface)', border: '1px solid var(--ma-border-subtle)' }}
              >
                <div className="font-bold text-[13px] text-[var(--ma-fg)] flex items-center gap-2">
                  <span className="text-[var(--ma-brand)]"><IconCategorySequence width={16} height={16} /></span>
                  {m.sequenceTitle}
                </div>
                <p className="text-[12px] text-[var(--ma-fg-muted)] leading-relaxed">
                  {m.sequenceDesc}
                </p>
              </div>

              <div
                className="p-3 rounded-xl flex flex-col gap-1"
                style={{ background: 'var(--ma-surface)', border: '1px solid var(--ma-border-subtle)' }}
              >
                <div className="font-bold text-[13px] text-[var(--ma-fg)] flex items-center gap-2">
                  <span className="text-[var(--ma-brand)]"><IconCategoryColor width={16} height={16} /></span>
                  {m.colorTitle}
                </div>
                <p className="text-[12px] text-[var(--ma-fg-muted)] leading-relaxed">
                  {m.colorDesc}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Beginner Tips */}
          <div className="flex flex-col gap-2 pt-2">
            <h3 className="text-[13px] font-bold text-[var(--ma-brand)] uppercase tracking-wider">
              {m.tipsTitle}
            </h3>
            <div className="p-3.5 rounded-xl space-y-2.5" style={{ background: 'oklch(0.76 0.14 74 / 0.08)', border: '1px solid oklch(0.76 0.14 74 / 0.20)' }}>
              <div>
                <div className="font-bold text-[12px] text-[var(--ma-brand)]">
                  {m.tip1Title}
                </div>
                <p className="text-[12px] text-[var(--ma-fg-muted)] mt-0.5">
                  {m.tip1Desc}
                </p>
              </div>

              <div className="border-t border-[var(--ma-border-subtle)] pt-2">
                <div className="font-bold text-[12px] text-[var(--ma-brand)]">
                  {m.tip2Title}
                </div>
                <p className="text-[12px] text-[var(--ma-fg-muted)] mt-0.5">
                  {m.tip2Desc}
                </p>
              </div>

              <div className="border-t border-[var(--ma-border-subtle)] pt-2">
                <div className="font-bold text-[12px] text-[var(--ma-brand)]">
                  {m.tip3Title}
                </div>
                <p className="text-[12px] text-[var(--ma-fg-muted)] mt-0.5">
                  {m.tip3Desc}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3 shrink-0" style={{ borderTop: '1px solid var(--ma-border-subtle)' }}>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-bold text-[14px] transition-colors"
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
