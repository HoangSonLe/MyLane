import type { ResultData } from '@/services/result/result.interface'
import { useTranslation } from '@/i18n/useTranslation'

function IconStar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

export function NewRecordBadge({ data }: { data: ResultData }) {
  const { t } = useTranslation()
  if (!data.isNewRecord) return null

  const beatScore =
    data.previousBestScore !== null && data.score > data.previousBestScore
  const beatLevel =
    data.previousBestLevel !== null && data.levelReached > data.previousBestLevel

  const lines: string[] = []
  if (beatScore && data.previousBestScore !== null)
    lines.push(t.result.scoreChangeLine(data.previousBestScore.toLocaleString(), data.score.toLocaleString()))
  if (beatLevel && data.previousBestLevel !== null)
    lines.push(t.result.levelChangeLine(data.previousBestLevel, data.levelReached))

  return (
    <div
      className="mx-4 flex items-center gap-3 px-4 py-3.5 animate-in zoom-in-95 fade-in duration-300"
      style={{
        borderRadius: 'var(--radius-2xl)',
        background: 'oklch(0.76 0.16 75 / 0.14)',
        border: '1px solid oklch(0.76 0.16 75 / 0.40)',
        boxShadow: '0 4px 16px -2px oklch(0.76 0.16 75 / 0.20)',
      }}
      role="status"
      aria-label={t.result.newRecordAria}
    >
      <div
        className="shrink-0 flex items-center justify-center animate-bounce duration-1000"
        style={{
          height: '2.5rem',
          width: '2.5rem',
          borderRadius: 'var(--radius-xl)',
          background: 'oklch(0.76 0.18 75)',
          color: '#1a1000',
          boxShadow: '0 2px 8px oklch(0.76 0.18 75 / 0.4)',
        }}
        aria-hidden="true"
      >
        <IconStar />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-[14px] font-extrabold uppercase tracking-wide" style={{ color: 'oklch(0.76 0.18 75)' }}>
          🏆 {t.result.newRecord}
        </p>
        {lines.map((line) => (
          <p key={line} className="text-[12px] font-medium" style={{ color: 'var(--ma-fg)' }}>
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}
