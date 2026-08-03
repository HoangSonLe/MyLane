import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { GameId } from '@/configs/enum'
import { useTranslation } from '@/i18n/useTranslation'

export function TutorialOverlay({
  gameType,
  onDone,
}: {
  gameType: GameId
  onDone: () => void
}) {
  const { t } = useTranslation()
  const steps = t.tutorial.steps[gameType]
  const [step, setStep] = useState(0)
  const isLast = step === steps.length - 1
  const stepOfLabel = t.tutorial.stepOfTemplate
    .replace('{current}', String(step + 1))
    .replace('{total}', String(steps.length))

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center"
      style={{ background: 'oklch(0 0 0 / 0.6)', backdropFilter: 'blur(6px)' }}
      role="dialog"
      aria-modal="true"
      aria-label={t.tutorial.gameTutorial}
    >
      <Card className="w-full max-w-sm mb-6 mx-4 flex flex-col gap-5 p-6" radius="3xl" shadow="lg">
        {/* Progress dots */}
        <div className="flex items-center gap-1.5" aria-label={stepOfLabel}>
          {steps.map((_, i) => (
            <span
              key={i}
              className="rounded-full transition-all duration-[var(--ma-duration-base)]"
              style={{
                height: '6px',
                width: i === step ? '20px' : '6px',
                background: i <= step ? 'var(--ma-brand)' : 'var(--ma-surface-raised)',
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div>
          <p className="text-[17px] font-bold" style={{ color: 'var(--ma-fg)' }}>
            {steps[step].heading}
          </p>
          <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: 'var(--ma-fg-muted)' }}>
            {steps[step].body}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onDone}
            className="rounded-xl px-4 py-2.5 text-[14px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
            style={{ color: 'var(--ma-fg-muted)' }}
          >
            {t.tutorial.skip}
          </button>
          <button
            type="button"
            onClick={() => isLast ? onDone() : setStep((s) => s + 1)}
            className="flex-1 rounded-2xl py-3 text-[14px] font-semibold transition-all active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
            style={{
              background: 'var(--ma-brand)',
              color: 'var(--ma-brand-fg)',
              boxShadow: 'var(--ma-shadow-sm)',
            }}
          >
            {isLast ? t.tutorial.startPlaying : t.tutorial.next}
          </button>
        </div>
      </Card>
    </div>
  )
}
