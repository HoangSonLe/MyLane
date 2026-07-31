import { IconSpinner } from './icons'

export function LoadingSkeleton({ message }: { message: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-2xl"
        style={{ background: 'var(--ma-surface)' }}
      >
        <IconSpinner />
      </div>
      <div>
        <p className="text-[16px] font-bold" style={{ color: 'var(--ma-fg)' }}>{message}</p>
        <p className="mt-1 text-[13px]" style={{ color: 'var(--ma-fg-muted)' }}>
          This only takes a moment
        </p>
      </div>
    </div>
  )
}
