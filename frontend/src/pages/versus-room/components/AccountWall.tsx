import { IconLock } from '@/components/ui/icons'
import { OfflineStateCard } from '@/components/ui/card'
import { useTranslation } from '@/i18n/useTranslation'

/**
 * Shown when signed in as guest — Versus Room requires a real account
 * (docs/product/README.md: "Guest mode ... no Versus"). Not network-offline;
 * that's a separate StatusBanner in VersusRoomScreen. Was previously named
 * `OfflineWall`, which described the wrong signal.
 */
export function AccountWall({ onLogIn }: { onLogIn?: () => void }) {
  const { t } = useTranslation()
  return (
    <OfflineStateCard
      icon={<IconLock />}
      iconColor="var(--ma-fg-muted)"
      iconWrapperStyle={{
        height: '2.75rem',
        width: '2.75rem',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--ma-icon-bg)',
      }}
      title={t.versusRoom.accountWallTitle}
      description={t.versusRoom.accountWallDesc}
      action={
        <button
          type="button"
          onClick={onLogIn}
          className={[
            'flex h-11 w-full items-center justify-center',
            'text-[14px] font-semibold',
            'transition-transform duration-[var(--ma-duration-micro)] active:scale-[0.97]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
          ].join(' ')}
          style={{
            borderRadius: 'var(--radius-2xl)',
            background: 'var(--ma-brand)',
            color: 'var(--ma-brand-fg)',
          }}
        >
          {t.lobby.logInSignUp}
        </button>
      }
    />
  )
}
