import type { Friend, LobbyPlayer } from './lobby.interface'
import { GameId } from '@/configs/enum'

export const MOCK_FRIENDS: Friend[] = [
  {
    id: '1',
    name: 'Mia Torres',
    handle: 'mia_t',
    elo: 1480,
    status: 'online',
    gamesPlayed: 142,
    winRate: 64,
    rank: 88,
    records: {
      [GameId.NUMBER]: { bestScore: 14, highestLevel: 10, elo: 1480 },
      [GameId.GRID]: { bestScore: 16, highestLevel: 10, elo: 1510 },
      [GameId.SEQUENCE]: { bestScore: 12, highestLevel: 10, elo: 1450 },
    },
  },
  {
    id: '2',
    name: 'Jake Norris',
    handle: 'jake_n',
    elo: 1310,
    status: 'in-game',
    gamesPlayed: 98,
    winRate: 52,
    rank: 215,
    records: {
      [GameId.COLOR]: { bestScore: 11, highestLevel: 10, elo: 1310 },
      [GameId.ALPHABET]: { bestScore: 9, highestLevel: 9, elo: 1280 },
    },
  },
  {
    id: '3',
    name: 'Priya Mehta',
    handle: 'priya.m',
    elo: 1622,
    status: 'online',
    gamesPlayed: 230,
    winRate: 71,
    rank: 24,
    records: {
      [GameId.GRID]: { bestScore: 22, highestLevel: 10, elo: 1650 },
      [GameId.NUMBER]: { bestScore: 19, highestLevel: 10, elo: 1622 },
    },
  },
  {
    id: '4',
    name: 'Sam Okafor',
    handle: 'samokafor',
    elo: 1055,
    status: 'offline',
    gamesPlayed: 35,
    winRate: 40,
    rank: 512,
    records: {
      [GameId.SEQUENCE]: { bestScore: 8, highestLevel: 8, elo: 1055 },
    },
  },
  {
    id: '5',
    name: 'Lena Park',
    handle: 'lena_p',
    elo: 1740,
    status: 'online',
    gamesPlayed: 310,
    winRate: 78,
    rank: 9,
    records: {
      [GameId.SEQUENCE]: { bestScore: 25, highestLevel: 10, elo: 1740 },
      [GameId.COLOR]: { bestScore: 20, highestLevel: 10, elo: 1710 },
    },
  },
]

export const MOCK_PLAYER: LobbyPlayer = {
  name: 'Alex',
  elo: 1387,
}
