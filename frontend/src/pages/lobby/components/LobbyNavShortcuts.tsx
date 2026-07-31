import { IconUser, IconTrophy20 as IconTrophy } from '@/components/ui/icons'
import { ShortcutGrid } from '@/components/ui/grid'
import { IconSettings } from './icons'

interface NavShortcut {
  id: string
  label: string
  icon: React.ReactNode
}

interface LobbyNavShortcutsProps {
  skeleton?: boolean
  onNavigate?: (id: string) => void
}

export function LobbyNavShortcuts({ skeleton, onNavigate }: LobbyNavShortcutsProps) {
  const shortcuts: NavShortcut[] = [
    { id: 'profile',     label: 'Profile',     icon: <IconUser /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <IconTrophy /> },
    { id: 'settings',    label: 'Settings',    icon: <IconSettings /> },
  ]

  return (
    <ShortcutGrid
      items={shortcuts}
      columns={3}
      onSelect={onNavigate}
      skeleton={skeleton}
      skeletonLabelWidth="3.5rem"
    />
  )
}
