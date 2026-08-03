import type { Phase } from '@/components/ui/gameplay'
import { useTranslation } from '@/i18n/useTranslation'

export function RoundBanner({ phase, round, playerName }: { phase: Phase; round: number; playerName?: string }) {
  const { t } = useTranslation()
  const rb = t.versusGameplay.roundBanner
  const answerHeading = playerName ? `👉 Lượt của ${playerName}: Nhập đáp án!` : rb.answerLabel
  const cfg: Record<Phase, { label: string; sub: string; color: string; bg: string }> = {
    idle:     { label: rb.idleLabel,   sub: rb.idleSub(round),  color: 'var(--ma-fg)',       bg: 'var(--ma-surface)' },
    viewing:  { label: rb.watchLabel,  sub: rb.watchSub,        color: 'var(--ma-progress)', bg: 'oklch(0.68 0.12 200 / 0.10)' },
    answering:{ label: answerHeading,  sub: rb.answerSub,       color: 'var(--ma-brand)',     bg: 'oklch(0.76 0.14 74 / 0.10)' },
    correct:  { label: rb.correctLabel,sub: rb.correctSub,      color: 'var(--ma-success)',   bg: 'oklch(0.70 0.15 145 / 0.10)' },
    wrong:    { label: rb.wrongLabel,  sub: rb.wrongSub,        color: 'var(--ma-danger)',    bg: 'oklch(0.62 0.19 22 / 0.10)' },
    complete: { label: rb.roundOver,   sub: rb.loadingNext,     color: 'var(--ma-fg-muted)', bg: 'var(--ma-surface)' },
    paused:   { label: rb.paused,      sub: '',                 color: 'var(--ma-fg-muted)', bg: 'var(--ma-surface)' },
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
          {phase === 'viewing' ? t.phaseBanner.viewingBadge : t.phaseBanner.answeringBadge}
        </div>
      )}
    </div>
  )
}
