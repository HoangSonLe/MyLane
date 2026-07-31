import type { Tile, TileColor } from '@/services/game/game-screen.types'

const TILE_BASE: Record<TileColor, string> = {
  amber:  'bg-[oklch(0.78_0.16_75)]',
  teal:   'bg-[oklch(0.72_0.16_175)]',
  rose:   'bg-[oklch(0.72_0.18_10)]',
  violet: 'bg-[oklch(0.70_0.18_280)]',
}

const TILE_DIM: Record<TileColor, string> = {
  amber:  'bg-[oklch(0.78_0.16_75/0.18)]',
  teal:   'bg-[oklch(0.72_0.16_175/0.18)]',
  rose:   'bg-[oklch(0.72_0.18_10/0.18)]',
  violet: 'bg-[oklch(0.70_0.18_280/0.18)]',
}

const TILE_RING: Record<TileColor, string> = {
  amber:  'ring-[oklch(0.78_0.16_75/0.6)]',
  teal:   'ring-[oklch(0.72_0.16_175/0.6)]',
  rose:   'ring-[oklch(0.72_0.18_10/0.6)]',
  violet: 'ring-[oklch(0.70_0.18_280/0.6)]',
}

const TILE_GLOW: Record<TileColor, string> = {
  amber:  '0 0 32px oklch(0.78 0.16 75 / 0.45)',
  teal:   '0 0 32px oklch(0.72 0.16 175 / 0.45)',
  rose:   '0 0 32px oklch(0.72 0.18 10 / 0.45)',
  violet: '0 0 32px oklch(0.70 0.18 280 / 0.45)',
}

export function GameTile({
  tile,
  lit,
  pressable,
  onPress,
}: {
  tile: Tile
  lit: boolean
  pressable: boolean
  onPress: (id: number) => void
}) {
  return (
    <button
      type="button"
      disabled={!pressable}
      onClick={() => pressable && onPress(tile.id)}
      aria-label={`${tile.color} tile`}
      className={[
        'aspect-square w-full rounded-2xl transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-4',
        TILE_RING[tile.color],
        lit ? TILE_BASE[tile.color] : TILE_DIM[tile.color],
        pressable ? 'cursor-pointer active:scale-[0.93]' : 'cursor-default',
      ].join(' ')}
      style={{
        boxShadow: lit ? TILE_GLOW[tile.color] : '0 2px 8px oklch(0 0 0 / 0.3)',
        transform: lit && !pressable ? 'scale(1.04)' : undefined,
      }}
    />
  )
}
