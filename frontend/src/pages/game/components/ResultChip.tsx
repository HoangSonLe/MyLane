import type { GamePhase } from '@/services/game/game-screen.types'

export function ResultChip({ phase }: { phase: GamePhase }) {
  if (phase !== 'success' && phase !== 'fail') return null
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden="true"
    >
      <div
        className={[
          'rounded-3xl px-6 py-3 text-lg font-bold',
          phase === 'success'
            ? 'bg-[oklch(0.72_0.16_145/0.2)] text-[var(--ma-success)]'
            : 'bg-[oklch(0.65_0.20_22/0.2)] text-[var(--ma-danger)]',
        ].join(' ')}
        style={{ backdropFilter: 'blur(8px)', border: '1px solid currentColor' }}
      >
        {phase === 'success' ? '✓ Correct!' : '✗ Wrong'}
      </div>
    </div>
  )
}
