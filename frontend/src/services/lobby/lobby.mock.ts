import type { Friend, LobbyPlayer } from './lobby.interface'

export const MOCK_FRIENDS: Friend[] = [
  { id: '1', name: 'Mia Torres',    handle: 'mia_t',     elo: 1480, status: 'online' },
  { id: '2', name: 'Jake Norris',   handle: 'jake_n',    elo: 1310, status: 'in-game' },
  { id: '3', name: 'Priya Mehta',   handle: 'priya.m',   elo: 1622, status: 'online' },
  { id: '4', name: 'Sam Okafor',    handle: 'samokafor', elo: 1055, status: 'online' },
]

export const MOCK_PLAYER: LobbyPlayer = {
  name: 'Alex',
  elo: 1387,
}
