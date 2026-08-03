import { Card } from '@/components/ui/card'
import { useTranslation } from '@/i18n/useTranslation'

function IconSpinner({ label }: { label: string }) {
  return (
    <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-label={label}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function LoadingIndicator() {
  const { t } = useTranslation()
  return (
    <Card className="mx-4 flex items-center gap-3 px-4 py-4" shadow="sm" role="status" aria-live="polite">
      <span style={{ color: 'var(--ma-fg-muted)' }}>
        <IconSpinner label={t.profile.loadingAria} />
      </span>
      <p className="text-[13px] font-medium" style={{ color: 'var(--ma-fg-muted)' }}>
        {t.profile.loadingProfile}
      </p>
    </Card>
  )
}
