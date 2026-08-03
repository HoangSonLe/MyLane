import { IconUser } from '@/components/ui/icons'
import { useTranslation } from '@/i18n/useTranslation'

interface HostLeaveModalProps {
  show: boolean
  hasOpponent: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function HostLeaveModal({
  show,
  hasOpponent,
  onConfirm,
  onCancel,
}: HostLeaveModalProps) {
  const { t } = useTranslation()

  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'oklch(0 0 0 / 0.55)' }}
      role="dialog"
      aria-modal="true"
      onPointerDown={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div
        className="flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl px-6 py-6 text-center shadow-lg"
        style={{
          background: 'var(--ma-surface)',
          border: '1px solid var(--ma-border)',
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{
            background: 'oklch(0.62 0.19 22 / 0.10)',
            color: 'var(--ma-danger)',
          }}
        >
          <IconUser />
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-[16px] font-bold" style={{ color: 'var(--ma-fg)' }}>
            {t.versusRoom.leaveHostModalTitle}
          </h3>
          <p className="text-[13px] leading-relaxed" style={{ color: 'var(--ma-fg-muted)' }}>
            {hasOpponent
              ? t.versusRoom.leaveHostModalDesc
              : t.versusRoom.errorRoomExpired}
          </p>
        </div>

        <div className="mt-2 flex w-full gap-2.5">
          <button
            type="button"
            onClick={onConfirm}
            className="flex flex-1 items-center justify-center rounded-xl py-2.5 text-[13px] font-semibold transition-transform active:scale-95"
            style={{
              background: 'oklch(0.62 0.19 22 / 0.10)',
              border: '1px solid oklch(0.62 0.19 22 / 0.25)',
              color: 'var(--ma-danger)',
            }}
          >
            {t.versusRoom.confirmLeaveHost}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="flex flex-1 items-center justify-center rounded-xl py-2.5 text-[13px] font-semibold transition-transform active:scale-95"
            style={{
              background: 'var(--ma-surface-raised)',
              border: '1px solid var(--ma-border)',
              color: 'var(--ma-fg)',
            }}
          >
            {t.versusRoom.cancelLeaveHost}
          </button>
        </div>
      </div>
    </div>
  )
}
