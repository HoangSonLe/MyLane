/**
 * Plain-JS mirror of src/mocks/leaderboard-handlers.ts — keep both in sync.
 */
export const NAMES = [
  ['Lena Park', 'lena_p'], ['Priya Mehta', 'priya.m'], ['Jake Norris', 'jake_n'],
  ['Mia Torres', 'mia_t'], ['Sam Okafor', 'samokafor'], ['Kai Tanaka', 'k_tanaka'],
  ['Sofia Reyes', 'sofia_r'], ['Omar Hassan', 'omar_h'], ['Zoe Chen', 'zoe_c'],
  ['Leo Müller', 'leo_m'], ['Aya Nakamura', 'aya_n'], ['Tom Obi', 'tom_obi'],
  ['Nina Patel', 'nina_p'], ['Max Krueger', 'max_k'], ['Isla Yılmaz', 'isla_y'],
  ['Eli Johansson', 'eli_j'], ['Riya Sharma', 'riya_s'], ['Finn Larsen', 'finn_l'],
  ['Nour Abbas', 'nour_a'], ['Cleo Martin', 'cleo_m'],
]

export const BASE_SCORE = { number: 9800, alphabet: 7400, grid: 8600, sequence: 8200, color: 6800 }

export const RANK_SEED = {
  'global-alltime': { number: 47, alphabet: 83, grid: 62, sequence: 31, color: 55 },
  weekly:           { number: 12, alphabet: 28, grid: 19, sequence:  8, color: 21 },
  monthly:          { number: 24, alphabet: 51, grid: 38, sequence: 17, color: 40 },
  friends:          { number:  3, alphabet:  2, grid:  4, sequence:  1, color:  5 },
  top100:           { number: 47, alphabet: 83, grid: 62, sequence: 31, color: 55 },
  endless:          { number: 14, alphabet: 99, grid: 21, sequence: 11, color: 33 },
}

export function isEmptyBoard(board, category) {
  return board === 'endless' && category === 'alphabet'
}

export function makeEntries(category, metric, currentUserRank, meName, meHandle, meElo) {
  const base = metric === 'score' ? BASE_SCORE[category] : 1900
  const entries = NAMES.map(([username, handle], i) => {
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

export function makePinnedEntry(metric, rank, meName, meHandle, meElo) {
  return { rank, userId: 'current-user', username: meName, handle: meHandle, score: metric === 'score' ? 3860 : meElo, elo: meElo, isCurrentUser: true }
}
