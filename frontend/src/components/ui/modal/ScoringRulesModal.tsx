import { useEffect, useRef } from 'react'
import { InfoModalShell } from './InfoModalShell'
import { IconInfo } from '@/pages/settings/components/icons'
import { useTranslation } from '@/i18n/useTranslation'

export type ScoringSectionId = 'base' | 'speed' | 'difficulty' | 'perfect' | 'completion' | 'elo'

interface Props {
  visible: boolean
  onClose: () => void
  highlightSection?: ScoringSectionId | null
}

export function ScoringRulesModal({ visible, onClose, highlightSection }: Props) {
  const { t } = useTranslation()
  const m = t.scoringRulesModal

  const baseRef = useRef<HTMLDivElement>(null)
  const speedRef = useRef<HTMLDivElement>(null)
  const difficultyRef = useRef<HTMLDivElement>(null)
  const perfectRef = useRef<HTMLDivElement>(null)
  const completionRef = useRef<HTMLDivElement>(null)
  const eloRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!visible || !highlightSection) return
    const sectionMap: Record<ScoringSectionId, React.RefObject<HTMLDivElement | null>> = {
      base: baseRef,
      speed: speedRef,
      difficulty: difficultyRef,
      perfect: perfectRef,
      completion: completionRef,
      elo: eloRef,
    }

    const timer = setTimeout(() => {
      const target = sectionMap[highlightSection]?.current
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 150)

    return () => clearTimeout(timer)
  }, [visible, highlightSection])

  return (
    <InfoModalShell
      visible={visible}
      onClose={onClose}
      closeLabel={t.common.close}
      variant="info"
      icon={<IconInfo />}
      title={m.title}
      subtitle={m.subtitle}
      footerLabel={m.close}
    >
      {/* Formula summary banner */}
      <div
        className="p-3.5 sm:p-4 rounded-xl flex flex-col gap-2"
        style={{
          background: 'oklch(0.76 0.14 74 / 0.10)',
          border: '1px solid oklch(0.76 0.14 74 / 0.25)',
        }}
      >
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--ma-brand)' }}>
          {m.formulaHeader}
        </span>
        <p className="font-semibold text-[13px] sm:text-[14px] leading-relaxed text-[var(--ma-fg)]">
          {m.formulaText}
        </p>
      </div>

      {/* 1. Base Score */}
      <div
        ref={baseRef}
        className={`p-3.5 rounded-xl flex flex-col gap-2 transition-all ${
          highlightSection === 'base' ? 'ring-2 ring-[var(--ma-brand)] bg-[var(--ma-surface-hover)]' : ''
        }`}
        style={{
          background: 'var(--ma-surface)',
          border: '1px solid var(--ma-border-subtle)',
        }}
      >
        <h3 className="font-bold text-[14px] text-[var(--ma-fg)]">
          {m.baseScoreTitle}
        </h3>
        <p className="text-[12px] text-[var(--ma-fg-muted)]">
          {m.baseScoreDesc}
        </p>
        <div className="rounded-lg bg-[var(--ma-surface-raised)] p-2.5 font-mono text-[13px] font-bold text-center text-[var(--ma-brand)] border border-[var(--ma-border)]">
          {m.baseScoreFormula}
        </div>
        <p className="text-[11px] text-[var(--ma-fg-subtle)] italic">
          {m.baseScoreNote}
        </p>
        <p className="text-[11px] font-medium text-[var(--ma-fg-muted)]">
          {m.baseScoreExample}
        </p>
      </div>

      {/* 2. Speed Bonus */}
      <div
        ref={speedRef}
        className={`p-3.5 rounded-xl flex flex-col gap-2 transition-all ${
          highlightSection === 'speed' ? 'ring-2 ring-[var(--ma-brand)] bg-[var(--ma-surface-hover)]' : ''
        }`}
        style={{
          background: 'var(--ma-surface)',
          border: '1px solid var(--ma-border-subtle)',
        }}
      >
        <h3 className="font-bold text-[14px] text-[var(--ma-fg)]">
          {m.speedBonusTitle}
        </h3>
        <p className="text-[12px] text-[var(--ma-fg-muted)]">
          {m.speedBonusDesc}
        </p>
        <div className="rounded-lg bg-[var(--ma-surface-raised)] p-2.5 font-mono text-[13px] font-bold text-center text-[var(--ma-success)] border border-[var(--ma-border)]">
          {m.speedBonusFormula}
        </div>
        <p className="text-[12px] font-semibold text-[var(--ma-fg)] mt-1">
          {m.speedCoefficientsTitle}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[12px] text-[var(--ma-fg-muted)]">
          <div className="rounded-md bg-[var(--ma-surface-raised)] px-2.5 py-1.5 border border-[var(--ma-border-subtle)]">
            {m.numberMemorySpeed}
          </div>
          <div className="rounded-md bg-[var(--ma-surface-raised)] px-2.5 py-1.5 border border-[var(--ma-border-subtle)]">
            {m.alphabetMemorySpeed}
          </div>
          <div className="rounded-md bg-[var(--ma-surface-raised)] px-2.5 py-1.5 border border-[var(--ma-border-subtle)]">
            {m.gridMemorySpeed}
          </div>
          <div className="rounded-md bg-[var(--ma-surface-raised)] px-2.5 py-1.5 border border-[var(--ma-border-subtle)]">
            {m.sequenceMemorySpeed}
          </div>
          <div className="rounded-md bg-[var(--ma-surface-raised)] px-2.5 py-1.5 border border-[var(--ma-border-subtle)] sm:col-span-2">
            {m.colorMemorySpeed}
          </div>
        </div>
      </div>

      {/* 3. Difficulty Multipliers */}
      <div
        ref={difficultyRef}
        className={`p-3.5 rounded-xl flex flex-col gap-2 transition-all ${
          highlightSection === 'difficulty' ? 'ring-2 ring-[var(--ma-brand)] bg-[var(--ma-surface-hover)]' : ''
        }`}
        style={{
          background: 'var(--ma-surface)',
          border: '1px solid var(--ma-border-subtle)',
        }}
      >
        <h3 className="font-bold text-[14px] text-[var(--ma-fg)]">
          {m.difficultyTitle}
        </h3>
        <p className="text-[12px] text-[var(--ma-fg-muted)]">
          {m.difficultyDesc}
        </p>
        <div className="grid grid-cols-2 gap-2 text-[12px] text-center font-medium">
          <div className="rounded-lg bg-[var(--ma-surface-raised)] p-2 border border-[var(--ma-border)]">
            <span className="text-[var(--ma-fg-muted)]">{m.easyDiff}</span>
          </div>
          <div className="rounded-lg bg-[var(--ma-surface-raised)] p-2 border border-[var(--ma-border)]">
            <span className="text-[var(--ma-fg)]">{m.mediumDiff}</span>
          </div>
          <div className="rounded-lg bg-[var(--ma-surface-raised)] p-2 border border-[var(--ma-border)]">
            <span className="font-semibold text-[var(--ma-brand)]">{m.hardDiff}</span>
          </div>
          <div className="rounded-lg bg-[var(--ma-surface-raised)] p-2 border border-[var(--ma-border)]">
            <span className="font-bold text-[var(--ma-brand)]">{m.superHardDiff}</span>
          </div>
        </div>
      </div>

      {/* 4. Perfect Bonus */}
      <div
        ref={perfectRef}
        className={`p-3.5 rounded-xl flex flex-col gap-2 transition-all ${
          highlightSection === 'perfect' ? 'ring-2 ring-[var(--ma-brand)] bg-[var(--ma-surface-hover)]' : ''
        }`}
        style={{
          background: 'var(--ma-surface)',
          border: '1px solid var(--ma-border-subtle)',
        }}
      >
        <h3 className="font-bold text-[14px] text-[var(--ma-fg)]">
          {m.perfectBonusTitle}
        </h3>
        <p className="text-[12px] text-[var(--ma-fg-muted)]">
          {m.perfectBonusDesc}
        </p>
        <div className="flex flex-col gap-1.5 text-[12px]">
          <div className="rounded-lg bg-[var(--ma-surface-raised)] p-2.5 font-semibold text-[var(--ma-success)] border border-[var(--ma-border)]">
            {m.perfectBonusYes}
          </div>
          <div className="rounded-lg bg-[var(--ma-surface-raised)] p-2.5 text-[var(--ma-fg-muted)] border border-[var(--ma-border-subtle)]">
            {m.perfectBonusNo}
          </div>
        </div>
      </div>

      {/* 5. Completion Multiplier */}
      <div
        ref={completionRef}
        className={`p-3.5 rounded-xl flex flex-col gap-2 transition-all ${
          highlightSection === 'completion' ? 'ring-2 ring-[var(--ma-brand)] bg-[var(--ma-surface-hover)]' : ''
        }`}
        style={{
          background: 'var(--ma-surface)',
          border: '1px solid var(--ma-border-subtle)',
        }}
      >
        <h3 className="font-bold text-[14px] text-[var(--ma-fg)]">
          {m.completionTitle}
        </h3>
        <p className="text-[12px] text-[var(--ma-fg-muted)]">
          {m.completionDesc}
        </p>
        <div className="flex flex-col gap-1.5 text-[12px]">
          <div className="rounded-lg bg-[var(--ma-surface-raised)] p-2.5 font-semibold text-[var(--ma-fg)] border border-[var(--ma-border)]">
            {m.completionFull}
          </div>
          <div className="rounded-lg bg-[var(--ma-surface-raised)] p-2.5 text-[var(--ma-fg-subtle)] border border-[var(--ma-border-subtle)]">
            {m.completionPartial}
          </div>
        </div>
      </div>

      {/* 6. Elo Rating System */}
      <div
        ref={eloRef}
        className={`p-3.5 rounded-xl flex flex-col gap-2 transition-all ${
          highlightSection === 'elo' ? 'ring-2 ring-[var(--ma-brand)] bg-[var(--ma-surface-hover)]' : ''
        }`}
        style={{
          background: 'var(--ma-surface)',
          border: '1px solid var(--ma-border-subtle)',
        }}
      >
        <h3 className="font-bold text-[14px] text-[var(--ma-fg)] flex items-center gap-1.5">
          <span>🏆</span> {m.eloTitle}
        </h3>
        <p className="text-[12px] text-[var(--ma-fg-muted)]">
          {m.eloDesc}
        </p>
        <div className="rounded-lg bg-[var(--ma-surface-raised)] p-2.5 font-mono text-[12px] font-bold text-center text-[var(--ma-brand)] border border-[var(--ma-border)]">
          {m.eloFormula}
        </div>
        <p className="text-[12px] font-semibold text-[var(--ma-fg)] mt-1">
          {m.eloKFactorsTitle}
        </p>
        <div className="flex flex-col gap-1 text-[12px] text-[var(--ma-fg-muted)]">
          <div className="rounded-md bg-[var(--ma-surface-raised)] px-2.5 py-1.5 border border-[var(--ma-border-subtle)]">
            {m.eloKUnder1200}
          </div>
          <div className="rounded-md bg-[var(--ma-surface-raised)] px-2.5 py-1.5 border border-[var(--ma-border-subtle)]">
            {m.eloK1200to1599}
          </div>
          <div className="rounded-md bg-[var(--ma-surface-raised)] px-2.5 py-1.5 border border-[var(--ma-border-subtle)]">
            {m.eloK1600to1999}
          </div>
          <div className="rounded-md bg-[var(--ma-surface-raised)] px-2.5 py-1.5 border border-[var(--ma-border-subtle)]">
            {m.eloKAbove2000}
          </div>
        </div>
        <p className="text-[11px] text-[var(--ma-fg-subtle)] italic mt-1">
          {m.eloFloorNote}
        </p>
      </div>
    </InfoModalShell>
  )
}
