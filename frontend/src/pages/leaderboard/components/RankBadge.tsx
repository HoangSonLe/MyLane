export function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center"
        style={{
          borderRadius: 'var(--radius-lg)',
          background: 'oklch(0.78 0.16 65 / 0.18)',
        }}
        aria-label="1st place"
      >
        <span className="text-[13px] font-bold" style={{ color: 'var(--ma-warning)' }}>1</span>
      </div>
    )
  }
  if (rank === 2) {
    return (
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center"
        style={{
          borderRadius: 'var(--radius-lg)',
          background: 'oklch(0.72 0.01 260 / 0.22)',
        }}
        aria-label="2nd place"
      >
        <span className="text-[13px] font-bold" style={{ color: 'oklch(0.78 0.01 260)' }}>2</span>
      </div>
    )
  }
  if (rank === 3) {
    return (
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center"
        style={{
          borderRadius: 'var(--radius-lg)',
          background: 'oklch(0.68 0.09 42 / 0.20)',
        }}
        aria-label="3rd place"
      >
        <span className="text-[13px] font-bold" style={{ color: 'oklch(0.72 0.12 42)' }}>3</span>
      </div>
    )
  }
  return (
    <div
      className="flex h-7 w-7 shrink-0 items-center justify-center"
      aria-label={`Rank ${rank}`}
    >
      <span className="text-[13px] font-semibold tabular-nums" style={{ color: 'var(--ma-fg-subtle)' }}>
        {rank}
      </span>
    </div>
  )
}
