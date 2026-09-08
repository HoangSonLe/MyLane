import express from 'express'
import { decodeToken, encodeToken, makeEmailUser, makeGuestUser, makeOAuthUser } from './fake-users.mjs'
import { MOCK_LAST_PLAYED } from './home-data.mjs'
import { GAME_STATS_SEED } from './game-stats.mjs'
import { MOCK_FRIENDS } from './lobby-data.mjs'
import { MOCK_OPPONENT } from './versus-room-data.mjs'
import { MOCK_PROFILE } from './profile-data.mjs'
import { MOCK_SETTINGS, GUEST_SETTINGS } from './settings-data.mjs'
import { RANK_SEED, isEmptyBoard, makeEntries, makePinnedEntry } from './leaderboard-data.mjs'
import { calculateEloDelta, computeScore } from './scoring.mjs'

/**
 * Standalone fake backend — a real Node process, real port, real network
 * hop. Same /api/* contract as src/mocks/*-handlers.ts (the in-browser MSW
 * version); swap between them with VITE_MOCK_MODE. Stands in for the
 * ASP.NET Core API from docs/technical/README.md until that's built.
 */
const PORT = process.env.MOCK_SERVER_PORT ?? 4310

const app = express()
app.use(express.json())
const registeredEmails = new Set()

// Minimal hand-rolled CORS — the Vite dev server runs on a different
// origin/port, so the browser needs these headers to allow the request.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

const profileIdentities = new Map()

function ensureProfileIdentity(user) {
  const existing = profileIdentities.get(user.id)
  if (existing) return existing
  const identity = {
    username: user.name,
    handle: toHandle(user.name),
    avatarUrl: user.avatarUrl,
  }
  profileIdentities.set(user.id, identity)
  return identity
}

app.post('/api/auth/guest', (req, res) => {
  const user = makeGuestUser()
  res.json({ user, token: encodeToken(user) })
})

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body ?? {}
  if (email === 'error@test.com' || password === 'wrong') {
    return res.status(401).json({ message: 'Invalid email or password. Please try again.' })
  }
  const user = makeEmailUser(email ?? '')
  res.json({ user, token: encodeToken(user) })
})

app.post('/api/auth/register', (req, res) => {
  const { email, password } = req.body ?? {}
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''

  if (!normalizedEmail || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }
  if (registeredEmails.has(normalizedEmail)) {
    return res.status(409).json({ message: 'An account with this email already exists.' })
  }

  registeredEmails.add(normalizedEmail)
  const user = makeEmailUser(normalizedEmail)
  res.status(201).json({ user, token: encodeToken(user) })
})

app.post('/api/auth/oauth/:provider', (req, res) => {
  const user = makeOAuthUser(req.params.provider)
  res.json({ user, token: encodeToken(user) })
})

app.get('/api/auth/session', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const user = token ? decodeToken(token) : null
  if (!user) return res.sendStatus(401)
  res.json({ user })
})

app.post('/api/auth/logout', (req, res) => {
  res.sendStatus(204)
})

// Guests get no last-played data — matches docs/product/README.md
// (guest progress has no server-side save).
app.get('/api/home', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const user = token ? decodeToken(token) : null
  const lastPlayed = user && !user.isGuest ? MOCK_LAST_PLAYED : null
  res.json({ lastPlayed })
})

// The 4 games are fixed client-side content — only Elo/best-score/
// highest-level (per-player progress) comes from here.
app.get('/api/game-select/stats', (req, res) => {
  res.json({ stats: GAME_STATS_SEED })
})

// Lobby requires an account per docs/product/README.md ("Guest mode ... no Versus").
app.get('/api/lobby/friends', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const user = token ? decodeToken(token) : null
  if (!user || user.isGuest) return res.status(401).json({ message: 'Account required.' })
  res.json({ friends: MOCK_FRIENDS })
})

app.get('/api/lobby/users/:friendId', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const user = token ? decodeToken(token) : null
  if (!user || user.isGuest) return res.status(401).json({ message: 'Account required.' })
  if (!req.params.friendId || req.params.friendId === user.id) return res.json({ friend: null })

  const identity = profileIdentities.get(req.params.friendId)
  const friend = identity
    ? { id: req.params.friendId, name: identity.username, handle: identity.handle, avatarUrl: identity.avatarUrl, elo: 1000, status: 'online', friendshipStatus: 'none' }
    : MOCK_FRIENDS.find((item) => item.id === req.params.friendId) || null
  res.json({ friend })
})

