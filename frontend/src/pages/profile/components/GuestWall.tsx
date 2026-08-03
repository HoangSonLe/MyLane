import { IconUserOff } from '@/components/ui/icons'
import { EmptyStateCard } from '@/components/ui/card'
import { useTranslation } from '@/i18n/useTranslation'

export function GuestWall({ onLogIn }: { onLogIn?: () => void }) {
  const { t } = useTranslation()
  return (
    <EmptyStateCard
      cardPadding="2.5rem 1.5rem"
      gapClassName="gap-4"
      icon={<IconUserOff />}
      iconColor="var(--ma-fg-subtle)"
      iconWrapperStyle={{
        height: '3rem',
        width: '3rem',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--ma-icon-bg)',
      }}
      titleTag="p"
      titleClassName="text-[15px] font-bold"
      title={t.profile.guestTitle}
      descriptionClassName="text-[13px] leading-relaxed"
      description={t.profile.guestDesc}
      action={
        <button
          type="button"
          onClick={onLogIn}
          className={[
            'flex h-12 w-full items-center justify-center',
            'text-[14px] font-semibold',
            'transition-transform duration-[var(--ma-duration-micro)] active:scale-[0.97]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
          ].join(' ')}
          style={{
            borderRadius: 'var(--radius-2xl)',
            background: 'var(--ma-brand)',
            color: 'var(--ma-brand-fg)',
            boxShadow: '0 4px 24px oklch(0.78 0.16 75 / 0.28)',
          }}
        >
          {t.profile.logInSignUp}
        </button>
      }
    />
  )
}
