import { IconUserOff } from '@/components/ui/icons'
import { useTranslation } from '@/i18n/useTranslation'

export function GuestNotice({ onLogIn }: { onLogIn?: () => void }) {
  const { t } = useTranslation()
  return (
    <div
      className="mx-4 flex items-center justify-between gap-3 px-4 py-3.5"
      style={{
        borderRadius: 'var(--radius-2xl)',
        background: 'oklch(0.58 0.11 230 / 0.08)',
        border: '1px solid oklch(0.58 0.11 230 / 0.25)',
      }}
      role="note"
    >
      <div className="flex items-start gap-3 min-w-0">
        <span className="mt-0.5 shrink-0" style={{ color: 'var(--ma-active)' }} aria-hidden="true">
          <IconUserOff />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-[13px] font-semibold" style={{ color: 'var(--ma-fg)' }}>
            {t.result.guestTitle}
          </p>
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--ma-fg-muted)' }}>
            {t.result.guestDesc}
          </p>
        </div>
      </div>
      {onLogIn && (
        <button
          type="button"
          onClick={onLogIn}
          className="shrink-0 rounded-xl px-3 py-1.5 text-[12px] font-semibold transition-transform duration-[var(--ma-duration-micro)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
          style={{
            background: 'var(--ma-brand)',
            color: 'var(--ma-brand-fg)',
          }}
        >
          {t.common.logIn}
        </button>
      )}
    </div>
  )
}
