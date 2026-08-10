import { useState } from 'react'
import { getInitials } from '@/lib/utils'

export function InitialsAvatar({
  name,
  imageUrl,
  size = 36,
  highlight = false,
}: {
  name: string
  imageUrl?: string
  size?: number
  highlight?: boolean
}) {
  const initials = getInitials(name)
  const [imgError, setImgError] = useState(false)

  return (
    <div
      className="relative shrink-0 flex items-center justify-center overflow-hidden"
      style={{
        height: size,
        width: size,
        borderRadius: 'var(--radius-lg)',
        background: highlight ? 'var(--ma-active-soft)' : 'var(--ma-surface-raised)',
        border: highlight
          ? '1.5px solid oklch(0.58 0.11 230 / 0.4)'
          : '1px solid var(--ma-border)',
      }}
      aria-hidden="true"
    >
      {imageUrl && !imgError ? (
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ borderRadius: 'inherit' }}
          onError={() => setImgError(true)}
        />
      ) : (
        <span
          className="text-[12px] font-bold"
          style={{ color: highlight ? 'var(--ma-active)' : 'var(--ma-fg-muted)' }}
        >
          {initials}
        </span>
      )}
    </div>
  )
}
