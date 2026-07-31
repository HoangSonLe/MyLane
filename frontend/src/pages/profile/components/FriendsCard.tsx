import { Card } from '@/components/ui/card'

import type { ProfileData } from '@/services/profile/profile.interface'
import { FriendRow } from './FriendRow'

export function FriendsCard({
  skeleton,
  data,
}: {
  skeleton?: boolean
  data: ProfileData
}) {
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

  return (
    <Card className="mx-4 overflow-hidden" shadow="sm">
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--ma-border-subtle)' }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ma-fg-subtle)' }}>
          Friends
        </p>
        <span className="text-[11px] font-semibold tabular-nums" style={{ color: 'var(--ma-fg-subtle)' }}>
          {data.friends.length}
        </span>
      </div>

      {data.friends.map((friend, i) => (
        <div
          key={friend.id}
          style={{ borderTop: i > 0 ? '1px solid var(--ma-border-subtle)' : undefined }}
        >
          <FriendRow friend={friend} />
        </div>
      ))}
    </Card>
  )
}