// Guests get a 401 (docs/product: guest progress has no server-side save).
app.get('/api/profile', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const user = token ? decodeToken(token) : null
  if (!user || user.isGuest) return res.status(401).json({ message: 'Account required.' })
  const identity = ensureProfileIdentity(user)
  res.json({ profile: { ...MOCK_PROFILE, ...identity, overallElo: user.elo } })
})

app.patch('/api/profile', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const user = token ? decodeToken(token) : null
  if (!user || user.isGuest) return res.status(401).json({ message: 'Account required.' })

  const username = String(req.body?.username || user.name).trim()
  const handle = String(req.body?.handle || toHandle(username)).trim().toLowerCase()
  const duplicate = [...profileIdentities.entries()].some(([id, profile]) => id !== user.id && profile.handle === handle)
  if (duplicate) return res.status(409).json({ message: 'PROFILE_HANDLE_TAKEN' })

  const identity = { username, handle, avatarUrl: req.body?.avatarUrl }
  profileIdentities.set(user.id, identity)
  res.json({ profile: identity })
})

// Guests still get usable defaults — sound/notification prefs are
// meaningful even for a guest session, just no linked login methods.
app.get('/api/settings', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const user = token ? decodeToken(token) : null
  res.json({ settings: !user || user.isGuest ? GUEST_SETTINGS : MOCK_SETTINGS })
})

// Submits a just-finished Solo session (docs/gameplay/README.md § Scoring
// Formula; docs/technical/known-gaps.md #5). Guests get a computed score
// back but nothing is persisted (guest progress has no server-side save).
const GAME_LABELS = { number: 'Number Memory', alphabet: 'Alphabet Memory', grid: 'Grid Memory', sequence: 'Sequence Memory', color: 'Color Memory' }
const MODE_LABELS = { 'solo-practice': 'Solo Practice', 'solo-ranked': 'Solo Ranked', 'solo-endless': 'Solo Endless', 'versus-ranked': 'Versus Ranked', 'versus-unranked': 'Versus Unranked' }

app.post('/api/game/result', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const user = token ? decodeToken(token) : null
  const input = req.body ?? {}
  const isRanked = input.mode === 'solo-ranked' || input.mode === 'versus-ranked'
  const isVersusRanked = input.mode === 'versus-ranked'
  const breakdown = computeScore({ ...input, isRanked })

  const isGuest = !user || user.isGuest
  const shouldPersist = !isGuest && (isRanked || input.mode === 'solo-practice' || input.mode === 'solo-endless')
  // Solo outcome (docs/gameplay/README.md § Accounts): win only when the run
  // completed Level 10; every other ending is a loss.
  const outcome = input.outcome ?? (input.completedAllLevels ? 'win' : 'loss')
  const previousElo = isVersusRanked && shouldPersist ? (user?.elo ?? 1000) : undefined
  const eloChange = previousElo === undefined
    ? undefined
    : calculateEloDelta(previousElo, input.opponentElo ?? 1000, outcome)
  const statsEntry = GAME_STATS_SEED.find((s) => s.id === input.game)
  const previousBestScore = shouldPersist && statsEntry ? statsEntry.bestScore : null
  const previousBestLevel = shouldPersist && statsEntry ? statsEntry.highestLevel : null
  const isNewRecord = shouldPersist && statsEntry
    ? breakdown.score > statsEntry.bestScore || input.levelReached > statsEntry.highestLevel
    : false

  if (shouldPersist && statsEntry) {
    statsEntry.bestScore = Math.max(statsEntry.bestScore, breakdown.score)
    statsEntry.highestLevel = Math.max(statsEntry.highestLevel, input.levelReached)
    statsEntry.completedLevel10 = statsEntry.completedLevel10 || Boolean(input.completedAllLevels)
    MOCK_LAST_PLAYED.game = GAME_LABELS[input.game]
    MOCK_LAST_PLAYED.mode = MODE_LABELS[input.mode]
    MOCK_LAST_PLAYED.score = input.levelReached
    MOCK_LAST_PLAYED.maxScore = 10
    MOCK_LAST_PLAYED.roundsPlayed = input.roundsCleared

    MOCK_PROFILE.totalGames += 1
    if (outcome === 'win') MOCK_PROFILE.wins += 1
    else if (outcome === 'draw') MOCK_PROFILE.draws += 1
    else MOCK_PROFILE.losses += 1

    MOCK_PROFILE.matchHistory.unshift({
      id: `m_${Date.now()}`,
      category: input.game,
      categoryLabel: GAME_LABELS[input.game].replace(' Memory', ''),
      mode: MODE_LABELS[input.mode],
      outcome,
      score: breakdown.score,
      opponentName: input.versusComparison?.opponentName,
      playerRoundScore: input.versusComparison?.playerScore,
      opponentRoundScore: input.versusComparison?.opponentScore,
      eloChange,
      playedAt: 'Just now',
    })

    const bestItem = MOCK_PROFILE.categoryBests.find((b) => b.category === input.game)
    if (bestItem) {
      bestItem.rankedScore = Math.max(bestItem.rankedScore, breakdown.score)
      bestItem.rankedLevel = Math.max(bestItem.rankedLevel, input.levelReached)
      bestItem.highestLevel = Math.max(bestItem.highestLevel, input.levelReached)
    }
  }

  res.json({
    result: {
      game: GAME_LABELS[input.game],
      mode: input.mode,
      modeLabel: MODE_LABELS[input.mode],
      score: breakdown.score,
      levelReached: input.levelReached,
      previousBestScore,
      previousBestLevel,
      isNewRecord,
      rankedBreakdown: isRanked ? breakdown : undefined,
      eloChange,
      previousElo,
    },
  })
})

