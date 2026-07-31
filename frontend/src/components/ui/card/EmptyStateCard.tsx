import type { CSSProperties, ReactNode } from 'react'

import { Card } from './Card'

/**
 * StateCard — shared skeleton behind Empty/Error/Offline state blocks:
 * icon badge → title → description → optional action. Extracted from ~9
 * near-identical blocks across Home/Lobby/Leaderboard/Profile/
 * SequenceMemoryScreen. Icon badge size, title/description type scale, and
 * the action button all vary per call site (12-17px text, 2.75rem-5rem
 * badges, several unrelated button styles) — those stay explicit
 * className/style props rather than baked-in variants, so each call site
 * reproduces exactly what it already had.
 */
export interface StateCardProps {
  wrapper?: 'card' | 'plain'
  wrapperClassName?: string
  cardBorder?: 'default' | 'subtle'
  cardPadding?: string
  gapClassName?: string
  icon: ReactNode
  iconWrapperClassName?: string
  iconWrapperStyle?: CSSProperties
  iconColor?: string
  titleTag?: 'p' | 'h2'
  titleClassName?: string
  title: ReactNode
  descriptionClassName?: string
  description: ReactNode
  textGroupClassName?: string
  action?: ReactNode
  className?: string
}

export function StateCard({
  wrapper = 'card',
  wrapperClassName = 'mx-4 flex flex-col items-center text-center',
  cardBorder,
  cardPadding = '2rem 1.5rem',
  gapClassName = 'gap-4',
  icon,
  iconWrapperClassName = 'flex items-center justify-center',
  iconWrapperStyle = {
    height: '2.75rem',
    width: '2.75rem',
    borderRadius: 'var(--radius-xl)',
  },
  iconColor,
  titleTag = 'p',
  titleClassName = 'text-[14px] font-semibold',
  title,
  descriptionClassName = 'text-[12px] leading-relaxed',
  description,
  textGroupClassName = 'flex flex-col gap-1',
  action,
  className = '',
}: StateCardProps) {
  const TitleTag = titleTag

  const content = (
    <>
      <div className={iconWrapperClassName} style={iconWrapperStyle} aria-hidden="true">
        <span style={iconColor ? { color: iconColor } : undefined}>{icon}</span>
      </div>
      <div className={textGroupClassName}>
        <TitleTag className={titleClassName} style={{ color: 'var(--ma-fg)' }}>
          {title}
        </TitleTag>
        <p className={descriptionClassName} style={{ color: 'var(--ma-fg-muted)' }}>
          {description}
        </p>
      </div>
      {action}
    </>
  )

  const innerClassName = [wrapperClassName, gapClassName, className].filter(Boolean).join(' ')

  if (wrapper === 'plain') {
    return <div className={innerClassName}>{content}</div>
  }

  return (
    <Card className={innerClassName} border={cardBorder} padding={cardPadding}>
      {content}
    </Card>
  )
}

export function EmptyStateCard(props: StateCardProps) {
  return <StateCard {...props} />
}

export function ErrorStateCard(props: StateCardProps) {
  return <StateCard {...props} />
}

export function OfflineStateCard(props: StateCardProps) {
  return <StateCard {...props} />
}
