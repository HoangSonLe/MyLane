import { IconUser, IconTrophy20 as IconTrophy, IconSettings } from '@/components/ui/icons'
import { ShortcutGrid } from '@/components/ui/grid'
import { IconUsers } from './icons'
import { useTranslation } from '@/i18n/useTranslation'

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
  const { t } = useTranslation()
  const shortcuts: NavShortcut[] = [
    {
      id: 'lobby',
      label: t.home.navLobby,
      icon: <IconUsers />,
      disabled: offline,
      disabledHint: offline ? t.home.needsConnection : undefined,
    },
    {
      id: 'profile',
      label: t.home.navProfile,
      icon: <IconUser />,
    },
    {
      id: 'leaderboard',
      label: t.home.navLeaderboard,
      icon: <IconTrophy />,
    },
    {
      id: 'settings',
      label: t.home.navSettings,
      icon: <IconSettings width={20} height={20} />,
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
