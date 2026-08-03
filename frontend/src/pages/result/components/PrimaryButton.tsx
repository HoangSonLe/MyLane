import { IconPlay, IconSwords } from '@/components/ui/icons'
import { useTranslation } from '@/i18n/useTranslation'

export function PrimaryButton({
  onClick,
  isVersus,
}: {
  onClick?: () => void
  isVersus: boolean
}) {
  const { t } = useTranslation()
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'mx-4 flex h-14 w-[calc(100%-2rem)] items-center justify-center gap-2.5',
        'text-[15px] font-semibold',
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
      <span style={{ color: 'var(--ma-brand-fg)' }}>
        {isVersus ? <IconSwords /> : <IconPlay />}
      </span>
      {t.result.playAgain}
    </button>
  )
}
