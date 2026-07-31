import { getInitials } from '@/lib/utils'
import { CardButton } from '@/components/ui/card'

import type { ProfileData } from '@/services/profile/profile.interface'

function IconEdit() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function AvatarHero({
  skeleton,
  data,
  onEdit,
}: {
  skeleton?: boolean
  data: ProfileData
  onEdit?: () => void
}) {
  const initials = getInitials(data.username)

  if (skeleton) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-4">
        <div className="skeleton" style={{ height: '5rem', width: '5rem', borderRadius: 'var(--radius-2xl)' }} />
        <div className="flex flex-col items-center gap-2">
          <div className="skeleton" style={{ height: '1.375rem', width: '9rem', borderRadius: 'var(--radius-sm)' }} />
          <div className="skeleton" style={{ height: '1rem', width: '5.5rem', borderRadius: 'var(--radius-sm)' }} />
        </div>
        <div className="skeleton" style={{ height: '2.5rem', width: '8rem', borderRadius: 'var(--radius-2xl)' }} />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 px-4 py-4">
      {/* Avatar */}
      <div
        className="flex items-center justify-center"
        style={{
          height: '5rem',
          width: '5rem',
          borderRadius: 'var(--radius-2xl)',
          background: 'var(--ma-surface-raised)',
          border: '2px solid var(--ma-border)',
          boxShadow: 'var(--ma-shadow-md)',
        }}
        aria-label={`Avatar for ${data.username}`}
      >
        <span className="text-[28px] font-bold" style={{ color: 'var(--ma-fg-muted)' }}>
          {initials}
        </span>
      </div>

      {/* Name + meta */}
      <div className="flex flex-col items-center gap-0.5">
        <p className="text-[19px] font-bold" style={{ color: 'var(--ma-fg)' }}>
          {data.username}
        </p>
        <p className="text-[13px]" style={{ color: 'var(--ma-fg-subtle)' }}>
          @{data.handle} · {data.joinedLabel}
        </p>
      </div>

      {/* Edit profile button */}
      <CardButton
        onClick={onEdit}
        aria-label="Edit profile"
        className={[
          'flex h-10 items-center justify-center gap-2 px-5',
          'text-[13px] font-semibold',
          'transition-transform duration-[var(--ma-duration-micro)] active:scale-95',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
        ].join(' ')}
        shadow="sm"
        style={{ color: 'var(--ma-fg-muted)' }}
      >
        <IconEdit />
        Edit Profile
      </CardButton>
    </div>
  )
}
