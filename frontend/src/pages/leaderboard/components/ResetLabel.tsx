import type { BoardType } from '@/services/leaderboard/leaderboard.interface'
import { useTranslation } from '@/i18n/useTranslation'

export function ResetLabel({ boardType }: { boardType: BoardType }) {
  const { t } = useTranslation()
  const labels: Partial<Record<BoardType, string>> = {
    weekly: t.leaderboard.resetWeekly,
    monthly: t.leaderboard.resetMonthly,
  }
  const text = labels[boardType]
  if (!text) return null
  return (
    <p
      className="px-4 py-2 text-[11px] text-center"
      style={{ color: 'var(--ma-fg-subtle)' }}
    >
      {text}
    </p>
  )
}