// Guests get a 401 — App.tsx already blocks guest navigation here, this is
// defensive (matches Lobby/Versus Room). Other players' rows are a
// deterministic seed, not randomized per request.
app.get('/api/leaderboard', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const user = token ? decodeToken(token) : null
  if (!user || user.isGuest) return res.status(401).json({ message: 'Account required.' })

  const board = req.query.board ?? 'global-alltime'
  const category = req.query.category ?? 'number'
  const metric = req.query.metric ?? 'score'

  if (isEmptyBoard(board, category)) return res.json({ entries: [], pinnedEntry: null, isEmpty: true })

  const rank = RANK_SEED[board][category]
  const userInTopRange = rank <= 20
  const meHandle = user.name.toLowerCase().replace(/\s+/g, '_')
  const entries = makeEntries(category, metric, userInTopRange ? rank : 999, user.name, meHandle, user.elo)
  const pinnedEntry = !userInTopRange ? makePinnedEntry(metric, rank, user.name, meHandle, user.elo) : null

  res.json({ entries, pinnedEntry, isEmpty: false })
})

// Versus Room create/join. No real second player in this dev environment,
// so a host-created room auto-"joins" a simulated opponent after a short
// delay — stands in for a friend accepting the invite link. A real join
// (someone else's code) is genuine — the joiner becomes the opponent
// immediately. See docs/technical/known-gaps.md item 1.
const rooms = new Map()
const AUTO_JOIN_DELAY_MS = 7000

function toHandle(name) {
  return name.toLowerCase().replace(/\s+/g, '_')
}

function makeCode() {
  return `MEM-${Math.floor(1000 + Math.random() * 9000)}`
}

function makeSeed() {
  return Math.random().toString(36).slice(2, 10).toUpperCase()
}

app.get('/api/versus-room/available', (req, res) => {
  const activePublicRooms = []
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
  const defaultRooms = [
    { code: 'MEM-1204', roomName: 'Sequence Speed Masters', category: 'sequence', mode: 'versus-ranked', hostName: 'MasterMemory', hostElo: 1540, playerCount: 1, maxPlayers: 2, isPrivate: false },
    { code: 'MEM-3391', roomName: 'Chimpanzee Grid Challenge', category: 'grid', mode: 'versus-unranked', hostName: 'ProGamer_99', hostElo: 1420, playerCount: 1, maxPlayers: 2, isPrivate: false },
    { code: 'MEM-7720', roomName: 'Simon Color Arena', category: 'color', mode: 'versus-ranked', hostName: 'Elena_R', hostElo: 1390, playerCount: 1, maxPlayers: 2, isPrivate: false },
  ]
  res.json({ rooms: activePublicRooms.length > 0 ? activePublicRooms : defaultRooms })
})

