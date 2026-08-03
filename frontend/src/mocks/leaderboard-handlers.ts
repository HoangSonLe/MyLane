import { http, HttpResponse } from 'msw'
import { decodeToken } from './fake-users'
import type { BoardType, Category, LeaderboardEntry, SortMetric } from '@/services/leaderboard/leaderboard.interface'

/**
 * Fake backend for Leaderboard (docs/ui/screen-interface-spec.md §
 * Leaderboard). Guests get a 401 — App.tsx already blocks guest navigation
 * here, this is defensive (matches Lobby/Versus Room).
 *
 * The 20 "other players" are a deterministic seed, not randomized per
 * request — a real board doesn't reshuffle every time you look at it. Only
 * the signed-in player's own row is dynamic (name/handle/elo from session).
 */
const NAMES: [string, string][] = [
  ['Lena Park', 'lena_p'], ['Priya Mehta', 'priya.m'], ['Jake Norris', 'jake_n'],
  ['Mia Torres', 'mia_t'], ['Sam Okafor', 'samokafor'], ['Kai Tanaka', 'k_tanaka'],
  ['Sofia Reyes', 'sofia_r'], ['Omar Hassan', 'omar_h'], ['Zoe Chen', 'zoe_c'],
  ['Leo Müller', 'leo_m'], ['Aya Nakamura', 'aya_n'], ['Tom Obi', 'tom_obi'],
  ['Nina Patel', 'nina_p'], ['Max Krueger', 'max_k'], ['Isla Yılmaz', 'isla_y'],
  ['Eli Johansson', 'eli_j'], ['Riya Sharma', 'riya_s'], ['Finn Larsen', 'finn_l'],
  ['Nour Abbas', 'nour_a'], ['Cleo Martin', 'cleo_m'],
]

const BASE_SCORE: Record<Category, number> = {
  number: 9800, alphabet: 7400, grid: 8600, sequence: 8200, color: 6800,
}

const RANK_SEED: Record<BoardType, Record<Category, number>> = {
  'global-alltime': { number: 47, alphabet: 83, grid: 62, sequence: 31, color: 55 },
  weekly:           { number: 12, alphabet: 28, grid: 19, sequence:  8, color: 21 },
  monthly:          { number: 24, alphabet: 51, grid: 38, sequence: 17, color: 40 },
  friends:          { number:  3, alphabet:  2, grid:  4, sequence:  1, color:  5 },
  top100:           { number: 47, alphabet: 83, grid: 62, sequence: 31, color: 55 },
  endless:          { number: 14, alphabet: 99, grid: 21, sequence: 11, color: 33 },
}

function isEmptyBoard(board: BoardType, category: Category): boolean {
  return board === 'endless' && category === 'alphabet'
}

function makeEntries(category: Category, metric: SortMetric, currentUserRank: number, meName: string, meHandle: string, meElo: number): LeaderboardEntry[] {
  const base = metric === 'score' ? BASE_SCORE[category] : 1900
  const entries: LeaderboardEntry[] = NAMES.map(([username, handle], i) => {
    const decay = metric === 'score' ? i * 140 + (i * 37) % 60 : i * 22 + (i * 7) % 10
    return { rank: i + 1, userId: `user-${i + 1}`, username, handle, score: base - decay, elo: 1900 - i * 22 }
  })

  if (currentUserRank <= entries.length) {
    const idx = currentUserRank - 1
    entries[idx] = {
      rank: currentUserRank,
      userId: 'current-user',
      username: meName,
      handle: meHandle,
      score: metric === 'score' ? (entries[idx]?.score ?? base - currentUserRank * 140) : meElo,
      elo: meElo,
      isCurrentUser: true,
    }
  }
  return entries
}

function makePinnedEntry(metric: SortMetric, rank: number, meName: string, meHandle: string, meElo: number): LeaderboardEntry {
  return { rank, userId: 'current-user', username: meName, handle: meHandle, score: metric === 'score' ? 3860 : meElo, elo: meElo, isCurrentUser: true }
}

export const leaderboardHandlers = [
  http.get('/api/leaderboard', ({ request }) => {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = token ? decodeToken(token) : null
    if (!user || user.isGuest) {
      return HttpResponse.json({ message: 'Account required.' }, { status: 401 })
    }

    const url = new URL(request.url)
    const board = (url.searchParams.get('board') ?? 'global-alltime') as BoardType
    const category = (url.searchParams.get('category') ?? 'number') as Category
    const metric = (url.searchParams.get('metric') ?? 'score') as SortMetric

    const isEmpty = isEmptyBoard(board, category)
    if (isEmpty) return HttpResponse.json({ entries: [], pinnedEntry: null, isEmpty: true })

    const rank = RANK_SEED[board][category]
    const userInTopRange = rank <= 20
    const entries = makeEntries(category, metric, userInTopRange ? rank : 999, user.name, user.name.toLowerCase().replace(/\s+/g, '_'), user.elo)
    const pinnedEntry = !userInTopRange ? makePinnedEntry(metric, rank, user.name, user.name.toLowerCase().replace(/\s+/g, '_'), user.elo) : null

    return HttpResponse.json({ entries, pinnedEntry, isEmpty: false })
  }),
]
