import { SegmentedControl } from '@/components/ui/controls'
import type { BoardType } from '@/services/leaderboard/leaderboard.interface'
import { BOARD_TABS } from '@/services/leaderboard/leaderboard.mock'
import { useTranslation } from '@/i18n/useTranslation'

export function BoardTabs({
  active,
  onChange,
  skeleton,
}: {
  active: BoardType
  onChange: (b: BoardType) => void
  skeleton?: boolean
}) {
  const { t } = useTranslation()
  const options = BOARD_TABS.map((tab) => ({
    id: tab.id,
    label: tab.short,
  }))

  return (
    <SegmentedControl
      options={options}
      value={active}
      onChange={onChange}
      ariaLabel={t.leaderboard.boardTypeAria}
      skeleton={skeleton}
    />
  )
}
