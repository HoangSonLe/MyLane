import { IconSwords } from '@/components/ui/icons'
import { Card } from '@/components/ui/card'

import { DifficultyId, type GameCategory, type RoomMode } from '@/services/versus-room/versus-room.interface'
import { useTranslation } from '@/i18n/useTranslation'
import {
  getDifficultyLabels,
  getLocalizedGameLabel,
  getModeLabels,
} from '@/services/gameplay/gameplay-screen.types'
import { ModeId } from '@/configs/enum'
import { RoomCodeBar } from './RoomCodeBar'

export function ModeSummaryCard({
  skeleton,
  mode,
  category,
  difficulty,
  isPrivate,
  code,
  link,
  showPreviewTitle = false,
}: {
  skeleton?: boolean
  mode: RoomMode
  category: GameCategory | null
  difficulty?: DifficultyId
  isPrivate?: boolean
  code?: string
  link?: string
  showPreviewTitle?: boolean
}) {
  const { t } = useTranslation()
  const difficultyLabels = getDifficultyLabels(t)
  const modeLabels = getModeLabels(t)
  if (skeleton) {
    return (
      <div
        className="skeleton mx-4"
        style={{ height: '3.5rem', borderRadius: 'var(--radius-2xl)' }}
      />
    )
  }

  const isRanked = mode === 'versus-ranked'
  const modeLabel = isRanked
    ? modeLabels[ModeId.VERSUS_RANKED]
    : modeLabels[ModeId.VERSUS_UNRANKED]
  const difficultyLabel = difficulty
    ? difficultyLabels[difficulty]
    : null

  return (
    <Card className="mx-4 flex flex-col gap-3" padding="0.875rem 1rem">
      {showPreviewTitle && (
        <p className="text-center text-[12px] font-bold" style={{ color: 'var(--ma-fg)' }}>
          {t.challenge?.previewTitle || '🎯 Xem Trước Cấu Hình Phòng:'}
        </p>
      )}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className="flex shrink-0 items-center justify-center"
            style={{
              height: '2rem',
              width: '2rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--ma-icon-bg)',
              border: '1px solid var(--ma-border)',
              color: 'var(--ma-fg-muted)',
            }}
            aria-hidden="true"
          >
            <IconSwords />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold leading-none" style={{ color: 'var(--ma-fg)' }}>
              {category ? getLocalizedGameLabel(t, category.id) : t.versusRoom.noGameSelected}
            </p>
            <p className="mt-0.5 truncate text-[11px]" style={{ color: 'var(--ma-fg-muted)' }}>
              {modeLabel}{difficultyLabel ? <> &middot; {difficultyLabel}</> : null}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className="flex items-center gap-1 whitespace-nowrap px-1.5 py-0.5 text-[10px] font-semibold"
            style={{
              borderRadius: 'var(--radius-md)',
              background: isPrivate ? 'oklch(0.65 0.15 20 / 0.12)' : 'oklch(0.55 0.12 140 / 0.12)',
              color: isPrivate ? 'oklch(0.70 0.18 20)' : 'oklch(0.65 0.15 140)',
              border: `1px solid ${isPrivate ? 'oklch(0.65 0.15 20 / 0.25)' : 'oklch(0.55 0.12 140 / 0.25)'}`,
            }}
          >
            {isPrivate ? `🔒 ${t.versusRoom.privateRoom}` : `🌐 ${t.versusRoom.publicRoom}`}
          </span>
          <span
            className="whitespace-nowrap px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{
              borderRadius: 'var(--radius-md)',
              background: isRanked ? 'var(--ma-progress-soft)' : 'var(--ma-surface-raised)',
              color: isRanked ? 'var(--ma-progress)' : 'var(--ma-fg-muted)',
              border: `1px solid ${isRanked ? 'var(--ma-progress-soft)' : 'var(--ma-border)'}`,
            }}
          >
            {isRanked ? t.versusGameplay.ranked : t.versusGameplay.unranked}
          </span>
        </div>
      </div>
      {code && link && (
        <>
          <div style={{ height: '1px', background: 'var(--ma-border-subtle)' }} aria-hidden="true" />
          <p className="text-[11px] font-semibold" style={{ color: 'var(--ma-fg-muted)' }}>
            {t.versusRoom.inviteLabel}
          </p>
          <RoomCodeBar code={code} link={link} embedded />
        </>
      )}
    </Card>
  )
}
