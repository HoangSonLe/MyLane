import { IconChevronLeft } from '@/components/ui/icons'
import { useTranslation } from '@/i18n/useTranslation'

export function RoomHeader({
  skeleton,
  onBack,
}: {
  skeleton?: boolean
  onBack?: () => void
}) {
  const { t } = useTranslation()
  return (
    <header className="grid grid-cols-[auto_1fr_auto] items-center gap-2 px-4 pb-2 pt-6">
      <div className="flex shrink-0 items-center">
        {skeleton ? (
          <div
            className="skeleton"
            style={{ height: '2rem', width: '5.5rem', borderRadius: 'var(--radius-xl)' }}
          />
        ) : (
          <button
            type="button"
            onClick={onBack}
            aria-label={t.versusRoom.backToLobbyAria}
            className={[
              'flex shrink-0 items-center gap-1.5 px-2.5 py-1.5 min-[380px]:px-3',
              'text-[13px] font-medium',
              'transition-colors duration-[var(--ma-duration-micro)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
            ].join(' ')}
            style={{
              borderRadius: 'var(--radius-xl)',
              background: 'var(--ma-surface-raised)',
              border: '1px solid var(--ma-border)',
              color: 'var(--ma-fg-muted)',
            }}
          >
            <IconChevronLeft />
            <span className="hidden min-[380px]:inline whitespace-nowrap">{t.versusRoom.lobbyLabel}</span>
          </button>
        )}
      </div>

      <div className="flex min-w-0 items-center justify-center">
        {skeleton ? (
          <div
            className="skeleton justify-self-center"
            style={{ height: '1.375rem', width: '6rem', borderRadius: 'var(--radius-sm)' }}
          />
        ) : (
          <h1 className="min-w-0 text-center text-[17px] font-bold whitespace-nowrap truncate" style={{ color: 'var(--ma-fg)' }}>
            {t.versusRoom.title}
          </h1>
        )}
      </div>

      <div className="w-8 shrink-0" aria-hidden="true" />
    </header>
  )
}
