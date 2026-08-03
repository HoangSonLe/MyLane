export function SkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-3"
          style={{
            borderTop: i > 0 ? '1px solid var(--ma-border-subtle)' : undefined,
            borderLeft: '2px solid transparent',
          }}
        >
          <div className="skeleton shrink-0" style={{ height: '1.75rem', width: '1.75rem', borderRadius: 'var(--radius-lg)' }} />
          <div className="skeleton shrink-0" style={{ height: '2.25rem', width: '2.25rem', borderRadius: 'var(--radius-lg)' }} />
          <div className="flex flex-1 flex-col gap-1.5 min-w-0">
            <div className="skeleton" style={{ height: '0.875rem', width: `${60 + (i % 3) * 12}%`, borderRadius: 'var(--radius-sm)' }} />
            <div className="skeleton" style={{ height: '0.75rem', width: '35%', borderRadius: 'var(--radius-sm)' }} />
          </div>
          <div className="skeleton shrink-0" style={{ height: '0.875rem', width: '3rem', borderRadius: 'var(--radius-sm)' }} />
        </div>
      ))}
    </>
  )
}
