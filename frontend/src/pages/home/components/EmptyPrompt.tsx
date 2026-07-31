import { IconPlay } from '@/components/ui/icons'
import { EmptyStateCard } from '@/components/ui/card'

export function EmptyPrompt() {
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
      title="Your first session awaits"
      description="Hit Play Now to start training your memory."
      textGroupClassName="flex flex-col gap-2"
    />
  )
}
