export function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Step ${current} of ${total}`} role="img">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={[
            'rounded-full transition-all duration-[var(--ma-duration-base)]',
            i < current
              ? 'h-2 w-2 bg-[var(--ma-progress)]'
              : i === current
              ? 'h-2 w-5 bg-[var(--ma-progress)]'
              : 'h-2 w-2 bg-[var(--ma-surface-raised)]',
          ].join(' ')}
        />
      ))}
    </div>
  )
}
