import { Card, StatCell } from '@/components/ui/card'
import { useTranslation } from '@/i18n/useTranslation'

export function StatRow({
  level,
  streak,
  elo,
  bestLevel,
}: {
  level: number
  streak: number
  elo: number
  /** Player's highest level reached in this game before today (docs/gameplay/README.md "Per-account data").
   *  `undefined` hides the cell entirely — guest, offline, or still loading (same "don't show stale numbers"
   *  rule as GameCard's stats). `null` means the fetch succeeded but there's no record yet — shown as "—",
   *  same as GameCard does for `bestScore`/`highestLevel`. */
  bestLevel?: number | null
}) {
  const { t } = useTranslation()
  const items = [
    { label: t.statRow.level, value: String(level) },
    { label: t.statRow.streak, value: `${streak}x` },
    { label: t.statRow.elo, value: String(elo) },
    ...(bestLevel !== undefined ? [{ label: t.statRow.best, value: bestLevel === null ? '—' : String(bestLevel) }] : []),
  ]
  return (
    <Card className="flex items-center justify-around py-2.5" shadow="sm">
      {items.map((item) => (
        <StatCell
          key={item.label}
          className="flex flex-col items-center gap-0.5"
          label={item.label}
          labelClassName="text-[10px] font-medium uppercase tracking-widest"
          value={item.value}
          valueClassName="text-[16px] font-bold tabular-nums"
        />
      ))}
    </Card>
  )
}
