import { getInitials } from '@/lib/utils'

/**
 * Avatar — extracted from 2 structurally-identical friend-row avatars
 * (LobbyScreen, ProfileScreen), differing only in size/font-size. Other
 * avatar treatments in the app (LeaderboardScreen's InitialsAvatar,
 * ProfileScreen's own large header avatar) use different tokens
 * (surface-raised vs icon-bg, radius-lg vs radius-2xl, extra shadow) and
 * are kept as their own local components rather than forced in here.
 */
export function Avatar({
  name,
  size = '2.5rem',
  fontSize = '13px',
  children,
}: {
  name: string
  size?: string
  fontSize?: string
  /** Rendered inside the same relatively-positioned container, e.g. a presence dot. */
  children?: React.ReactNode
}) {
  return (
    <div
      className="relative shrink-0 flex items-center justify-center"
      style={{
        height: size,
        width: size,
        borderRadius: 'var(--radius-xl)',
        background: 'var(--ma-icon-bg)',
        border: '1px solid var(--ma-border)',
      }}
    >
      <span className="font-bold" style={{ fontSize, color: 'var(--ma-fg-muted)' }}>
        {getInitials(name)}
      </span>
      {children}
    </div>
  )
}
