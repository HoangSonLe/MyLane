import type { BoardType, Category } from './leaderboard.interface'

export const BOARD_TABS: { id: BoardType; label: string; short: string }[] = [
  { id: 'global-alltime', label: 'Global All-time', short: 'All-time' },
  { id: 'weekly',         label: 'Weekly',          short: 'Weekly' },
  { id: 'monthly',        label: 'Monthly',         short: 'Monthly' },
  { id: 'friends',        label: 'Friends',         short: 'Friends' },
  { id: 'top100',         label: 'Top 100',         short: 'Top 100' },
  { id: 'endless',        label: 'Endless',         short: 'Endless' },
]

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'color',    label: 'Color' },
  { id: 'number',   label: 'Number' },
  { id: 'alphabet', label: 'Alphabet' },
  { id: 'grid',     label: 'Grid' },
  { id: 'sequence', label: 'Sequence' },
]
