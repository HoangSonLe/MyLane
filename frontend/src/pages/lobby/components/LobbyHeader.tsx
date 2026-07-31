import { ScreenHeaderWithBack, ScreenHeaderAction } from '@/components/ui/layout'
import { IconUserPlus } from './icons'

interface LobbyHeaderProps {
  skeleton?: boolean
  onBack?: () => void
  onInvite?: () => void
}

export function LobbyHeader({ skeleton, onBack, onInvite }: LobbyHeaderProps) {
  return (
    <ScreenHeaderWithBack
      skeleton={skeleton}
      onBack={onBack}
      title="Lobby"
      trailing={
        <ScreenHeaderAction
          skeleton={skeleton}
          onClick={onInvite}
          ariaLabel="Invite a friend"
          icon={<IconUserPlus />}
        />
      }
    />
  )
}
