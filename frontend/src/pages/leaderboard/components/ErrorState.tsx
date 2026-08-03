import { IconAlertCircle } from '@/components/ui/icons'
import { ErrorStateCard } from '@/components/ui/card'
import { useTranslation } from '@/i18n/useTranslation'

function IconRefreshCcw() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 12a9 9 0 109-9 9 9 0 00-9 9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M3 3v6h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  const { t } = useTranslation()
  return (
    <ErrorStateCard
      wrapper="plain"
      wrapperClassName="flex flex-col items-center px-6 py-12 text-center"
      gapClassName="gap-4"
      icon={<IconAlertCircle />}
      iconColor="var(--ma-danger)"
      iconWrapperStyle={{
        height: '3.5rem',
        width: '3.5rem',
        borderRadius: 'var(--radius-2xl)',
        background: 'oklch(0.62 0.19 22 / 0.12)',
      }}
      title={t.leaderboard.errorTitle}
      descriptionClassName="text-[13px]"
      description={t.leaderboard.errorDesc}
      action={
        <button
          type="button"
          onClick={onRetry}
          className={[
            'flex items-center gap-2 px-4 py-2',
            'text-[13px] font-semibold',
            'transition-transform duration-[var(--ma-duration-micro)] active:scale-95',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
          ].join(' ')}
          style={{
            borderRadius: 'var(--radius-xl)',
            background: 'var(--ma-surface-raised)',
            border: '1px solid var(--ma-border)',
            color: 'var(--ma-fg-muted)',
          }}
        >
          <IconRefreshCcw />
          {t.common.retry}
        </button>
      }
    />
  )
}
