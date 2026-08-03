import { http, HttpResponse } from 'msw'
import { decodeToken } from './fake-users'
import { MOCK_AVAILABLE_ROOMS, MOCK_OPPONENT } from '@/services/versus-room/versus-room.mock'
import type { PlayerSlot, Room, GameCategoryId, RoundMode, PublicRoomSummary } from '@/services/versus-room/versus-room.interface'
import { GameId, DifficultyId, RoomEntrySource } from '@/configs/enum'

const rooms = new Map<string, Room>()

function toHandle(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '_')
}

function makeCode(): string {
  return Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0')
}

function makeSeed(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase()
}

const AUTO_JOIN_DELAY_MS = 7000

export const versusRoomHandlers = [
  // GET available public rooms for Lobby
  http.get('/api/versus-room/available', () => {
    const activePublicRooms: PublicRoomSummary[] = []
    rooms.forEach((room) => {
      if (!room.isPrivate && !room.opponentJoined) {
        activePublicRooms.push({
          code: room.code,
          roomName: room.roomName || 'Versus Room',
          category: room.category,
          mode: room.mode,
          hostName: room.host.name,
          hostElo: room.host.elo,
          playerCount: 1,
          maxPlayers: 2,
          isPrivate: false,
        })
      }
    })
    // If no dynamic rooms, fall back to mock default available rooms
    const result = activePublicRooms.length > 0 ? activePublicRooms : MOCK_AVAILABLE_ROOMS
    return HttpResponse.json({ rooms: result })
  }),

  // POST Quick Join — match into first available public room or create one
  http.post('/api/versus-room/quick-join', async ({ request }) => {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = token ? decodeToken(token) : null
    if (!user || user.isGuest) {
      return HttpResponse.json({ message: 'Account required.' }, { status: 401 })
    }

    // Look for an existing open public room
    let availableCode: string | null = null
    rooms.forEach((room, code) => {
      if (!room.isPrivate && !room.opponentJoined && room.host.name !== user.name) {
        availableCode = code
      }
    })

    if (availableCode) {
      const room = rooms.get(availableCode)!
      room.opponent = { name: user.name, handle: toHandle(user.name), elo: user.elo, ready: true }
      room.opponentJoined = true
      return HttpResponse.json({ room })
    }

    // Fallback: auto-create a new public room for Quick Join
    const code = makeCode()
    const host: PlayerSlot = { name: user.name, handle: toHandle(user.name), elo: user.elo, ready: true }
    const room: Room = {
      code,
      link: `memoryarena.app/r/${code}`,
      seed: makeSeed(),
      category: GameId.SEQUENCE,
      mode: MOCK_AVAILABLE_ROOMS[0].mode,
      difficulty: DifficultyId.MEDIUM,
      roomName: 'Quick Join Room',
      isPrivate: false,
      host,
      opponent: null,
      opponentJoined: false,
      status: 'waiting',
      entrySource: RoomEntrySource.QUICK_JOIN,
      startAt: null,
      hostScore: 0,
      guestScore: 0,
      hostRoundsCompleted: 0,
      guestRoundsCompleted: 0,
    }
    rooms.set(code, room)

    setTimeout(() => {
      const current = rooms.get(code)
      if (current && !current.opponentJoined) {
        current.opponent = { ...MOCK_OPPONENT, ready: true }
        current.opponentJoined = true
      }
    }, AUTO_JOIN_DELAY_MS)

    return HttpResponse.json({ room })
  }),

  // POST Create Room
  http.post('/api/versus-room', async ({ request }) => {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = token ? decodeToken(token) : null
    if (!user || user.isGuest) {
      return HttpResponse.json({ message: 'Account required.' }, { status: 401 })
    }

    const body = (await request.json()) as { category: GameCategoryId; mode: RoundMode; difficulty?: DifficultyId; roomName: string; isPrivate?: boolean; entrySource?: RoomEntrySource }
    const code = makeCode()
    const host: PlayerSlot = { name: user.name, handle: toHandle(user.name), elo: user.elo, ready: false }
    const room: Room = {
      code,
      link: `memoryarena.app/r/${code}`,
      seed: makeSeed(),
      category: body.category,
      mode: body.mode,
      difficulty: body.difficulty || DifficultyId.MEDIUM,
      roomName: body.roomName,
      isPrivate: !!body.isPrivate,
      host,
      opponent: null,
      opponentJoined: false,
      status: 'waiting',
      entrySource: body.entrySource || RoomEntrySource.CUSTOM,
      startAt: null,
      hostScore: 0,
      guestScore: 0,
      hostRoundsCompleted: 0,
      guestRoundsCompleted: 0,
    }
    rooms.set(code, room)

    setTimeout(() => {
      const current = rooms.get(code)
      if (current && !current.opponentJoined) {
        current.opponent = { ...MOCK_OPPONENT, ready: true }
        current.opponentJoined = true
      }
    }, AUTO_JOIN_DELAY_MS)

    return HttpResponse.json({ room })
  }),

  // POST Join Room by code
  http.post('/api/versus-room/:code/join', ({ params, request }) => {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = token ? decodeToken(token) : null
    if (!user || user.isGuest) {
      return HttpResponse.json({ message: 'Account required.' }, { status: 401 })
    }

    const code = String(params.code).toUpperCase()
    const room = rooms.get(code)
    if (!room) return HttpResponse.json({ message: 'Room not found.' }, { status: 404 })

    if (room.opponentJoined) {
      return HttpResponse.json({ message: 'Room is full.' }, { status: 409 })
    }
    room.opponent = { name: user.name, handle: toHandle(user.name), elo: user.elo, ready: false }
    room.opponentJoined = true
    return HttpResponse.json({ room })
  }),

  // POST Ready state for the current participant
  http.post('/api/versus-room/:code/ready', async ({ params, request }) => {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = token ? decodeToken(token) : null
    const code = String(params.code).toUpperCase()
    const room = rooms.get(code)
    if (!room || !user) return HttpResponse.json({ message: 'Room not found.' }, { status: 404 })
    const body = (await request.json()) as { ready: boolean }
    if (room.host.name === user.name) room.host.ready = body.ready
    else if (room.opponent?.name === user.name) room.opponent.ready = body.ready
    else return HttpResponse.json({ message: 'Not a room participant.' }, { status: 403 })
    return HttpResponse.json({ room })
  }),

  // POST Start once both participants are ready
  http.post('/api/versus-room/:code/start', ({ params, request }) => {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = token ? decodeToken(token) : null
    const code = String(params.code).toUpperCase()
    const room = rooms.get(code)
    if (!room) return HttpResponse.json({ message: 'Room not found.' }, { status: 404 })
    const quickMatch = room.entrySource === RoomEntrySource.QUICK_MATCH
    if (!user || (!quickMatch && room.host.name !== user.name)) {
      return HttpResponse.json({ message: 'Only the host can start.' }, { status: 403 })
    }
    if (!room.opponentJoined || !room.host.ready || !room.opponent?.ready) {
      return HttpResponse.json({ message: 'Both players must be ready.' }, { status: 409 })
    }
    room.status = 'in_progress'
    room.startAt = new Date(Date.now() + 3000).toISOString()
    return HttpResponse.json({ room })
  }),

  http.post('/api/versus-room/:code/round', async ({ params, request }) => {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = token ? decodeToken(token) : null
    const code = String(params.code).toUpperCase()
    const room = rooms.get(code)
    if (!room || !user) return HttpResponse.json({ message: 'Room not found.' }, { status: 404 })
    const body = (await request.json()) as { roundNumber: number; correct: boolean }
    const isHost = room.host.name === user.name
    if (isHost) {
      if ((room.hostRoundsCompleted || 0) < body.roundNumber) {
        room.hostRoundsCompleted = body.roundNumber
        if (body.correct) room.hostScore = (room.hostScore || 0) + 1
      }
      // Mock backend advances its synthetic opponent deterministically.
      room.guestRoundsCompleted = body.roundNumber
      if (body.roundNumber % 2 === 0) room.guestScore = (room.guestScore || 0) + 1
    } else {
      if ((room.guestRoundsCompleted || 0) < body.roundNumber) {
        room.guestRoundsCompleted = body.roundNumber
        if (body.correct) room.guestScore = (room.guestScore || 0) + 1
      }
      room.hostRoundsCompleted = body.roundNumber
      if (body.roundNumber % 2 === 0) room.hostScore = (room.hostScore || 0) + 1
    }
    if ((room.hostRoundsCompleted || 0) >= 5 && (room.guestRoundsCompleted || 0) >= 5) {
      room.status = 'finished'
      room.finishReason = 'completed'
      room.winnerId = null
    }
    return HttpResponse.json({
      result: {
        matchStatus: room.status,
        hostScore: room.hostScore || 0,
        guestScore: room.guestScore || 0,
        hostRoundsCompleted: room.hostRoundsCompleted || 0,
        guestRoundsCompleted: room.guestRoundsCompleted || 0,
        winnerId: room.winnerId || null,
        outcome: null,
        eloChange: 0,
      },
    })
  }),

  http.post('/api/versus-room/:code/forfeit', ({ params, request }) => {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = token ? decodeToken(token) : null
    const code = String(params.code).toUpperCase()
    const room = rooms.get(code)
    if (!room || !user) return HttpResponse.json({ message: 'Room not found.' }, { status: 404 })
    room.status = 'finished'
    room.finishReason = 'forfeit'
    room.winnerId = room.host.name === user.name ? room.opponent?.id || null : room.host.id || null
    return HttpResponse.json({ outcome: 'loss', eloChange: 0 })
  }),

  // POST Leave Room with Host Transfer logic
  http.post('/api/versus-room/:code/leave', ({ params, request }) => {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = token ? decodeToken(token) : null
    const code = String(params.code).toUpperCase()
    const room = rooms.get(code)

    if (!room) {
      return HttpResponse.json({ room: null, hostTransferred: false })
    }

    const isHostLeaving = user && room.host.name === user.name

    if (isHostLeaving) {
      if (room.opponent) {
        // Transfer Host to opponent
        room.host = room.opponent
        room.opponent = null
        room.opponentJoined = false
        return HttpResponse.json({ room, hostTransferred: true })
      } else {
        // No opponent left — destroy room
        rooms.delete(code)
        return HttpResponse.json({ room: null, hostTransferred: false })
      }
    } else {
      // Opponent leaving — room stays with Host
      room.opponent = null
      room.opponentJoined = false
      return HttpResponse.json({ room, hostTransferred: false })
    }
  }),

  // POST Toggle Privacy (Public vs Private)
  http.post('/api/versus-room/:code/toggle-privacy', async ({ params, request }) => {
    const code = String(params.code).toUpperCase()
    const room = rooms.get(code)
    if (!room) return HttpResponse.json({ message: 'Room not found.' }, { status: 404 })

    const body = (await request.json()) as { isPrivate: boolean }
    room.isPrivate = body.isPrivate
    return HttpResponse.json({ room })
  }),

  // GET Room state
  http.get('/api/versus-room/:code', ({ params }) => {
    const code = String(params.code).toUpperCase()
    const room = rooms.get(code)
    if (!room) return HttpResponse.json({ message: 'Room not found.' }, { status: 404 })
    return HttpResponse.json({ room })
  }),
]
