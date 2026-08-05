import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracted from 4 identical inline implementations across Leaderboard,
 * Lobby, and Profile (friend rows + profile header).
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export const ALL_GAME_CATEGORIES = ['number', 'alphabet', 'grid', 'sequence', 'color'] as const

/**
 * Calculates overall Elo rating as the average of the 5 game categories per docs/gameplay/README.md.
 * docs/gameplay/README.md doesn't define a weighting scheme (see
 * docs/technical/known-gaps.md #12), so this averages only categories the
 * player has an actual Versus Ranked record for (a `category_elo` row is
 * only ever inserted by `finalize_versus_room` on that category's first
 * Ranked match) — a category never played isn't counted, instead of
 * silently dragging the average toward 1000.
 */
export function calculateOverallElo(
  eloEntries?: Array<{ category: string; elo?: number | null }> | null,
  fallbackElo: number = 1000,
): number {
  if (!eloEntries || eloEntries.length === 0) {
    return fallbackElo
  }
  const played = eloEntries.filter((entry) => typeof entry.elo === 'number')
  if (played.length === 0) {
    return fallbackElo
  }
  const total = played.reduce((acc, entry) => acc + (entry.elo as number), 0)
  return Math.round(total / played.length)
}

/**
 * Formats/localizes the user profile's joinedLabel (e.g. 'Joined Jun 2024', 'Joined recently', 'Member', 'Guest Session').
 */
export function formatJoinedLabel(joinedLabel?: string, locale: 'en' | 'vi' = 'en'): string {
  if (!joinedLabel) return ''
  if (locale === 'en') return joinedLabel

  if (joinedLabel === 'Joined recently' || joinedLabel === 'Joined Recently') return 'Tham gia gần đây'
  if (joinedLabel === 'Member') return 'Thành viên'
  if (joinedLabel === 'Guest Session') return 'Phiên khách'

  const joinedMatch = joinedLabel.match(/^Joined\s+([A-Za-z]+)\s+(\d{4})$/i)
  if (joinedMatch) {
    const monthMap: Record<string, string> = {
      jan: 'Thg 1', feb: 'Thg 2', mar: 'Thg 3', apr: 'Thg 4',
      may: 'Thg 5', jun: 'Thg 6', jul: 'Thg 7', aug: 'Thg 8',
      sep: 'Thg 9', oct: 'Thg 10', nov: 'Thg 11', dec: 'Thg 12',
    }
    const monthKey = joinedMatch[1].slice(0, 3).toLowerCase()
    const monthVi = monthMap[monthKey] || joinedMatch[1]
    return `Tham gia ${monthVi} ${joinedMatch[2]}`
  }

  return joinedLabel
}
