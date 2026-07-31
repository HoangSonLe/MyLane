import { IconPlay } from '@/components/ui/icons'

interface PlayCtaProps {
  skeleton?: boolean
  hasLastPlayed: boolean
  onPlay?: () => void
}

export function PlayCta({ skeleton, hasLastPlayed, onPlay }: PlayCtaProps) {
  if (skeleton) {
    return (
      <div
        className="skeleton mx-4"
        style={{ height: '3.5rem', borderRadius: 'var(--radius-2xl)' }}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={onPlay}
      className={[
        'mx-4 flex h-14 w-[calc(100%-2rem)] items-center justify-center gap-2.5',
        'text-[15px] font-semibold',
        'transition-transform duration-[var(--ma-duration-micro)] active:scale-[0.97]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
      ].join(' ')}
      style={{
        borderRadius: 'var(--radius-2xl)',
        background: 'var(--ma-brand)',
        color: 'var(--ma-brand-fg)',
        boxShadow: '0 4px 24px oklch(0.78 0.16 75 / 0.28)',
      }}
    >
      <span style={{ color: 'var(--ma-brand-fg)' }}>
        <IconPlay />
      </span>
      {hasLastPlayed ? 'Play Again' : 'Play Now'}
    </button>
  )
}
