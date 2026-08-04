import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/card'
import { useTranslation } from '@/i18n/useTranslation'

interface EloContextBadgeProps {
  skeleton?: boolean
  elo: number
  name: string
  avatarUrl?: string
}

export function EloContextBadge({ skeleton, elo, name, avatarUrl }: EloContextBadgeProps) {
  const { t } = useTranslation()
  if (skeleton) {
    return (
      <div
        className="skeleton mx-4"
        style={{ height: '3.25rem', borderRadius: 'var(--radius-2xl)' }}
      />
    )
  }

  return (
    <Card className="mx-4 flex items-center justify-between" padding="0.75rem 1rem">
      <div className="flex items-center gap-2.5">
        {/* Avatar */}
        <Avatar name={name} imageUrl={avatarUrl} size="2.5rem" fontSize="14px" />
        <div>
          <p className="text-[13px] font-semibold leading-none" style={{ color: 'var(--ma-fg)' }}>
            {name}
          </p>
          <p className="mt-0.5 text-[11px]" style={{ color: 'var(--ma-fg-muted)' }}>
            {t.lobby.versusRanked}
          </p>
        </div>
      </div>
      {/* Elo */}
      <div className="flex flex-col items-end">
        <span
          className="text-[16px] font-bold tabular-nums leading-none"
          style={{ color: 'var(--ma-progress)' }}
        >
          {elo}
        </span>
        <span
          className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--ma-fg-subtle)' }}
        >
          Elo
        </span>
      </div>
    </Card>
  )
}
