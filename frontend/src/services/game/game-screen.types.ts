export type GamePhase = 'idle' | 'watching' | 'input' | 'success' | 'fail'
export type TileColor = 'amber' | 'teal' | 'rose' | 'violet'

export interface Tile {
  id: number
  color: TileColor
}
