import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface MergeDialogProps {
  visible: boolean
  onMerge: () => void
  onSkip: () => void
}

export function MergeDialog({ visible, onMerge, onSkip }: MergeDialogProps) {
  if (!visible) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8 sm:items-center"
      style={{ background: 'oklch(0 0 0 / 0.60)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="merge-title"
    >
      <Card className="w-full max-w-xs" shadow="lg" padding="1.5rem">
        {/* Icon */}
        <div
          className="mx-auto mb-4 flex items-center justify-center"
          style={{
            height: '3rem',
            width: '3rem',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--ma-brand-soft)',
          }}
          aria-hidden="true"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--ma-brand)' }}>
            <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <h2
          id="merge-title"
          className="mb-1 text-center text-[17px] font-bold leading-snug"
          style={{ color: 'var(--ma-fg)' }}
        >
          Merge guest progress?
        </h2>
        <p
          className="mb-6 text-center text-[13px] leading-relaxed"
          style={{ color: 'var(--ma-fg-muted)' }}
        >
          Your local best scores and level will be compared with this account&apos;s — the higher value is kept.
        </p>

        <div className="flex flex-col gap-3">
          <Button
            variant="brand"
            size="app-12"
            onClick={onMerge}
            className="w-full transition-transform duration-[var(--ma-duration-micro)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
          >
            Merge progress
          </Button>
          <Button
            variant="surface"
            size="app-12"
            onClick={onSkip}
            className="w-full transition-transform duration-[var(--ma-duration-micro)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
          >
            Start fresh
          </Button>
        </div>
      </Card>
    </div>
  )
}
