import { InfoModalShell } from './InfoModalShell'
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

  return (
    <InfoModalShell
      visible={visible}
      onClose={onClose}
      closeLabel={t.common.close}
      variant="info"
      className="relative"
      icon={<IconSparkles width={20} height={20} />}
      title={m.title}
      subtitle={m.subtitle}
      footerLabel={m.close}
    >
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
    </InfoModalShell>
  )
}
