import { Card } from '@/components/ui/card'

import type { ResultData } from '@/services/result/result.interface'
import { useTranslation } from '@/i18n/useTranslation'

export function BestComparison({ data }: { data: ResultData }) {
  const { t } = useTranslation()
  if (data.previousBestScore === null && data.previousBestLevel === null) return null

  const scoreImproved = data.previousBestScore !== null && data.score > data.previousBestScore
  const levelImproved = data.previousBestLevel !== null && data.levelReached > data.previousBestLevel

  return (
    <div className="mx-4 flex flex-col gap-0">
      <Card className="overflow-hidden" shadow="sm">
        <div
          className="px-4 py-3"
          style={{ borderBottom: '1px solid var(--ma-border-subtle)' }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ma-fg-subtle)' }}>
            {t.result.personalBest}
          </p>
        </div>

        <div className="flex">
          {/* Score */}
          {data.previousBestScore !== null && (
            <div
              className="flex flex-1 flex-col items-center gap-1 py-4"
              style={{
                borderRight: data.previousBestLevel !== null ? '1px solid var(--ma-border-subtle)' : undefined,
              }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ma-fg-subtle)' }}>
                {t.result.scoreCol}
              </p>
              <p className="text-[11px]" style={{ color: 'var(--ma-fg-subtle)' }}>
                {t.result.was} {data.previousBestScore.toLocaleString()}
              </p>
              <p
                className="text-[20px] font-bold tabular-nums"
                style={{ color: scoreImproved ? 'var(--ma-success)' : 'var(--ma-fg)' }}
              >
                {data.score.toLocaleString()}
              </p>
              {scoreImproved && (
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: 'var(--ma-success)' }}
                >
                  +{(data.score - data.previousBestScore).toLocaleString()}
                </span>
              )}
            </div>
          )}

          {/* Level */}
          {data.previousBestLevel !== null && (
            <div className="flex flex-1 flex-col items-center gap-1 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ma-fg-subtle)' }}>
                {t.result.levelCol}
              </p>
              <p className="text-[11px]" style={{ color: 'var(--ma-fg-subtle)' }}>
                {t.result.was} {data.previousBestLevel}
              </p>
              <p
                className="text-[20px] font-bold tabular-nums"
                style={{ color: levelImproved ? 'var(--ma-success)' : 'var(--ma-fg)' }}
              >
                {data.levelReached}
              </p>
              {levelImproved && (
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: 'var(--ma-success)' }}
                >
                  +{data.levelReached - data.previousBestLevel}
                </span>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
