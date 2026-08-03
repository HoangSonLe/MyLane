import { IconPlusCircle, IconDoorOpen } from '@/components/ui/icons'
import { CardButton } from '@/components/ui/card'
import { useTranslation } from '@/i18n/useTranslation'

interface RoomActionsProps {
  skeleton?: boolean
  onCreateRoom?: () => void
  onJoinRoom?: () => void
}

export function RoomActions({ skeleton, onCreateRoom, onJoinRoom }: RoomActionsProps) {
  const { t } = useTranslation()
  if (skeleton) {
    return (
      <div className="grid grid-cols-2 gap-2 px-4">
        <div className="skeleton" style={{ height: '3.75rem', borderRadius: 'var(--radius-2xl)' }} />
        <div className="skeleton" style={{ height: '3.75rem', borderRadius: 'var(--radius-2xl)' }} />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2 px-4">
      {/* Create room */}
      <CardButton
        onClick={onCreateRoom}
        aria-label={t.lobby.createRoomAria}
        className="flex w-full flex-col items-center justify-center gap-1.5 py-3 transition-transform duration-[var(--ma-duration-micro)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
      >
        <span style={{ color: 'var(--ma-fg-muted)' }}>
          <IconPlusCircle />
        </span>
        <span className="text-[13px] font-semibold" style={{ color: 'var(--ma-fg)' }}>
          {t.lobby.createRoom}
        </span>
      </CardButton>

      {/* Join room */}
      <CardButton
        onClick={onJoinRoom}
        aria-label={t.lobby.joinRoomAria}
        className="flex w-full flex-col items-center justify-center gap-1.5 py-3 transition-transform duration-[var(--ma-duration-micro)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
      >
        <span style={{ color: 'var(--ma-fg-muted)' }}>
          <IconDoorOpen />
        </span>
        <span className="text-[13px] font-semibold" style={{ color: 'var(--ma-fg)' }}>
          {t.lobby.joinRoom}
        </span>
      </CardButton>
    </div>
  )
}
