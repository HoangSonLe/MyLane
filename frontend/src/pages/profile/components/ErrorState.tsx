import { IconAlertCircle } from '@/components/ui/icons'
import { ErrorStateCard } from '@/components/ui/card'

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorStateCard
      gapClassName="gap-4"
      cardPadding="2rem 1.5rem"
      icon={<IconAlertCircle />}
      iconColor="var(--ma-danger)"
      iconWrapperStyle={{
        height: '2.75rem',
        width: '2.75rem',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--ma-icon-bg)',
      }}
      title="Could not load profile"
      description="Something went wrong fetching your profile data. Check your connection and try again."
      action={
        <button
          type="button"
          onClick={onRetry}
          className={[
            'flex h-10 items-center justify-center px-6',
            'text-[13px] font-semibold',
            'transition-transform duration-[var(--ma-duration-micro)] active:scale-95',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
          ].join(' ')}
          style={{
            borderRadius: 'var(--radius-xl)',
            background: 'var(--ma-surface-raised)',
            border: '1px solid var(--ma-border)',
            color: 'var(--ma-fg)',
          }}
        >
          Try again
        </button>
      }
    />
  )
}
