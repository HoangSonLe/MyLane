import type { ErrorKind, GameCategory, PlayerSlot, PublicRoomSummary } from './versus-room.interface'
import { GameId, RoundMode } from '@/configs/enum'

export const PLAYER_NAME = 'Alex'
export const PLAYER_HANDLE = 'alex_m'
export const PLAYER_ELO = 1387
export const ROOM_CODE = 'MEM-8472'
export const ROOM_LINK = 'memoryarena.app/r/MEM-8472'

export const MOCK_HOST: PlayerSlot = {
  name: PLAYER_NAME,
  handle: PLAYER_HANDLE,
  elo: PLAYER_ELO,
  ready: true,
}

export const MOCK_OPPONENT: PlayerSlot = {
  name: 'Mia Torres',
  handle: 'mia_t',
  elo: 1480,
  ready: false,
}

export const GAME_CATEGORIES: GameCategory[] = [
  { id: GameId.COLOR,    label: 'Color Memory',     description: 'Repeat growing color sequences'  },
  { id: GameId.NUMBER,   label: 'Number Memory',   description: 'Recall growing digit sequences'  },
  { id: GameId.ALPHABET, label: 'Alphabet Memory',  description: 'Memorise letter sequences'       },
  { id: GameId.GRID,     label: 'Grid Memory',      description: 'Recall highlighted cell patterns' },
  { id: GameId.SEQUENCE, label: 'Sequence Memory',  description: 'Replay growing tile sequences'   },
]

export const MOCK_AVAILABLE_ROOMS: PublicRoomSummary[] = [
  {
    code: 'MEM-1204',
    roomName: 'Sequence Speed Masters',
    category: GameId.SEQUENCE,
    mode: RoundMode.VERSUS_RANKED,
    hostName: 'MasterMemory',
    hostElo: 1540,
    playerCount: 1,
    maxPlayers: 2,
    isPrivate: false,
  },
  {
    code: 'MEM-3391',
    roomName: 'Chimpanzee Grid Challenge',
    category: GameId.GRID,
    mode: RoundMode.VERSUS_UNRANKED,
    hostName: 'ProGamer_99',
    hostElo: 1420,
    playerCount: 1,
    maxPlayers: 2,
    isPrivate: false,
  },
  {
    code: 'MEM-7720',
    roomName: 'Simon Color Arena',
    category: GameId.COLOR,
    mode: RoundMode.VERSUS_RANKED,
    hostName: 'Elena_R',
    hostElo: 1390,
    playerCount: 1,
    maxPlayers: 2,
    isPrivate: false,
  },
]

export const ERROR_MESSAGES: Record<ErrorKind, string> = {
  'invalid-code': 'That room code does not exist. Check the code and try again.',
  'room-full':    'This room is already full. Ask the host for a new link.',
  'room-expired': 'This room has expired. Rooms close after 10 minutes of inactivity.',
  'connection':   'Could not connect to the room. Check your connection and try again.',
}
