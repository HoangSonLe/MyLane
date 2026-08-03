import {
  IconPlusCircle,
  IconCategoryNumber,
  IconCategoryAlphabet,
  IconCategoryGrid,
  IconCategorySequence,
  IconCategoryColor,
  IconDiffEasy,
  IconDiffMedium,
  IconDiffHard,
  IconDiffSuperHard,
  IconTrophy16,
  IconTarget16,
} from '@/components/ui/icons'
import { IconCheck, IconLoader } from './icons'
import { SectionLabel } from '@/components/ui/SectionLabel'

import { DifficultyId, type GameCategoryId, type RoomMode } from '@/services/versus-room/versus-room.interface'
import { GAME_CATEGORIES } from '@/services/versus-room/versus-room.mock'
import { useTranslation } from '@/i18n/useTranslation'
import type { ComponentType } from 'react'

const CATEGORY_SVG_ICONS: Record<string, ComponentType<{ width?: number; height?: number }>> = {
  number: IconCategoryNumber,
  alphabet: IconCategoryAlphabet,
  grid: IconCategoryGrid,
  sequence: IconCategorySequence,
  color: IconCategoryColor,
}

export function CreateRoomForm({
  skeleton,
  selectedCategory,
  selectedMode,
  selectedDifficulty = DifficultyId.MEDIUM,
  roomName,
  isPrivate = false,
  isCreating,
  onSelectCategory,
  onSelectMode,
  onSelectDifficulty,
  onRoomNameChange,
  onTogglePrivacy,
  onCreate,
}: {
  skeleton?: boolean
  selectedCategory: GameCategoryId | null
  selectedMode: RoomMode
  selectedDifficulty?: DifficultyId
  roomName: string
  isPrivate?: boolean
  isCreating: boolean
  onSelectCategory: (id: GameCategoryId) => void
  onSelectMode: (mode: RoomMode) => void
  onSelectDifficulty?: (diff: DifficultyId) => void
  onRoomNameChange: (v: string) => void
  onTogglePrivacy?: (v: boolean) => void
  onCreate: () => void
}) {
  const { t } = useTranslation()

  if (skeleton) {
    return (
      <div className="flex flex-col gap-3 mx-4">
        <div className="skeleton" style={{ height: '1rem', width: '5rem', borderRadius: 'var(--radius-sm)' }} />
        <div className="skeleton" style={{ height: '8rem', borderRadius: 'var(--radius-2xl)' }} />
        <div className="skeleton" style={{ height: '1rem', width: '4rem', borderRadius: 'var(--radius-sm)' }} />
        <div className="skeleton" style={{ height: '3rem', borderRadius: 'var(--radius-2xl)' }} />
        <div className="skeleton" style={{ height: '1rem', width: '6rem', borderRadius: 'var(--radius-sm)' }} />
        <div className="skeleton" style={{ height: '2.75rem', borderRadius: 'var(--radius-2xl)' }} />
      </div>
    )
  }

  const DIFFICULTY_ITEMS = [
    { id: DifficultyId.EASY, label: t.challenge?.easy || 'Dễ', icon: IconDiffEasy, color: 'var(--ma-success)' },
    { id: DifficultyId.MEDIUM, label: t.challenge?.medium || 'Trung Bình', icon: IconDiffMedium, color: 'var(--ma-brand)' },
    { id: DifficultyId.HARD, label: t.challenge?.hard || 'Khó', icon: IconDiffHard, color: 'var(--ma-danger)' },
    { id: DifficultyId.SUPER_HARD, label: t.challenge?.superHard || 'Siêu Khó', icon: IconDiffSuperHard, color: '#f59e0b' },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Game category */}
      <div className="flex flex-col gap-2">
        <SectionLabel label={t.versusRoom.gameCategoryLabel} />
        <div className="flex flex-col gap-2 px-4">
          {GAME_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id
            const CatIcon = CATEGORY_SVG_ICONS[cat.id] || IconCategoryNumber
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                aria-pressed={isSelected}
                aria-label={`${cat.label} — ${cat.description}${isSelected ? t.gameSelect.selectedSuffix : ''}`}
                className={[
                  'flex w-full items-center gap-3 text-left',
                  'transition-all duration-[var(--ma-duration-micro)] active:scale-[0.98]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
                ].join(' ')}
                style={{
                  borderRadius: 'var(--radius-2xl)',
                  background: isSelected ? 'var(--ma-active-soft)' : 'var(--ma-surface)',
                  border: `1px solid ${isSelected ? 'var(--ma-active)' : 'var(--ma-border)'}`,
                  padding: '0.875rem 1rem',
                }}
              >
                {/* Selection indicator */}
                <span
                  className="shrink-0 flex items-center justify-center"
                  style={{
                    height: '1.25rem',
                    width: '1.25rem',
                    borderRadius: '50%',
                    border: `2px solid ${isSelected ? 'var(--ma-active)' : 'var(--ma-border)'}`,
                    background: isSelected ? 'var(--ma-active)' : 'transparent',
                    transition: 'all var(--ma-duration-micro)',
                    color: '#fff',
                  }}
                  aria-hidden="true"
                >
                  {isSelected && <IconCheck />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold leading-snug flex items-center gap-2" style={{ color: 'var(--ma-fg)' }}>
                    <span style={{ color: isSelected ? 'var(--ma-active)' : 'var(--ma-fg-subtle)' }}>
                      <CatIcon width={16} height={16} />
                    </span>
                    <span>{cat.label}</span>
                  </p>
                  <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--ma-fg-muted)' }}>
                    {cat.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Difficulty selector */}
      <div className="flex flex-col gap-2">
        <SectionLabel label={t.challenge?.difficultyLabel || 'Chọn Độ Khó Thách Đấu'} />
        <div className="grid grid-cols-2 gap-2 px-4">
          {DIFFICULTY_ITEMS.map((diff) => {
            const isSelected = selectedDifficulty === diff.id
            const DiffIcon = diff.icon
            return (
              <button
                key={diff.id}
                type="button"
                onClick={() => onSelectDifficulty?.(diff.id as DifficultyId)}
                aria-pressed={isSelected}
                className={[
                  'flex items-center justify-center gap-1.5 px-2 py-2.5 text-center',
                  'text-[12px] font-semibold',
                  'transition-all duration-[var(--ma-duration-micro)] active:scale-95',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
                ].join(' ')}
                style={{
                  borderRadius: 'var(--radius-xl)',
                  background: isSelected ? 'var(--ma-active-soft)' : 'var(--ma-surface)',
                  border: `1.5px solid ${isSelected ? 'var(--ma-active)' : 'var(--ma-border)'}`,
                  color: isSelected ? 'var(--ma-active)' : 'var(--ma-fg)',
                }}
              >
                <span style={{ color: diff.color }}>
                  <DiffIcon width={14} height={14} />
                </span>
                <span>{diff.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Mode selection */}
      <div className="flex flex-col gap-2">
        <SectionLabel label={t.versusRoom.modeLabel} />
        <div className="flex flex-col gap-2 px-4">
          {[
            {
              id: 'versus-ranked' as RoomMode,
              label: t.challenge?.rankedMode || '🏆 Đấu Xếp Hạng (+/- Elo)',
              desc: 'Cộng / trừ điểm Elo theo kết quả trận đấu',
            },
            {
              id: 'versus-unranked' as RoomMode,
              label: t.challenge?.unrankedMode || '🎯 Đấu Thường (Luyện tập)',
              desc: 'Thi đấu giải trí không ảnh hưởng xếp hạng',
            },
          ].map((mode) => {
            const isSelected = selectedMode === mode.id
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onSelectMode(mode.id)}
                aria-pressed={isSelected}
                className="flex w-full items-center gap-3 text-left p-3.5 transition-all active:scale-[0.98]"
                style={{
                  borderRadius: 'var(--radius-2xl)',
                  background: isSelected ? 'var(--ma-active-soft)' : 'var(--ma-surface)',
                  border: `1px solid ${isSelected ? 'var(--ma-active)' : 'var(--ma-border)'}`,
                }}
              >
                <span
                  className="shrink-0 flex items-center justify-center h-5 w-5 rounded-full transition-all"
                  style={{
                    border: `2px solid ${isSelected ? 'var(--ma-active)' : 'var(--ma-border)'}`,
                    background: isSelected ? 'var(--ma-active)' : 'transparent',
                    color: '#fff',
                  }}
                >
                  {isSelected && <IconCheck />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-[var(--ma-fg)]">{mode.label}</p>
                  <p className="text-[11px] text-[var(--ma-fg-muted)] mt-0.5">{mode.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Room Name input */}
      <div className="flex flex-col gap-2">
        <SectionLabel label={t.versusRoom.roomName} />
        <div className="px-4">
          <input
            type="text"
            value={roomName}
            onChange={(e) => onRoomNameChange(e.target.value)}
            placeholder={t.versusRoom.roomNamePlaceholder}
            maxLength={32}
            className="w-full text-[13px] font-semibold p-3 outline-none transition-all"
            style={{
              borderRadius: 'var(--radius-xl)',
              background: 'var(--ma-surface)',
              border: '1px solid var(--ma-border)',
              color: 'var(--ma-fg)',
            }}
          />
        </div>
      </div>

      {/* Toggle Privacy */}
      {onTogglePrivacy && (
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-[var(--ma-fg)]">{t.versusRoom.privateRoom}</span>
            <span className="text-[11px] text-[var(--ma-fg-subtle)]">{t.versusRoom.privateDesc}</span>
          </div>
          <button
            type="button"
            onClick={() => onTogglePrivacy(!isPrivate)}
            className="relative h-6 w-11 rounded-full transition-colors"
            style={{ background: isPrivate ? 'var(--ma-brand)' : 'var(--ma-surface-raised)' }}
          >
            <span
              className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform"
              style={{ transform: isPrivate ? 'translateX(20px)' : 'translateX(0)' }}
            />
          </button>
        </div>
      )}

      {/* Submit button */}
      <div className="px-4 pt-1">
        <button
          type="button"
          disabled={isCreating || !selectedCategory}
          onClick={onCreate}
          className="flex w-full items-center justify-center gap-2 text-[14px] font-bold text-white py-3.5 transition-all active:scale-[0.98] disabled:opacity-50"
          style={{
            borderRadius: 'var(--radius-2xl)',
            background: 'var(--ma-brand)',
            boxShadow: 'var(--ma-shadow-md)',
          }}
        >
          {isCreating ? (
            <>
              <IconLoader />
              <span>{t.versusRoom.creating}</span>
            </>
          ) : (
            <>
              <IconPlusCircle />
              <span>{t.versusRoom.createRoomBtn}</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
