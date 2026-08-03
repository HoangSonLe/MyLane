import { IconSwords } from '@/components/ui/icons'
import { Card } from '@/components/ui/card'
import { useTranslation } from '@/i18n/useTranslation'

interface QuickJoinCardProps {
  skeleton?: boolean
  isJoining?: boolean
  onQuickJoin?: () => void
}

export function QuickJoinCard({ skeleton, isJoining, onQuickJoin }: QuickJoinCardProps) {
  const { t } = useTranslation()

  if (skeleton) {
    return (
      <Card className="mx-4" padding="1rem">
        <div className="skeleton h-12 w-full rounded-2xl" />
      </Card>
    )
  }

  return (
    <Card className="mx-4 flex flex-col gap-3" border="subtle" padding="1rem">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: 'var(--ma-brand)', color: 'var(--ma-brand-fg)' }}
        >
          <IconSwords />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <h3 className="text-[14px] font-bold" style={{ color: 'var(--ma-fg)' }}>
            {t.lobby.quickJoinTitle}
          </h3>
          <p className="text-[12px] leading-snug" style={{ color: 'var(--ma-fg-muted)' }}>
            {t.lobby.quickJoinDesc}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onQuickJoin}
        disabled={isJoining}
        className={[
          'flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-semibold leading-none',
          'transition-all duration-[var(--ma-duration-micro)] active:scale-[0.98]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
          isJoining ? 'opacity-60 cursor-wait' : '',
        ].join(' ')}
        style={{
          background: 'var(--ma-brand)',
          color: 'var(--ma-brand-fg)',
          boxShadow: 'var(--ma-shadow-sm)',
        }}
      >
        <IconSwords />
        <span>{isJoining ? '...' : t.lobby.quickJoinBtn}</span>
      </button>
    </Card>
  )
}
