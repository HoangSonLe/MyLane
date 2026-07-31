export interface Friend {
  id: string
  name: string
  handle: string
  elo: number
  status: 'online' | 'in-game'
}

export interface LobbyPlayer {
  name: string
  elo: number
}
