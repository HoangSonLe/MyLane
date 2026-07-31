import type { BoardType } from '@/services/leaderboard/leaderboard.interface'

export function ResetLabel({ boardType }: { boardType: BoardType }) {
  const labels: Partial<Record<BoardType, string>> = {
    weekly: 'Resets every Monday at 00:00 UTC',
    monthly: 'Resets on the 1st of each month at 00:00 UTC',
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
