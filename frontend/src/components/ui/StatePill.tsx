/**
 * StatePill — dev-only prototype state switcher, extracted from 7
 * structurally-identical inline definitions (LoginScreen, GameSelectScreen,
 * HomeScreen, LandingScreen, LeaderboardScreen, LobbyScreen, ProfileScreen).
 * Each screen had its own copy differing only in the `states` list and the
 * fixed bottom offset — both are now props, passed identically to what each
 * screen already had, so rendered output is unchanged.
 *
 * GameplayScreen and ResultScreen keep their own local StatePill: Gameplay's
 * differs in position/color tokens, Result's has an extra "versus" toggle —
 * both are genuine variants, not duplicates.
 */
export function StatePill<T extends string>({
  current,
  onChange,
  states,
  position = 'bottom-[72px]',
}: {
  current: T
  onChange: (s: T) => void
  states: readonly T[]
  position?: string
}) {
  return (
    <div
      aria-label="State switcher — prototype only"
      className={`fixed ${position} left-1/2 z-50 -translate-x-1/2`}
    >
      <div
        className="flex gap-1 rounded-2xl p-1"
        style={{
          background: 'var(--ma-surface)',
          boxShadow: 'var(--ma-shadow-md)',
          border: '1px solid var(--ma-border)',
        }}
      >
        {states.map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={[
              'rounded-xl px-2.5 py-1 text-[11px] font-semibold',
              'transition-colors duration-[var(--ma-duration-micro)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
              current === s
                ? 'bg-[var(--ma-brand)] text-[var(--ma-brand-fg)]'
                : 'text-[var(--ma-fg-subtle)] hover:text-[var(--ma-fg-muted)]',
            ].join(' ')}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
