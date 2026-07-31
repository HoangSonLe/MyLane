import type { Phase } from '@/components/ui/gameplay'

export function RoundBanner({ phase, round }: { phase: Phase; round: number }) {
  const cfg: Record<Phase, { label: string; sub: string; color: string; bg: string }> = {
    idle:     { label: 'Get ready',      sub: `Round ${round} starts shortly`,       color: 'var(--ma-fg)',       bg: 'var(--ma-surface)' },
    viewing:  { label: 'Watch',          sub: 'Memorise the pattern',                color: 'var(--ma-progress)', bg: 'oklch(0.68 0.12 200 / 0.10)' },
    answering:{ label: 'Answer',         sub: 'Reproduce what you saw — fast',       color: 'var(--ma-brand)',     bg: 'oklch(0.76 0.14 74 / 0.10)' },
    correct:  { label: 'Correct!',       sub: 'Waiting for opponent…',               color: 'var(--ma-success)',   bg: 'oklch(0.70 0.15 145 / 0.10)' },
    wrong:    { label: 'Wrong',          sub: 'Opponent still answering…',            color: 'var(--ma-danger)',    bg: 'oklch(0.62 0.19 22 / 0.10)' },
    complete: { label: 'Round over',     sub: 'Loading next round…',                 color: 'var(--ma-fg-muted)', bg: 'var(--ma-surface)' },
    paused:   { label: 'Paused',         sub: '',                                    color: 'var(--ma-fg-muted)', bg: 'var(--ma-surface)' },
  }
  const { label, sub, color, bg } = cfg[phase]
  return (
    <div
      className="flex items-center justify-between rounded-2xl px-4 py-3"
      style={{ background: bg, border: '1px solid var(--ma-border)' }}
      aria-live="polite"
      aria-atomic="true"
    >
      <div>
        <p className="text-[15px] font-bold leading-tight" style={{ color }}>{label}</p>
        {sub && <p className="mt-0.5 text-[12px]" style={{ color: 'var(--ma-fg-muted)' }}>{sub}</p>}
      </div>
      {(phase === 'viewing' || phase === 'answering') && (
        <div
          className="rounded-xl px-3 py-1 text-[11px] font-semibold"
          style={{
            background: phase === 'viewing' ? 'oklch(0.68 0.12 200 / 0.18)' : 'oklch(0.76 0.14 74 / 0.18)',
            color,
            border: `1px solid ${color}40`,
          }}
        >
          {phase === 'viewing' ? 'VIEWING' : 'ANSWERING'}
        </div>
      )}
    </div>
  )
}
