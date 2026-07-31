import { Card } from '@/components/ui/card'

export function SkeletonCard() {
  return (
    <Card className="w-full max-w-xs" shadow="md" padding="1.5rem">
      {/* Header */}
      <div className="mb-6 flex flex-col items-center gap-2">
        <div className="skeleton" style={{ height: '1.5rem', width: '8rem', borderRadius: 'var(--radius-sm)' }} />
        <div className="skeleton" style={{ height: '1rem', width: '11rem', borderRadius: 'var(--radius-sm)' }} />
      </div>
      {/* OAuth buttons */}
      <div className="flex flex-col gap-3">
        <div className="skeleton" style={{ height: '3rem', width: '100%', borderRadius: 'var(--radius-2xl)' }} />
        <div className="skeleton" style={{ height: '3rem', width: '100%', borderRadius: 'var(--radius-2xl)' }} />
      </div>
      {/* Divider */}
      <div className="my-5 flex items-center gap-3">
        <div className="skeleton h-px flex-1" style={{ borderRadius: 0 }} />
        <div className="skeleton" style={{ height: '1rem', width: '1.5rem', borderRadius: 'var(--radius-sm)' }} />
        <div className="skeleton h-px flex-1" style={{ borderRadius: 0 }} />
      </div>
      {/* Form fields */}
      <div className="flex flex-col gap-3">
        <div className="skeleton" style={{ height: '3rem', width: '100%', borderRadius: 'var(--radius-xl)' }} />
        <div className="skeleton" style={{ height: '3rem', width: '100%', borderRadius: 'var(--radius-xl)' }} />
        <div className="skeleton" style={{ height: '3rem', width: '100%', borderRadius: 'var(--radius-2xl)' }} />
      </div>
    </Card>
  )
}
