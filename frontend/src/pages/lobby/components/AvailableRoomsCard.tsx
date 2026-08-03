import { useState } from 'react'
import { IconUser } from '@/components/ui/icons'
import { Card } from '@/components/ui/card'
import { SectionLabel } from '@/components/ui/SectionLabel'
import type { PublicRoomSummary } from '@/services/versus-room/versus-room.interface'
import { useTranslation } from '@/i18n/useTranslation'

interface AvailableRoomsCardProps {
  rooms: PublicRoomSummary[]
  skeleton?: boolean
  isLoading?: boolean
  onRefresh?: () => void
  onJoinRoom?: (code: string) => void
  onSelectRoom?: (room: PublicRoomSummary) => void
}

function IconGlobe() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}

function IconRefreshLocal() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M23 4v6h-6M1 20v-6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconChevronDown({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-transform duration-200"
      style={{
        color: 'var(--ma-fg-subtle)',
        transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
      }}
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export function AvailableRoomsCard({
  rooms = [],
  skeleton,
  isLoading,
  onRefresh,
  onJoinRoom,
  onSelectRoom,
}: AvailableRoomsCardProps) {
  const { t } = useTranslation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  if (skeleton) {
    return (
      <div className="flex flex-col gap-3">
        <div className="skeleton mx-4 h-3 w-28 rounded-md" />
        <Card className="mx-4" padding="1rem">
          <div className="skeleton h-10 w-full rounded-xl" />
        </Card>
      </div>
    )
  }

  const safeRooms = Array.isArray(rooms) ? rooms : []

  return (
    <div className="flex flex-col gap-3 transition-all">
      <div
        className="flex items-center justify-between px-4 cursor-pointer select-none"
        onClick={() => setIsCollapsed((prev) => !prev)}
      >
        <div className="flex items-center gap-2">
          <SectionLabel label={t.lobby.availableRoomsTitle} />
          <IconChevronDown isCollapsed={isCollapsed} />
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRefresh?.()
          }}
          disabled={isLoading}
          className="flex items-center gap-1.5 text-[12px] font-medium transition-opacity hover:opacity-75 active:opacity-50"
          style={{ color: 'var(--ma-brand)' }}
        >
          <span className={isLoading ? 'animate-spin' : ''}>
            <IconRefreshLocal />
          </span>
          {t.lobby.refreshRooms}
        </button>
      </div>

      {!isCollapsed && (
        safeRooms.length === 0 ? (
          <Card className="mx-4 text-center" padding="1.25rem 1rem" border="subtle">
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--ma-fg-muted)' }}>
              {t.lobby.noAvailableRooms}
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5 px-4">
            {safeRooms.map((room) => (
              <Card
                key={room.code}
                className="flex items-center justify-between gap-3 cursor-pointer transition-transform active:scale-[0.99]"
                padding="0.875rem 1rem"
                border="subtle"
                onClick={() => onSelectRoom?.(room)}
              >
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold truncate" style={{ color: 'var(--ma-fg)' }}>
                      {room.roomName || room.code}
                    </span>
                    <span
                      className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{
                        background: room.isPrivate ? 'oklch(0.65 0.15 20 / 0.12)' : 'oklch(0.55 0.12 140 / 0.12)',
                        color: room.isPrivate ? 'oklch(0.70 0.18 20)' : 'oklch(0.65 0.15 140)',
                      }}
                    >
                      {room.isPrivate ? (
                        <>🔒 {t.versusRoom.privateRoom}</>
                      ) : (
                        <><IconGlobe /> {t.versusRoom.publicRoom}</>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[12px]" style={{ color: 'var(--ma-fg-muted)' }}>
                    <span className="flex items-center gap-1">
                      <IconUser />
                      {room.hostName} ({room.hostElo})
                    </span>
                    <span>·</span>
                    <span className="font-medium text-[var(--ma-fg-subtle)]">
                      {room.playerCount}/{room.maxPlayers}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onJoinRoom?.(room.code)
                  }}
                  className="shrink-0 rounded-xl px-3.5 py-1.5 text-[12px] font-semibold transition-transform active:scale-95"
                  style={{
                    background: 'var(--ma-surface-raised)',
                    border: '1px solid var(--ma-border)',
                    color: 'var(--ma-fg)',
                  }}
                >
                  {t.lobby.joinRoomBtn}
                </button>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  )
}
