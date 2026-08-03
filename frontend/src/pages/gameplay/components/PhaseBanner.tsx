import type { Phase } from '@/components/ui/gameplay'
import { useTranslation } from '@/i18n/useTranslation'

/**
 * `gameType` was dropped from the original props — it was declared but
 * never read in the render body (dead), found while extracting this
 * component to its own file.
 */
export function PhaseBanner({ phase, seconds, max }: { phase: Phase; seconds?: number; max?: number }) {
  const { t } = useTranslation()
  const config: Record<Phase, { label: string; sub: string; color: string; bg: string }> = {
    idle:      { label: t.phaseBanner.idleLabel,      sub: t.phaseBanner.idleSub,      color: 'var(--ma-fg)',      bg: 'var(--ma-surface)' },
    viewing:   { label: t.phaseBanner.viewingLabel,   sub: t.phaseBanner.viewingSub,   color: 'var(--ma-progress)',bg: 'oklch(0.68 0.12 200 / 0.10)' },
    answering: { label: t.phaseBanner.answeringLabel, sub: t.phaseBanner.answeringSub, color: 'var(--ma-brand)',   bg: 'oklch(0.76 0.14 74 / 0.10)' },
    correct:   { label: t.phaseBanner.correctLabel,   sub: t.phaseBanner.correctSub,   color: 'var(--ma-success)', bg: 'oklch(0.70 0.15 145 / 0.10)' },
    // No special red treatment here anymore — WrongToast (a center-screen
    // popup) is now the sole "you got it wrong" signal, so this stays
    // neutral like idle/paused instead of duplicating it.
    wrong:     { label: t.phaseBanner.roundOver,      sub: '',                        color: 'var(--ma-fg-muted)',bg: 'var(--ma-surface)' },
    paused:    { label: t.phaseBanner.paused,         sub: '',                        color: 'var(--ma-fg-muted)',bg: 'var(--ma-surface)' },
    complete:  { label: t.phaseBanner.roundOver,      sub: '',                        color: 'var(--ma-fg-muted)',bg: 'var(--ma-surface)' },
  }
  const { label, sub, color, bg } = config[phase]
  // Countdown replaces the static "ANSWERING" text once seconds is passed,
  // turning danger-red in the last 3s — same threshold CountdownRing used.
  const isLowTime = phase === 'answering' && seconds !== undefined && seconds <= 3
  const badgeColor = isLowTime ? 'var(--ma-danger)' : color

  // Border-trace countdown: a conic-gradient ring masked down to just the
  // card's border area, so it follows the exact rounded-2xl shape at any
  // width instead of a separate bar element (no SVG, no size measuring).
  const ringActive = phase === 'answering' && seconds !== undefined && !!max
  const ringPct = ringActive ? Math.max(0, Math.min(1, seconds! / max!)) : 0
  const ringColor = isLowTime ? 'var(--ma-danger)' : 'var(--ma-progress)'

  return (
    <div
      className="relative rounded-2xl"
      style={{ border: '1px solid var(--ma-border)' }}
    >
      {ringActive && (
        <div
          className="phase-ring pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            padding: '2px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            // @property-registered custom prop (see index.css .phase-ring) —
            // lets the ring sweep smoothly between ticks instead of jumping.
            ...({ '--ring-pct': ringPct, '--ring-color': ringColor } as React.CSSProperties),
          }}
          aria-hidden="true"
        />
      )}
      <div
        className="flex items-center justify-between rounded-2xl px-4 py-3"
        style={{ background: bg }}
        aria-live="polite"
        aria-atomic="true"
      >
        <div>
          <p className="text-[15px] font-bold leading-tight" style={{ color }}>{label}</p>
          {sub && <p className="mt-0.5 text-[12px]" style={{ color: 'var(--ma-fg-muted)' }}>{sub}</p>}
        </div>
        {(phase === 'viewing' || phase === 'answering') && (
          <div
            className="rounded-xl px-3 py-1 text-[11px] font-semibold tabular-nums"
            style={{
              background: phase === 'viewing' ? 'oklch(0.68 0.12 200 / 0.18)' : 'oklch(0.76 0.14 74 / 0.18)',
              color: badgeColor,
              border: `1px solid ${badgeColor}40`,
              transition: 'color 0.3s, border-color 0.3s',
            }}
          >
            {phase === 'viewing' ? t.phaseBanner.viewingBadge : seconds !== undefined ? `${seconds}s` : t.phaseBanner.answeringBadge}
          </div>
        )}
      </div>
    </div>
  )
}
