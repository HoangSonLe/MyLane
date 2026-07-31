function IconStar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

export function ScoreBadge({ score, best }: { score: number; best: number }) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl bg-[var(--ma-surface)] px-4 py-2.5"
      style={{ boxShadow: 'var(--ma-shadow-sm)' }}
    >
      <div className="text-center">
        <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--ma-fg-subtle)]">Score</p>
        <p className="text-[17px] font-bold leading-none text-[var(--ma-fg)]">{score}</p>
      </div>
      <div className="h-6 w-px bg-[var(--ma-border)]" aria-hidden="true" />
      <div className="text-center">
        <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--ma-fg-subtle)]">Best</p>
        <div className="flex items-center gap-1">
          <span className="text-[var(--ma-fg-muted)]"><IconStar /></span>
          <p className="text-[17px] font-bold leading-none text-[var(--ma-fg)]">{best}</p>
        </div>
      </div>
    </div>
  )
}
