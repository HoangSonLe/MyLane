import { IconPlay } from '@/components/ui/icons'
import { EmptyStateCard } from '@/components/ui/card'
import { useTranslation } from '@/i18n/useTranslation'

export function EmptyPrompt() {
  const { t } = useTranslation()
  return (
    <EmptyStateCard
      wrapperClassName="mx-4 flex flex-col items-center py-4 text-center"
      gapClassName="gap-2"
      cardBorder="subtle"
      cardPadding="1.5rem 1rem"
      icon={<IconPlay />}
      iconColor="var(--ma-brand)"
      iconWrapperStyle={{
        height: '2.75rem',
        width: '2.75rem',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--ma-brand-soft)',
      }}
      title={t.home.emptyTitle}
      description={t.home.emptyDesc}
      textGroupClassName="flex flex-col gap-2"
    />
  )
}