app.post('/api/versus-room/quick-join', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const user = token ? decodeToken(token) : null
  if (!user || user.isGuest) return res.status(401).json({ message: 'Account required.' })

  let availableCode = null
  rooms.forEach((room, code) => {
    if (!room.isPrivate && !room.opponentJoined && room.host.name !== user.name) {
      availableCode = code
    }
  })

  if (availableCode) {
    const room = rooms.get(availableCode)
    room.opponent = { name: user.name, handle: toHandle(user.name), elo: user.elo, ready: true }
    room.opponentJoined = true
    return res.json({ room })
  }

  const code = makeCode()
  const host = { name: user.name, handle: toHandle(user.name), elo: user.elo, ready: true }
  const room = { code, link: `memoryarena.app/r/${code}`, seed: makeSeed(), category: 'sequence', mode: 'versus-ranked', difficulty: 'medium', roomName: 'Quick Join Room', isPrivate: false, host, opponent: null, opponentJoined: false }
  rooms.set(code, room)

  setTimeout(() => {
    const current = rooms.get(code)
    if (current && !current.opponentJoined) {
      current.opponent = { ...MOCK_OPPONENT, ready: true }
      current.opponentJoined = true
    }
  }, AUTO_JOIN_DELAY_MS)

  res.json({ room })
})

app.post('/api/versus-room', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const user = token ? decodeToken(token) : null
  if (!user || user.isGuest) return res.status(401).json({ message: 'Account required.' })

  const { category, mode, difficulty = 'medium', roomName, isPrivate } = req.body ?? {}
  const code = makeCode()
  const host = { name: user.name, handle: toHandle(user.name), elo: user.elo, ready: true }
  const room = { code, link: `memoryarena.app/r/${code}`, seed: makeSeed(), category, mode, difficulty, roomName, isPrivate: !!isPrivate, host, opponent: null, opponentJoined: false }
  rooms.set(code, room)

  setTimeout(() => {
    const current = rooms.get(code)
    if (current && !current.opponentJoined) {
      current.opponent = { ...MOCK_OPPONENT, ready: true }
      current.opponentJoined = true
    }
  }, AUTO_JOIN_DELAY_MS)

  res.json({ room })
})

app.post('/api/versus-room/:code/join', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const user = token ? decodeToken(token) : null
  if (!user || user.isGuest) return res.status(401).json({ message: 'Account required.' })

  const code = String(req.params.code).toUpperCase()
  const room = rooms.get(code)
  if (!room) return res.status(404).json({ message: 'Room not found.' })

  room.opponent = { name: user.name, handle: toHandle(user.name), elo: user.elo, ready: true }
  room.opponentJoined = true
  res.json({ room })
})

app.post('/api/versus-room/:code/leave', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const user = token ? decodeToken(token) : null
  const code = String(req.params.code).toUpperCase()
  const room = rooms.get(code)

  if (!room) return res.json({ room: null, hostTransferred: false })

  const isHostLeaving = user && room.host.name === user.name
  if (isHostLeaving) {
    if (room.opponent) {
      room.host = room.opponent
      room.opponent = null
      room.opponentJoined = false
      return res.json({ room, hostTransferred: true })
    } else {
      rooms.delete(code)
      return res.json({ room: null, hostTransferred: false })
    }
  } else {
    room.opponent = null
    room.opponentJoined = false
    return res.json({ room, hostTransferred: false })
  }
})

app.post('/api/versus-room/:code/toggle-privacy', (req, res) => {
  const code = String(req.params.code).toUpperCase()
  const room = rooms.get(code)
  if (!room) return res.status(404).json({ message: 'Room not found.' })
  room.isPrivate = !!req.body?.isPrivate
  res.json({ room })
})

app.get('/api/versus-room/:code', (req, res) => {
  const code = String(req.params.code).toUpperCase()
  const room = rooms.get(code)
  if (!room) return res.status(404).json({ message: 'Room not found.' })
  res.json({ room })
})

app.listen(PORT, () => {
  console.log(`[mock-server] fake API listening on http://localhost:${PORT}`)
})
