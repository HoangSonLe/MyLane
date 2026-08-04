import type { Phase } from './board.types'
import { hapticFeedback } from '@/lib/utils/haptics'
import { soundEffects } from '@/lib/utils/audio'

/**
 * docs/gameplay/color-memory.md — Simon-style circular board
 * Perfectly aligned 4-side active border outline with a subtle, 2.5px thicker border tone.
 */
const TILE_COLORS = [
  {
    name: 'Amber',
    base: 'oklch(0.78 0.16 75)',
    dim: 'oklch(0.78 0.16 75 / 0.16)',
    darkBorder: 'oklch(0.74 0.16 75)',
  },
  {
    name: 'Teal',
    base: 'oklch(0.72 0.16 175)',
    dim: 'oklch(0.72 0.16 175 / 0.16)',
    darkBorder: 'oklch(0.68 0.16 175)',
  },
  {
    name: 'Rose',
    base: 'oklch(0.72 0.18 10)',
    dim: 'oklch(0.72 0.18 10 / 0.16)',
    darkBorder: 'oklch(0.68 0.18 10)',
  },
  {
    name: 'Violet',
    base: 'oklch(0.70 0.18 280)',
    dim: 'oklch(0.70 0.18 280 / 0.16)',
    darkBorder: 'oklch(0.66 0.18 280)',
  },
  {
    name: 'Lime',
    base: 'oklch(0.76 0.19 130)',
    dim: 'oklch(0.76 0.19 130 / 0.16)',
    darkBorder: 'oklch(0.72 0.19 130)',
  },
  {
    name: 'Sky',
    base: 'oklch(0.68 0.15 230)',
    dim: 'oklch(0.68 0.15 230 / 0.16)',
    darkBorder: 'oklch(0.64 0.15 230)',
  },
] as const

/**
 * Calculates SVG Path D string for a Perfect Circular Annular Sector.
 */
function getCircularSectorPath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startAngleDeg: number,
  endAngleDeg: number
) {
  const toRad = (d: number) => (d * Math.PI) / 180
  const radStart = toRad(startAngleDeg)
  const radEnd = toRad(endAngleDeg)

  // Outer Arc Start & End
  const x1 = cx + rOuter * Math.cos(radStart)
  const y1 = cy + rOuter * Math.sin(radStart)
  const x2 = cx + rOuter * Math.cos(radEnd)
  const y2 = cy + rOuter * Math.sin(radEnd)

  // Inner Arc End & Start
  const x3 = cx + rInner * Math.cos(radEnd)
  const y3 = cy + rInner * Math.sin(radEnd)
  const x4 = cx + rInner * Math.cos(radStart)
  const y4 = cy + rInner * Math.sin(radStart)

  const largeArc = endAngleDeg - startAngleDeg > 180 ? 1 : 0

  return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4} Z`
}

export function ColorBoard({
  colorCount,
  litTile,
  pressedTile,
  onTap,
  phase,
}: {
  /** 4-6, per the current level (docs/gameplay/color-memory.md level table). */
  colorCount: number
  litTile: number | null
  pressedTile: number | null
  onTap: (id: number) => void
  phase: Phase
}) {
  const isAnswering = phase === 'answering'
  const count = Math.min(Math.max(colorCount, 4), 6)

  const cx = 150
  const cy = 150
  const rOuter = 138
  const rInner = 58
  const rHub = 44
  const angleStep = 360 / count

  return (
    <div
      className="relative w-full max-w-[280px] sm:max-w-[325px] aspect-square flex items-center justify-center select-none"
      role="group"
      aria-label="Color memory board"
    >
      <svg
        viewBox="0 0 300 300"
        className="w-full h-full overflow-visible drop-shadow-xl"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <defs>
          {/* Mask that cuts out true transparent gaps between inactive sectors */}
          <mask id="simon-gap-mask">
            <rect x="0" y="0" width="300" height="300" fill="white" />
            {Array.from({ length: count }).map((_, i) => {
              const angleRad = ((i * angleStep - 90) * Math.PI) / 180
              const x1 = cx + (rInner - 6) * Math.cos(angleRad)
              const y1 = cy + (rInner - 6) * Math.sin(angleRad)
              const x2 = cx + (rOuter + 6) * Math.cos(angleRad)
              const y2 = cy + (rOuter + 6) * Math.sin(angleRad)

              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="black"
                  strokeWidth="14"
                  strokeLinecap="square"
                />
              )
            })}
          </mask>
        </defs>

        {/* Inactive Sectors rendered inside the Gap Cutout Mask */}
        <g mask="url(#simon-gap-mask)">
          {TILE_COLORS.slice(0, count).map((color, id) => {
            const isLit = litTile === id
            const isPressed = pressedTile === id
            const active = isLit || isPressed

            const startAngle = id * angleStep - 90
            const endAngle = (id + 1) * angleStep - 90

            const pathD = getCircularSectorPath(cx, cy, rOuter, rInner, startAngle, endAngle)

            return (
              <path
                key={id}
                d={pathD}
                fill={active ? color.base : color.dim}
                className={[
                  'transition-all duration-150 outline-none focus:outline-none',
                  isAnswering ? 'cursor-pointer hover:opacity-90' : 'cursor-default',
                ].join(' ')}
                style={{
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                }}
                role="button"
                tabIndex={isAnswering ? 0 : -1}
                aria-label={`Color tile ${id + 1}`}
                onClick={() => {
                  if (isAnswering) {
                    hapticFeedback.light()
                    soundEffects.tap()
                    onTap(id)
                  }
                }}
              />
            )
          })}
        </g>

        {/* Active Pad Overlay (Thicker 2.5px subtle border) */}
        {TILE_COLORS.slice(0, count).map((color, id) => {
          const isLit = litTile === id
          const isPressed = pressedTile === id
          const active = isLit || isPressed

          if (!active) return null

          const startAngle = id * angleStep - 90
          const endAngle = (id + 1) * angleStep - 90

          const pathD = getCircularSectorPath(cx, cy, rOuter, rInner, startAngle, endAngle)

          return (
            <path
              key={`active-${id}`}
              d={pathD}
              fill={color.base}
              stroke={color.darkBorder}
              strokeWidth="2.5"
              strokeLinejoin="round"
              className="pointer-events-none transition-all duration-150"
              style={{
                transformOrigin: `${cx}px ${cy}px`,
                transform: 'scale(1.03)',
                filter: `drop-shadow(0 0 12px ${color.base})`,
              }}
            />
          )
        })}

        {/* Clean Central Circular Hub */}
        <circle
          cx={cx}
          cy={cy}
          r={rHub}
          fill="var(--ma-surface-raised, #18181b)"
          stroke="var(--ma-border, #3f3f46)"
          strokeWidth="3.5"
        />

        {/* Inner Hub Ring */}
        <circle
          cx={cx}
          cy={cy}
          r={rHub - 5}
          fill="none"
          stroke="oklch(0.76 0.14 74 / 0.25)"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  )
}
