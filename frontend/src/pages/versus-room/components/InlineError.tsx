import { IconAlertCircle } from '@/components/ui/icons'

import type { ErrorKind } from '@/services/versus-room/versus-room.interface'
import { useTranslation } from '@/i18n/useTranslation'

export function InlineError({
  kind,
  onDismiss,
}: {
  kind: ErrorKind
  onDismiss?: () => void
}) {
  const { t } = useTranslation()
  const messages: Record<ErrorKind, string> = {
    connection: t.versusRoom.errorConnection,
    'invalid-code': t.versusRoom.errorInvalidCode,
    'room-full': t.versusRoom.errorRoomFull,
    'room-expired': t.versusRoom.errorRoomExpired,
  }
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="mx-4 flex items-start gap-3"
      style={{
        borderRadius: 'var(--radius-2xl)',
        background: 'oklch(0.62 0.19 22 / 0.10)',
        border: '1px solid oklch(0.62 0.19 22 / 0.20)',
        padding: '0.875rem 1rem',
      }}
    >
      <span className="mt-0.5 shrink-0" style={{ color: 'var(--ma-danger)' }} aria-hidden="true">
        <IconAlertCircle />
      </span>
      <div className="flex-1">
        <p className="text-[13px] font-medium leading-snug" style={{ color: 'var(--ma-danger)' }}>
          {messages[kind]}
        </p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={t.versusRoom.dismissErrorAria}
          className="shrink-0 text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)] focus-visible:rounded"
          style={{ color: 'var(--ma-danger)' }}
        >
          {t.versusRoom.dismissError}
        </button>
      )}
    </div>
  )
}
