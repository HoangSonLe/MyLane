import { IconPlusCircle } from '@/components/ui/icons'
import { IconCheck, IconLoader } from './icons'
import { SectionLabel } from '@/components/ui/SectionLabel'

import type { GameCategoryId, RoomMode } from '@/services/versus-room/versus-room.interface'
import { GAME_CATEGORIES } from '@/services/versus-room/versus-room.mock'

export function CreateRoomForm({
  skeleton,
  selectedCategory,
  selectedMode,
  roomName,
  isCreating,
  onSelectCategory,
  onSelectMode,
  onRoomNameChange,
  onCreate,
}: {
  skeleton?: boolean
  selectedCategory: GameCategoryId | null
  selectedMode: RoomMode
  roomName: string
  isCreating: boolean
  onSelectCategory: (id: GameCategoryId) => void
  onSelectMode: (mode: RoomMode) => void
  onRoomNameChange: (v: string) => void
  onCreate: () => void
}) {
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

  return (
    <div className="flex flex-col gap-4">
      {/* Game category */}
      <div className="flex flex-col gap-2">
        <SectionLabel label="Game" />
        <div className="flex flex-col gap-2 px-4">
          {GAME_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                aria-pressed={isSelected}
                aria-label={`${cat.label} — ${cat.description}${isSelected ? ', selected' : ''}`}
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
                  <p className="text-[13px] font-semibold leading-snug" style={{ color: 'var(--ma-fg)' }}>
                    {cat.label}
                  </p>
                  <p className="text-[11px] truncate" style={{ color: 'var(--ma-fg-muted)' }}>
                    {cat.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex flex-col gap-2">
        <SectionLabel label="Mode" />
        <div className="flex gap-2 px-4">
          {(['versus-ranked', 'versus-unranked'] as RoomMode[]).map((m) => {
            const isSelected = selectedMode === m
            const label = m === 'versus-ranked' ? 'Ranked' : 'Unranked'
            return (
              <button
                key={m}
                type="button"
                onClick={() => onSelectMode(m)}
                aria-pressed={isSelected}
                className={[
                  'flex flex-1 items-center justify-center px-2 py-2.5',
                  'text-[12px] font-semibold',
                  'transition-all duration-[var(--ma-duration-micro)] active:scale-95',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
                ].join(' ')}
                style={{
                  borderRadius: 'var(--radius-xl)',
                  background: isSelected ? 'var(--ma-active)' : 'var(--ma-surface-raised)',
                  border: `1px solid ${isSelected ? 'var(--ma-active)' : 'var(--ma-border)'}`,
                  color: isSelected ? '#fff' : 'var(--ma-fg-muted)',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Room name (optional) */}
      <div className="flex flex-col gap-2">
        <SectionLabel label="Room Name (optional)" />
        <div className="px-4">
          <input
            type="text"
            value={roomName}
            onChange={(e) => onRoomNameChange(e.target.value)}
            placeholder="e.g. Friday Warm-up"
            maxLength={32}
            aria-label="Room name"
            className={[
              'w-full bg-transparent text-[14px] font-medium outline-none',
              'placeholder:text-[var(--ma-fg-subtle)]',
              'focus:ring-2 focus:ring-[var(--ma-ring)]',
            ].join(' ')}
            style={{
              borderRadius: 'var(--radius-2xl)',
              background: 'var(--ma-surface)',
              border: '1px solid var(--ma-border)',
              color: 'var(--ma-fg)',
              padding: '0.875rem 1rem',
              transition: 'border-color var(--ma-duration-micro)',
            }}
          />
        </div>
      </div>

      {/* Create button */}
      <div className="px-4">
        <button
          type="button"
          onClick={onCreate}
          disabled={!selectedCategory || isCreating}
          className={[
            'flex h-14 w-full items-center justify-center gap-2.5',
            'text-[15px] font-semibold',
            'transition-transform duration-[var(--ma-duration-micro)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
            !selectedCategory || isCreating ? 'opacity-40 cursor-not-allowed' : 'active:scale-[0.97]',
          ].join(' ')}
          style={{
            borderRadius: 'var(--radius-2xl)',
            background: 'var(--ma-brand)',
            color: 'var(--ma-brand-fg)',
            boxShadow: !selectedCategory || isCreating ? 'none' : '0 4px 24px oklch(0.78 0.16 75 / 0.28)',
          }}
          aria-label="Create room"
        >
          {isCreating ? (
            <>
              <span style={{ color: 'var(--ma-brand-fg)' }}>
                <IconLoader />
              </span>
              Creating…
            </>
          ) : (
            <>
              <span style={{ color: 'var(--ma-brand-fg)' }}>
                <IconPlusCircle />
              </span>
              Create Room
            </>
          )}
        </button>
      </div>
    </div>
  )
}
