export function CountdownRing({ seconds, max }: { seconds: number; max: number }) {
  const r = 26
  const circ = 2 * Math.PI * r
  const pct = Math.max(0, seconds / max)
  const offset = circ * (1 - pct)
  const color = seconds <= 3 ? 'var(--ma-danger)' : 'var(--ma-progress)'
  return (
    <div className="relative flex h-16 w-16 items-center justify-center" aria-label={`${seconds} seconds remaining`}>
      <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90" aria-hidden="true">
        <circle cx="32" cy="32" r={r} strokeWidth="4" fill="none" stroke="var(--ma-border)" />
        <circle
          cx="32" cy="32" r={r} strokeWidth="4" fill="none"
          stroke={color}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
        />
      </svg>
      <span
        className="absolute text-[17px] font-bold tabular-nums leading-none"
        style={{ color }}
      >
        {seconds}
      </span>
    </div>
  )
}
