import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { GameId } from '@/configs/enum'

const TUTORIALS: Record<GameId, { heading: string; body: string }[]> = {
  [GameId.NUMBER]: [
    { heading: 'Watch the digits',   body: 'A sequence of numbers flashes on screen. Focus on each one.' },
    { heading: 'Type them back',     body: 'Use the keypad to enter the full sequence in the same order.' },
    { heading: 'Keep going',         body: 'Each correct round adds one more digit. How far can you get?' },
  ],
  [GameId.ALPHABET]: [
    { heading: 'Watch the letters',  body: 'A sequence of letters appears one at a time. Commit them to memory.' },
    { heading: 'Type them back',     body: 'Tap the QWERTY keyboard to reproduce the full sequence.' },
    { heading: 'Level up',           body: 'Every correct answer adds a new letter. Push your limit.' },
  ],
  [GameId.GRID]: [
    { heading: 'See the grid',       body: 'Numbered tiles light up across the grid. Remember their positions.' },
    { heading: 'Tap in order',       body: 'Tap the tiles back in ascending numeric order during your turn.' },
    { heading: 'Grow with each round', body: 'More tiles light up every level. Stay sharp.' },
  ],
  [GameId.SEQUENCE]: [
    { heading: 'Watch the flash',    body: 'Tiles light up one at a time in a specific order. Track it carefully.' },
    { heading: 'Replay the order',   body: 'Tap the same tiles in exactly the same sequence they flashed.' },
    { heading: 'Sequences grow',     body: 'Each round adds one more step. How long a sequence can you hold?' },
  ],
}

export function TutorialOverlay({
  gameType,
  onDone,
}: {
  gameType: GameId
  onDone: () => void
}) {
  const steps = TUTORIALS[gameType]
  const [step, setStep] = useState(0)
  const isLast = step === steps.length - 1

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center"
      style={{ background: 'oklch(0 0 0 / 0.6)', backdropFilter: 'blur(6px)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Game tutorial"
    >
      <Card className="w-full max-w-sm mb-6 mx-4 flex flex-col gap-5 p-6" radius="3xl" shadow="lg">
        {/* Progress dots */}
        <div className="flex items-center gap-1.5" aria-label={`Step ${step + 1} of ${steps.length}`}>
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
            Skip
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
            {isLast ? 'Start playing' : 'Next'}
          </button>
        </div>
      </Card>
    </div>
  )
}
