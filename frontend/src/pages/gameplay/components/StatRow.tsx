import { Card } from '@/components/ui/card'

export function StatRow({ level, streak, elo }: { level: number; streak: number; elo: number }) {
  const items = [
    { label: 'Level', value: String(level) },
    { label: 'Streak', value: `${streak}x` },
    { label: 'Elo', value: String(elo) },
  ]
  return (
    <Card className="flex items-center justify-around py-2.5" shadow="sm">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: 'var(--ma-fg-subtle)' }}>
            {item.label}
          </span>
          <span className="text-[16px] font-bold tabular-nums" style={{ color: 'var(--ma-fg)' }}>
            {item.value}
          </span>
        </div>
      ))}
    </Card>
  )
}
