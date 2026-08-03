import { EmptyStateCard } from '@/components/ui/card'
import { useTranslation } from '@/i18n/useTranslation'
import type { BoardType, Category } from '@/services/leaderboard/leaderboard.interface'
import { CATEGORIES } from '@/services/leaderboard/leaderboard.mock'

function IconMedalEmpty() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="14" r="7" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
      <path d="M8 3l2 4h4l2-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.4" />
    </svg>
  )
}

export function EmptyState({ boardType, category }: { boardType: BoardType; category: Category }) {
  const { t } = useTranslation()
  const catLabel = CATEGORIES.find((c) => c.id === category)?.label ?? category
  return (
    <EmptyStateCard
      wrapper="plain"
      wrapperClassName="flex flex-col items-center px-6 py-12 text-center"
      gapClassName="gap-3"
      icon={<IconMedalEmpty />}
      iconColor="var(--ma-fg-subtle)"
      iconWrapperStyle={{
        height: '3.5rem',
        width: '3.5rem',
        borderRadius: 'var(--radius-2xl)',
        background: 'var(--ma-surface-raised)',
      }}
      title={t.leaderboard.noEntriesTitle}
      descriptionClassName="max-w-[18rem] text-[13px] leading-relaxed"
      description={
        boardType === 'friends'
          ? t.leaderboard.noEntriesFriends
          : t.leaderboard.noEntriesGeneric(catLabel)
      }
      textGroupClassName="flex flex-col gap-3"
    />
  )
}
