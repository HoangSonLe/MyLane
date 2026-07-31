import { EmptyStateCard } from '@/components/ui/card'

function IconBrain() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9.5 2C7 2 5 4 5 6.5c0 .8.2 1.5.5 2.1C4 9.3 3 10.8 3 12.5 3 15 5 17 7.5 17H9v2.5a2.5 2.5 0 005 0V17h1.5C18 17 21 14.5 21 11.5c0-2-1.1-3.7-2.8-4.6.1-.4.3-.9.3-1.4C18.5 3.1 16.5 2 14.5 2c-1 0-1.8.4-2.5 1C11.3 2.4 10.4 2 9.5 2z"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

export function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <EmptyStateCard
      wrapper="plain"
      wrapperClassName="flex flex-1 flex-col items-center justify-center px-8 text-center"
      gapClassName="gap-6"
      icon={<IconBrain />}
      iconColor="var(--ma-fg-subtle)"
      iconWrapperClassName="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--ma-surface)]"
      iconWrapperStyle={{ boxShadow: 'var(--ma-shadow-md)' }}
      titleTag="h2"
      titleClassName="text-[17px] font-bold"
      title="No game in progress"
      descriptionClassName="mt-1 text-[13px] leading-relaxed"
      description="Start a new round to begin training your memory."
      textGroupClassName=""
      action={
        <button
          type="button"
          onClick={onStart}
          className="rounded-2xl bg-[var(--ma-brand)] px-8 py-4 text-[15px] font-semibold text-[var(--ma-brand-fg)] transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
          style={{ boxShadow: '0 4px 24px oklch(0.78 0.16 75 / 0.3)' }}
        >
          Start game
        </button>
      }
    />
  )
}
