import { IconSwords } from '@/components/ui/icons'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/card'
import { friendStatusColor, type Friend } from '@/services/lobby/lobby.interface'
import { useTranslation } from '@/i18n/useTranslation'

// ─── Sub-components ───────────────────────────────────────────────

function EloBadge({ elo }: { elo: number }) {
  return (
    <span className="text-[11px] font-semibold tabular-nums" style={{ color: 'var(--ma-progress)' }}>
      {elo}
    </span>
  )
}

function PresenceDot({ status }: { status: Friend['status'] }) {
  return (
    <span
      aria-label={status === 'in-game' ? 'In game' : status === 'offline' ? 'Offline' : 'Online'}
      className="inline-block shrink-0"
      style={{
        height: '8px',
        width: '8px',
        borderRadius: '50%',
        background: friendStatusColor(status),
      }}
    />
  )
}

// ─── FriendRow ───────────────────────────────────────────────────

interface FriendRowProps {
  friend: Friend
  onChallenge?: (id: string) => void
  onSelect?: (friend: Friend) => void
}

export function FriendRow({ friend, onChallenge, onSelect }: FriendRowProps) {
  const { t } = useTranslation()
  return (
    <Card
      className="mx-4 flex items-center gap-3 cursor-pointer transition-transform active:scale-[0.99] hover:opacity-90"
      shadow="sm"
      padding="0.875rem 1rem"
      onClick={() => onSelect?.(friend)}
    >
      {/* Avatar */}
      <Avatar name={friend.name} imageUrl={friend.avatarUrl} size="2.5rem" fontSize="13px">
        {/* Presence dot — bottom-right corner */}
        <span
          className="absolute bottom-0 right-0 translate-x-0.5 translate-y-0.5"
          style={{
            height: '10px',
            width: '10px',
            borderRadius: '50%',
            background: friendStatusColor(friend.status),
            border: '2px solid var(--ma-bg)',
          }}
          aria-hidden="true"
        />
      </Avatar>

      {/* Name + handle */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2">
          <span className="truncate text-[14px] font-semibold" style={{ color: 'var(--ma-fg)' }}>
            {friend.name}
          </span>
          <PresenceDot status={friend.status} />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[12px] truncate" style={{ color: 'var(--ma-fg-subtle)' }}>
            @{friend.handle}
          </span>
          <span style={{ color: 'var(--ma-border)', fontSize: '10px' }} aria-hidden="true">·</span>
          <EloBadge elo={friend.elo} />
        </div>
      </div>

      {/* Challenge button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onChallenge?.(friend.id)
        }}
        disabled={friend.status === 'in-game'}
        aria-label={
          friend.status === 'in-game'
            ? `${friend.name} is in a game`
            : `Challenge ${friend.name}`
        }
        className={[
          'shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5',
          'text-[12px] font-semibold leading-none',
          'transition-all duration-[var(--ma-duration-micro)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
          friend.status === 'in-game'
            ? 'cursor-not-allowed opacity-40'
            : 'active:scale-95',
        ].join(' ')}
        style={{
          borderRadius: 'var(--radius-xl)',
          background: 'var(--ma-surface-raised)',
          border: '1px solid var(--ma-border)',
          color: 'var(--ma-fg-muted)',
        }}
      >
        <IconSwords />
        <span>{friend.status === 'in-game' ? t.lobby.inGame : t.lobby.challenge}</span>
      </button>
    </Card>
  )
}

// ─── FriendRowSkeleton ────────────────────────────────────────────

export function FriendRowSkeleton() {
  return (
    <Card className="mx-4 flex items-center gap-3" padding="0.875rem 1rem">
      <div
        className="skeleton shrink-0"
        style={{ height: '2.5rem', width: '2.5rem', borderRadius: 'var(--radius-xl)' }}
      />
      <div className="flex flex-1 flex-col gap-2">
        <div className="skeleton" style={{ height: '0.875rem', width: '8rem', borderRadius: 'var(--radius-sm)' }} />
        <div className="skeleton" style={{ height: '0.75rem', width: '5rem', borderRadius: 'var(--radius-sm)' }} />
      </div>
      <div
        className="skeleton shrink-0"
        style={{ height: '2rem', width: '5.5rem', borderRadius: 'var(--radius-xl)' }}
      />
    </Card>
  )
}
