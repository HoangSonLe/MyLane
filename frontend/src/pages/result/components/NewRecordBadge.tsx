import type { ResultData } from '@/services/result/result.interface'

function IconStar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

export function NewRecordBadge({ data }: { data: ResultData }) {
  if (!data.isNewRecord) return null

  const beatScore =
    data.previousBestScore !== null && data.score > data.previousBestScore
  const beatLevel =
    data.previousBestLevel !== null && data.levelReached > data.previousBestLevel

  const lines: string[] = []
  if (beatScore && data.previousBestScore !== null)
    lines.push(`Score: ${data.previousBestScore.toLocaleString()} → ${data.score.toLocaleString()}`)
  if (beatLevel && data.previousBestLevel !== null)
    lines.push(`Level: ${data.previousBestLevel} → ${data.levelReached}`)

  return (
    <div
      className="mx-4 flex items-center gap-3 px-4 py-3.5"
      style={{
        borderRadius: 'var(--radius-2xl)',
        background: 'oklch(0.76 0.14 74 / 0.10)',
        border: '1px solid oklch(0.76 0.14 74 / 0.30)',
        boxShadow: '0 0 0 0 transparent',
      }}
      role="status"
      aria-label="New personal record"
    >
      <div
        className="shrink-0 flex items-center justify-center"
        style={{
          height: '2.25rem',
          width: '2.25rem',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--ma-brand)',
        }}
        aria-hidden="true"
      >
        <span style={{ color: 'var(--ma-brand-fg)' }}>
          <IconStar />
        </span>
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-[13px] font-bold" style={{ color: 'var(--ma-brand)' }}>
          New Personal Record
        </p>
        {lines.map((line) => (
          <p key={line} className="text-[12px]" style={{ color: 'var(--ma-fg-muted)' }}>
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}
