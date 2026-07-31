import { ErrorStateCard } from '@/components/ui/card'

function IconRefresh() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M23 4v6h-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorStateCard
      wrapper="plain"
      wrapperClassName="flex flex-1 flex-col items-center justify-center px-8 text-center"
      gapClassName="gap-6"
      icon={
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="var(--ma-danger)" strokeWidth="1.5" />
          <path d="M12 7v5M12 16v.5" stroke="var(--ma-danger)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      }
      iconWrapperClassName="flex h-20 w-20 items-center justify-center rounded-2xl"
      iconWrapperStyle={{ background: 'oklch(0.62 0.19 22 / 0.12)', boxShadow: 'var(--ma-shadow-md)' }}
      titleTag="h2"
      titleClassName="text-[17px] font-bold"
      title="Something went wrong"
      descriptionClassName="mt-1 text-[13px] leading-relaxed"
      description="Failed to load the game. Check your connection and try again."
      textGroupClassName=""
      action={
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-2 rounded-2xl bg-[var(--ma-surface-raised)] px-8 py-4 text-[15px] font-semibold text-[var(--ma-fg)] transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
        >
          <IconRefresh />
          Try again
        </button>
      }
    />
  )
}
