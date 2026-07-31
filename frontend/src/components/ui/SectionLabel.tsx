/**
 * SectionLabel — extracted from 5 byte-identical inline definitions
 * (GameSelectScreen, HomeScreen, LobbyScreen, ProfileScreen, ResultScreen).
 */
export function SectionLabel({ label }: { label: string }) {
  return (
    <p
      className="px-4 text-[11px] font-semibold uppercase tracking-widest"
      style={{ color: 'var(--ma-fg-subtle)' }}
    >
      {label}
    </p>
  )
}
