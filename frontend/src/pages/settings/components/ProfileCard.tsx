// ProfileCard — intentionally keeps XP/Level/progress bar per owner decision.
// Known Design Bible violation (01-design-philosophy / 11-screen-guidelines):
// "Settings is config-only, never mix gameplay stats." Kept by explicit owner request.

interface ProfileCardProps {
  skeleton?: boolean
}

export function ProfileCard({ skeleton }: ProfileCardProps) {
  return (
    <div
      className="overflow-hidden rounded-2xl bg-[var(--ma-surface)]"
      style={{ boxShadow: 'var(--ma-shadow-sm)' }}
    >
      {/* Top band — subtle diagonal line texture */}
      <div
        className="h-14 w-full"
        style={{
          background: `repeating-linear-gradient(
            60deg,
            oklch(0.21 0.013 260) 0px,
            oklch(0.21 0.013 260) 1px,
            oklch(0.19 0.012 260) 1px,
            oklch(0.19 0.012 260) 13px
          )`,
        }}
        aria-hidden="true"
      />

      <div className="px-4 pb-4 pt-0">
        {/* Avatar overlapping the band */}
        <div className="-mt-7 mb-3 flex items-end justify-between">
          <div className="relative">
            <div
              className={[
                'h-14 w-14 rounded-2xl ring-2 ring-[var(--ma-surface)]',
                skeleton ? 'skeleton' : 'bg-[var(--ma-surface-raised)]',
              ].join(' ')}
            >
              {!skeleton && (
                <div className="flex h-full w-full items-center justify-center text-xl font-bold text-[var(--ma-fg-muted)]">
                  N
                </div>
              )}
            </div>
            {!skeleton && (
              <span
                className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--ma-surface)] bg-[var(--ma-success)]"
                aria-hidden="true"
              />
            )}
          </div>

          {/* XP badge */}
          {!skeleton && (
            <div className="flex items-center gap-1.5 rounded-xl bg-[var(--ma-surface-raised)] px-3 py-1.5">
              <span className="text-[11px] font-medium text-[var(--ma-fg-muted)]">XP</span>
              <span className="text-[13px] font-semibold text-[var(--ma-fg)]">4,820</span>
            </div>
          )}
        </div>

        {/* Name + level */}
        {skeleton ? (
          <>
            <div className="skeleton mb-1.5 h-4 w-28 rounded" />
            <div className="skeleton h-3 w-36 rounded" />
          </>
        ) : (
          <>
            <p className="text-[15px] font-semibold text-[var(--ma-fg)]">Nguyen Viet</p>
            <p className="mt-0.5 text-[12px] text-[var(--ma-fg-muted)]">Level 12 · Memory Master</p>
          </>
        )}

        {/* XP progress bar */}
        {!skeleton && (
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[11px] text-[var(--ma-fg-subtle)]">Next level</span>
              <span className="text-[11px] font-medium text-[var(--ma-fg-muted)]">4,820 / 5,500</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--ma-surface-raised)]">
              <div
                className="h-full rounded-full bg-[var(--ma-progress)]"
                style={{ width: '87.6%' }}
                role="progressbar"
                aria-valuenow={4820}
                aria-valuemin={0}
                aria-valuemax={5500}
                aria-label="XP progress"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
