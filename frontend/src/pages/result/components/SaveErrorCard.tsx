import { StatusBanner } from '@/components/ui/StatusBanner'
import { useTranslation } from '@/i18n/useTranslation'

export function SaveErrorCard({ onRetry }: { onRetry?: () => void }) {
  const { t } = useTranslation()
  return (
    <StatusBanner
      variant="error"
      message={t.result.saveErrorMessage}
      onRetry={onRetry}
    />
  )
}
