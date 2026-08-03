import { useState } from 'react'

import { Card, CollapsibleCard } from '@/components/ui/card'
import { useTranslation } from '@/i18n/useTranslation'
import type { ProfileData } from '@/services/profile/profile.interface'
import type { Friend } from '@/services/lobby/lobby.interface'
import { FriendRow } from './FriendRow'

const MAX_VISIBLE = 5

export function FriendsCard({
  skeleton,
  data,
  onAddFriend,
  onSelectFriend,
}: {
  skeleton?: boolean
  data: ProfileData
  onAddFriend?: () => void
  onSelectFriend?: (friend: Friend) => void
}) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  if (skeleton) {
    return (
      <Card className="mx-4 overflow-hidden" shadow="sm">
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--ma-border-subtle)' }}>
          <div className="skeleton" style={{ height: '0.75rem', width: '3.5rem', borderRadius: 'var(--radius-sm)' }} />
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: i > 0 ? '1px solid var(--ma-border-subtle)' : undefined }}>
            <div className="skeleton shrink-0" style={{ height: '2.25rem', width: '2.25rem', borderRadius: 'var(--radius-xl)' }} />
            <div className="flex flex-1 flex-col gap-2">
              <div className="skeleton" style={{ height: '0.875rem', width: '7rem', borderRadius: 'var(--radius-sm)' }} />
              <div className="skeleton" style={{ height: '0.75rem', width: '4.5rem', borderRadius: 'var(--radius-sm)' }} />
            </div>
            <div className="skeleton" style={{ height: '0.75rem', width: '3rem', borderRadius: 'var(--radius-sm)' }} />
          </div>
        ))}
      </Card>
    )
  }

  const visible = expanded ? data.friends : data.friends.slice(0, MAX_VISIBLE)
  const hasMore = data.friends.length > MAX_VISIBLE

  const titleNode = (
    <div className="flex items-center gap-2">
      <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ma-fg-subtle)' }}>
        {t.profile.friends}
      </p>
      <span className="text-[11px] font-semibold tabular-nums" style={{ color: 'var(--ma-fg-subtle)' }}>
        ({data.friends.length})
      </span>
    </div>
  )

  const actionNode = onAddFriend ? (
    <button
      type="button"
      onClick={() => {
        onAddFriend()
      }}
      className="rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-opacity hover:opacity-80 active:opacity-60"
      style={{ background: 'var(--ma-brand-soft)', color: 'var(--ma-brand)' }}
    >
      + {t.addFriendModal?.title || 'Tìm & Kết Bạn'}
    </button>
  ) : undefined

  return (
    <CollapsibleCard title={titleNode} action={actionNode}>
      {data.friends.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-[13px] text-[var(--ma-fg-subtle)]">{t.challenge?.noFriends || 'Chưa có bạn bè nào.'}</p>
          {onAddFriend && (
            <button
              type="button"
              onClick={onAddFriend}
              className="mt-2 inline-block rounded-xl px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-85"
              style={{ background: 'var(--ma-brand)' }}
            >
              + {t.addFriendModal?.title || 'Tìm & Kết Bạn Ngay'}
            </button>
          )}
        </div>
      ) : (
        visible.map((friend, i) => (
          <div
            key={friend.id}
            style={{ borderTop: i > 0 ? '1px solid var(--ma-border-subtle)' : undefined }}
          >
            <FriendRow friend={friend} onSelect={onSelectFriend} />
          </div>
        ))
      )}

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="w-full py-2.5 text-[12px] font-semibold transition-opacity hover:opacity-70 active:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
          style={{
            borderTop: '1px solid var(--ma-border-subtle)',
            color: 'var(--ma-brand)',
          }}
        >
          {expanded
            ? t.profile.showLess
            : t.profile.seeAllFriends(data.friends.length)}
        </button>
      )}
    </CollapsibleCard>
  )
}
