import { StatusBanner } from '@/components/ui/StatusBanner'

export function SaveErrorCard({ onRetry }: { onRetry?: () => void }) {
  return (
    <StatusBanner
      variant="error"
      message="We couldn't save your score. Your result is safe — tap Retry to try again."
      onRetry={onRetry}
    />
  )
}
