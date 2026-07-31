import type { BoardType, Category, LeaderboardEntry, SortMetric } from './leaderboard.interface'

export const BOARD_TABS: { id: BoardType; label: string; short: string }[] = [
  { id: 'global-alltime', label: 'Global All-time', short: 'All-time' },
  { id: 'weekly',         label: 'Weekly',          short: 'Weekly' },
  { id: 'monthly',        label: 'Monthly',         short: 'Monthly' },
  { id: 'friends',        label: 'Friends',         short: 'Friends' },
  { id: 'top100',         label: 'Top 100',         short: 'Top 100' },
  { id: 'endless',        label: 'Endless',         short: 'Endless' },
]

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'number',   label: 'Number' },
  { id: 'alphabet', label: 'Alphabet' },
  { id: 'grid',     label: 'Grid' },
  { id: 'sequence', label: 'Sequence' },
]

// ─── Mock data generator ──────────────────────────────────────────

export function makeMockEntries(
  board: BoardType,
  category: Category,
  metric: SortMetric,
  currentUserRank: number,
): LeaderboardEntry[] {
  const NAMES = [
    ['Lena Park', 'lena_p'],
    ['Priya Mehta', 'priya.m'],
    ['Jake Norris', 'jake_n'],
    ['Mia Torres', 'mia_t'],
    ['Sam Okafor', 'samokafor'],
    ['Kai Tanaka', 'k_tanaka'],
    ['Sofia Reyes', 'sofia_r'],
    ['Omar Hassan', 'omar_h'],
    ['Zoe Chen', 'zoe_c'],
    ['Leo Müller', 'leo_m'],
    ['Aya Nakamura', 'aya_n'],
    ['Tom Obi', 'tom_obi'],
    ['Nina Patel', 'nina_p'],
    ['Max Krueger', 'max_k'],
    ['Isla Yılmaz', 'isla_y'],
    ['Eli Johansson', 'eli_j'],
    ['Riya Sharma', 'riya_s'],
    ['Finn Larsen', 'finn_l'],
    ['Nour Abbas', 'nour_a'],
    ['Cleo Martin', 'cleo_m'],
  ]

  const baseScore = metric === 'score'
    ? { number: 9800, alphabet: 7400, grid: 8600, sequence: 8200 }[category]
    : 1900

  const entries: LeaderboardEntry[] = []
  for (let i = 0; i < 20; i++) {
    const [username, handle] = NAMES[i]
    const decay = metric === 'score' ? i * 140 + Math.floor(Math.random() * 60) : i * 22 + Math.floor(Math.random() * 10)
    entries.push({
      rank: i + 1,
      userId: `user-${i + 1}`,
      username,
      handle,
      score: baseScore - decay,
      elo: 1900 - i * 22,
      isCurrentUser: false,
    })
  }

  // Splice in current user at their rank
  if (currentUserRank <= 20) {
    const idx = currentUserRank - 1
    entries[idx] = {
      rank: currentUserRank,
      userId: 'current-user',
      username: 'Alex Rivera',
      handle: 'alexr',
      score: entries[idx]?.score ?? baseScore - currentUserRank * 140,
      elo: entries[idx]?.elo ?? 1900 - currentUserRank * 22,
      isCurrentUser: true,
    }
  }

  return entries
}

export function makeCurrentUserEntry(
  board: BoardType,
  category: Category,
  metric: SortMetric,
  rank: number,
): LeaderboardEntry {
  return {
    rank,
    userId: 'current-user',
    username: 'Alex Rivera',
    handle: 'alexr',
    score: metric === 'score' ? 3860 : 0,
    elo: 1487,
    isCurrentUser: true,
  }
}

// ─── Mock boards that should show "empty" (no entries) ───────────
export function isEmptyBoard(board: BoardType, category: Category): boolean {
  return board === 'endless' && category === 'alphabet'
}

// Per-board current-user rank (mock)
export function getCurrentUserRank(board: BoardType, category: Category): number {
  const seed: Record<BoardType, Record<Category, number>> = {
    'global-alltime': { number: 47, alphabet: 83, grid: 62, sequence: 31 },
    'weekly':         { number: 12, alphabet: 28, grid: 19, sequence:  8 },
    'monthly':        { number: 24, alphabet: 51, grid: 38, sequence: 17 },
    'friends':        { number:  3, alphabet:  2, grid:  4, sequence:  1 },
    'top100':         { number: 47, alphabet: 83, grid: 62, sequence: 31 },
    'endless':        { number: 14, alphabet: 99, grid: 21, sequence: 11 },
  }
  return seed[board][category]
}
