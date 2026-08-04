import { IconSwords } from '@/components/ui/icons'
import { HeroSummaryCard } from '@/components/ui/card'
import type { LastPlayed } from '@/services/home/home.interface'
import { useTranslation } from '@/i18n/useTranslation'
import { getLocalizedGameLabel, getLocalizedModeLabel } from '@/services/gameplay/gameplay-screen.types'
import { GAMES, MODES } from '@/services/game-select/game-select.mock'

function IconPlayMini() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

interface ContinueCardProps {
  skeleton?: boolean
  last: LastPlayed | null
  onResume?: () => void
}

export function ContinueCard({ skeleton, last, onResume }: ContinueCardProps) {
  const { t } = useTranslation()

  if (!skeleton && !last) return null

  const pct = last ? Math.round((last.score / last.maxScore) * 100) : 0
  const gameLabel = last ? getLocalizedGameLabel(t, last.game) : ''
  const modeLabel = last ? getLocalizedModeLabel(t, last.mode) : ''
  const currentGameMeta = last ? GAMES.find((g) => g.id === last.game) : null
  const currentModeMeta = last ? MODES.find((m) => m.id === last.mode) : null

  const levelVal = last?.level ?? last?.score ?? 1
  const roundVal = last?.roundsPlayed ?? 1

  return (
    <HeroSummaryCard
      skeleton={skeleton}
      onClick={onResume}
      icon={currentGameMeta?.icon}
      subtitle={
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full animate-pulse"
            style={{ background: 'var(--ma-brand)' }}
          />
          <span>{t.home.continue}</span>
        </div>
      }
      title={gameLabel}
      detail={
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full"
            style={{
              background: 'var(--ma-brand-soft)',
              color: 'var(--ma-brand)',
              border: '1px solid var(--ma-border-subtle)',
            }}
          >
            {currentModeMeta?.versusFlow && <IconSwords className="h-3 w-3 shrink-0" />}
            {modeLabel}
          </span>
          <span className="text-[11.5px] font-medium" style={{ color: 'var(--ma-fg-muted)' }}>
            · {t.gameSelect.levelValue(levelVal)} · {t.home.round} {roundVal}
          </span>
        </div>
      }
      progressPct={pct}
      progressColor="linear-gradient(90deg, var(--ma-brand) 0%, var(--ma-progress) 100%)"
      ariaLabel={last ? `Resume ${gameLabel} — ${modeLabel}, Level ${levelVal}, Round ${roundVal}` : undefined}
      trailing={
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 rounded-md text-[11px] font-bold"
            style={{
              background: 'var(--ma-progress-soft)',
              color: 'var(--ma-progress)',
            }}
          >
            {pct}%
          </span>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-[var(--ma-duration-micro)] group-hover:scale-105 active:scale-95"
            style={{
              background: 'var(--ma-brand)',
              color: '#fff',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
            }}
          >
            <IconPlayMini />
          </div>
        </div>
      }
    />
  )
}
