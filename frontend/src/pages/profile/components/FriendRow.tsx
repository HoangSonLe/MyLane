import { Avatar } from '@/components/ui/Avatar'

import type { Friend } from '@/services/lobby/lobby.interface'
import { useTranslation } from '@/i18n/useTranslation'

interface Props {
  friend: Friend
  onSelect?: (friend: Friend) => void
}

export function FriendRow({ friend, onSelect }: Props) {
  const { t } = useTranslation()
  const statusBg =
    friend.status === 'online'
      ? 'var(--ma-success)'
      : friend.status === 'in-game'
      ? 'var(--ma-warning)'
      : 'var(--ma-fg-subtle)'

  const statusLabel =
    friend.status === 'online'
      ? t.profile.statusOnline
      : friend.status === 'in-game'
      ? t.profile.statusInGame
      : t.profile.statusOffline

  return (
    <div
      onClick={() => onSelect?.(friend)}
      className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-opacity hover:opacity-80 active:opacity-60"
      title="Bấm để xem thông tin bạn bè"
    >
      {/* Avatar */}
      <Avatar name={friend.name} imageUrl={friend.avatarUrl} size="2.25rem" fontSize="12px">
        <span
          className="absolute bottom-0 right-0 translate-x-0.5 translate-y-0.5"
          style={{
            height: '9px',
            width: '9px',
            borderRadius: '50%',
            background: statusBg,
            border: '2px solid var(--ma-bg)',
          }}
          aria-label={statusLabel}
        />
      </Avatar>

      {/* Name + handle */}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[13px] font-semibold hover:underline" style={{ color: 'var(--ma-fg)' }}>
          {friend.name}
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[11px] truncate" style={{ color: 'var(--ma-fg-subtle)' }}>
            @{friend.handle}
          </span>
          <span style={{ color: 'var(--ma-border)', fontSize: '10px' }} aria-hidden="true">·</span>
          <span className="text-[11px] font-semibold tabular-nums" style={{ color: 'var(--ma-progress)' }}>
            {friend.elo}
          </span>
        </div>
      </div>

      {/* Status label */}
      <span
        className="shrink-0 text-[11px] font-semibold"
        style={{
          color:
            friend.status === 'online'
              ? 'var(--ma-success)'
              : friend.status === 'in-game'
              ? 'var(--ma-warning)'
              : 'var(--ma-fg-subtle)',
        }}
      >
        {statusLabel}
      </span>
    </div>
  )
}
