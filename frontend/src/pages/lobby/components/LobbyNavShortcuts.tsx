import { IconUser, IconTrophy20 as IconTrophy } from '@/components/ui/icons'
import { ShortcutGrid } from '@/components/ui/grid'
import { IconSettings } from './icons'
import { useTranslation } from '@/i18n/useTranslation'

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
  const { t } = useTranslation()
  const shortcuts: NavShortcut[] = [
    { id: 'profile',     label: t.lobby.navProfile,     icon: <IconUser /> },
    { id: 'leaderboard', label: t.lobby.navLeaderboard, icon: <IconTrophy /> },
    { id: 'settings',    label: t.lobby.navSettings,    icon: <IconSettings /> },
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
