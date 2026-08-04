import { getInitials, formatJoinedLabel } from '@/lib/utils'
import { CardButton } from '@/components/ui/card'

import type { ProfileData } from '@/services/profile/profile.interface'
import { useTranslation } from '@/i18n/useTranslation'

function IconEdit() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconQr() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM15 14h2v2h-2zM19 14h2v4h-4v3h-3v-3M19 20h2v1h-2z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  )
}

export function AvatarHero({
  skeleton,
  data,
  onEdit,
  onShowQr,
}: {
  skeleton?: boolean
  data: ProfileData
  onEdit?: () => void
  onShowQr?: () => void
}) {
  const { t, locale } = useTranslation()
  const initials = getInitials(data.username)
  const displayJoinedLabel = formatJoinedLabel(data.joinedLabel, locale)

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
        className="flex items-center justify-center overflow-hidden"
        style={{
          height: '5rem',
          width: '5rem',
          borderRadius: 'var(--radius-2xl)',
          background: 'var(--ma-surface-raised)',
          border: '2px solid var(--ma-border)',
          boxShadow: 'var(--ma-shadow-md)',
        }}
        aria-label={t.profile.avatarFor(data.username)}
      >
        {data.avatarUrl ? (
          <img src={data.avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-[28px] font-bold" style={{ color: 'var(--ma-fg-muted)' }}>
            {initials}
          </span>
        )}
      </div>

      {/* Name + meta */}
      <div className="flex flex-col items-center gap-0.5">
        <p className="text-[19px] font-bold" style={{ color: 'var(--ma-fg)' }}>
          {data.username}
        </p>
        <p className="text-[13px]" style={{ color: 'var(--ma-fg-subtle)' }}>
          @{data.handle} · {displayJoinedLabel}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <CardButton
          onClick={onEdit}
          aria-label={t.profile.editAriaLabel}
          className={[
            'flex h-10 items-center justify-center gap-2 px-4',
            'text-[13px] font-semibold',
            'transition-transform duration-[var(--ma-duration-micro)] active:scale-95',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
          ].join(' ')}
          shadow="sm"
          style={{ color: 'var(--ma-fg-muted)' }}
        >
          <IconEdit />
          {t.profile.editProfile}
        </CardButton>
        <CardButton
          onClick={onShowQr}
          aria-label={t.profile.showFriendCodeAria}
          className="flex h-10 items-center justify-center gap-2 px-4 text-[13px] font-semibold transition-transform duration-[var(--ma-duration-micro)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]"
          shadow="sm"
          style={{ color: 'var(--ma-brand)' }}
        >
          <IconQr />
          {t.profile.showFriendCode}
        </CardButton>
      </div>
    </div>
  )
}
