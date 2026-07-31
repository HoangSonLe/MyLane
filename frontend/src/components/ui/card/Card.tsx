import type { CSSProperties, ReactNode } from 'react'

/**
 * Card — generic surface container extracted from the "radius-2xl + surface
 * + border" wrapper repeated ~47 times across pages. Padding, shadow and
 * border strength vary per usage, so they're props rather than baked in —
 * each call site passes exactly what it already had, so output is
 * unchanged. Rolled out incrementally file by file, verified each time.
 */
type CardOwnProps = {
  children: ReactNode
  padding?: string
  shadow?: 'sm' | 'md' | 'lg'
  border?: 'default' | 'subtle'
  radius?: '3xl' | '2xl' | 'xl'
  className?: string
  style?: CSSProperties
}

/** Div variant (default) — static container. */
export function Card({
  children,
  padding,
  shadow,
  border = 'default',
  radius = '2xl',
  className = '',
  style,
  ...rest
}: CardOwnProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className}
      style={cardStyle({ padding, shadow, border, radius, style })}
      {...rest}
    >
      {children}
    </div>
  )
}

/** Button variant — for whole-card click targets (e.g. "resume last game"). */
export function CardButton({
  children,
  padding,
  shadow,
  border = 'default',
  radius = '2xl',
  className = '',
  style,
  ...rest
}: CardOwnProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={className}
      style={cardStyle({ padding, shadow, border, radius, style })}
      {...rest}
    >
      {children}
    </button>
  )
}

function cardStyle({
  padding,
  shadow,
  border,
  radius,
  style,
}: {
  padding?: string
  shadow?: 'sm' | 'md' | 'lg'
  border: 'default' | 'subtle'
  radius: '3xl' | '2xl' | 'xl'
  style?: CSSProperties
}): CSSProperties {
  return {
    borderRadius: `var(--radius-${radius})`,
    background: 'var(--ma-surface)',
    border: `1px solid var(--ma-border${border === 'subtle' ? '-subtle' : ''})`,
    ...(shadow ? { boxShadow: `var(--ma-shadow-${shadow})` } : {}),
    ...(padding ? { padding } : {}),
    ...style,
  }
}
