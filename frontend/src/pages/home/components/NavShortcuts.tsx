import { IconUser, IconTrophy20 as IconTrophy } from '@/components/ui/icons'
import { ShortcutGrid } from '@/components/ui/grid'
import { IconUsers, IconSettings } from './icons'

interface NavShortcut {
  id: string
  label: string
  icon: React.ReactNode
  disabled?: boolean
  disabledHint?: string
}

interface NavShortcutsProps {
  skeleton?: boolean
  offline?: boolean
  onNavigate?: (id: string) => void
}

export function NavShortcuts({ skeleton, offline, onNavigate }: NavShortcutsProps) {
  const shortcuts: NavShortcut[] = [
    {
      id: 'lobby',
      label: 'Lobby',
      icon: <IconUsers />,
      disabled: offline,
      disabledHint: offline ? 'Needs connection' : undefined,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <IconUser />,
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      icon: <IconTrophy />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <IconSettings />,
    },
  ]

  return (
    <ShortcutGrid
      items={shortcuts}
      columns={4}
      onSelect={onNavigate}
      skeleton={skeleton}
    />
  )
}
