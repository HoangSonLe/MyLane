import { useTranslation } from '@/i18n/useTranslation'

export function SeedBadge({ seed }: { seed: string }) {
  const { t } = useTranslation()
  return (
    <div
      className="flex items-center gap-2 rounded-xl px-3 py-1.5"
      style={{
        background: 'var(--ma-surface)',
        border: '1px solid var(--ma-border)',
      }}
      aria-label={t.versusGameplay.sharedSeedAria(seed)}
    >
      <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: 'var(--ma-fg-subtle)' }}>
        {t.versusGameplay.seedLabel}
      </span>
      <span className="text-[12px] font-bold tabular-nums" style={{ color: 'var(--ma-fg-muted)' }}>
        {seed}
      </span>
    </div>
  )
}
