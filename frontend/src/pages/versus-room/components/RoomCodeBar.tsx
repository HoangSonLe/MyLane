import { useState } from 'react'

import { IconCheck } from './icons'
import { Card } from '@/components/ui/card'

function IconCopy() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function IconShare() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

export function RoomCodeBar({
  skeleton,
  code,
  link,
}: {
  skeleton?: boolean
  code: string
  link: string
}) {
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)

  function handleCopy(type: 'code' | 'link') {
    const text = type === 'code' ? code : link
    navigator.clipboard?.writeText(text).catch(() => {})
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  if (skeleton) {
    return (
      <div
        className="skeleton mx-4"
        style={{ height: '3.5rem', borderRadius: 'var(--radius-2xl)' }}
      />
    )
  }

  return (
    <Card className="mx-4 flex items-center justify-between gap-3" padding="0.875rem 1rem">
      <div className="flex flex-col min-w-0">
        <span
          className="text-[16px] font-bold tracking-widest tabular-nums"
          style={{ color: 'var(--ma-fg)' }}
        >
          {code}
        </span>
        <span className="text-[11px] truncate" style={{ color: 'var(--ma-fg-subtle)' }}>
          {link}
        </span>
      </div>

      <div className="flex shrink-0 gap-2">
        {/* Copy code */}
        <button
          type="button"
          onClick={() => handleCopy('code')}
          aria-label={copied === 'code' ? 'Code copied' : 'Copy room code'}
          className={[
            'flex h-9 items-center gap-1.5 px-3',
            'text-[12px] font-semibold',
            'transition-all duration-[var(--ma-duration-micro)] active:scale-95',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
          ].join(' ')}
          style={{
            borderRadius: 'var(--radius-xl)',
            background: copied === 'code' ? 'oklch(0.70 0.15 145 / 0.12)' : 'var(--ma-surface-raised)',
            border: `1px solid ${copied === 'code' ? 'oklch(0.70 0.15 145 / 0.30)' : 'var(--ma-border)'}`,
            color: copied === 'code' ? 'var(--ma-success)' : 'var(--ma-fg-muted)',
          }}
        >
          {copied === 'code' ? <IconCheck /> : <IconCopy />}
          {copied === 'code' ? 'Copied' : 'Copy'}
        </button>

        {/* Share link */}
        <button
          type="button"
          onClick={() => handleCopy('link')}
          aria-label={copied === 'link' ? 'Link copied' : 'Share room link'}
          className={[
            'flex h-9 items-center gap-1.5 px-3',
            'text-[12px] font-semibold',
            'transition-all duration-[var(--ma-duration-micro)] active:scale-95',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ma-ring)]',
          ].join(' ')}
          style={{
            borderRadius: 'var(--radius-xl)',
            background: copied === 'link' ? 'oklch(0.70 0.15 145 / 0.12)' : 'var(--ma-surface-raised)',
            border: `1px solid ${copied === 'link' ? 'oklch(0.70 0.15 145 / 0.30)' : 'var(--ma-border)'}`,
            color: copied === 'link' ? 'var(--ma-success)' : 'var(--ma-fg-muted)',
          }}
        >
          {copied === 'link' ? <IconCheck /> : <IconShare />}
          Share
        </button>
      </div>
    </Card>
  )
}
