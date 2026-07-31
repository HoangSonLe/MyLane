import type { DifficultyMeta, GameMeta, ModeMeta } from './game-select.interface'
import { GameId, ModeId, DifficultyId } from '@/configs/enum'

function IconHash() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function IconLetters() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 19L10 5l6 14M6.5 14.5h7M18 8c0 0 .5 7 2 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconGrid() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}

function IconSequence() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="5" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="19" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M7.5 12h2M14.5 12h2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

export const GAMES: GameMeta[] = [
  {
    id: GameId.NUMBER,
    label: 'Number Memory',
    description: 'Recall growing digit sequences',
    icon: <IconHash />,
    elo: 1240,
    bestScore: 14,
    highestLevel: 14,
  },
  {
    id: GameId.ALPHABET,
    label: 'Alphabet Memory',
    description: 'Memorise letter sequences',
    icon: <IconLetters />,
    elo: 1185,
    bestScore: 12,
    highestLevel: 12,
  },
  {
    id: GameId.GRID,
    label: 'Grid Memory',
    description: 'Recall highlighted cell patterns',
    icon: <IconGrid />,
    elo: 1310,
    bestScore: 9,
    highestLevel: 9,
  },
  {
    id: GameId.SEQUENCE,
    label: 'Sequence Memory',
    description: 'Replay growing tile sequences',
    icon: <IconSequence />,
    elo: 1420,
    bestScore: 18,
    highestLevel: 18,
  },
]

export const MODES: ModeMeta[] = [
  { id: ModeId.SOLO_PRACTICE,   label: 'Solo Practice',    requiresAccount: false, versusFlow: false },
  { id: ModeId.SOLO_RANKED,     label: 'Solo Ranked',      requiresAccount: true,  versusFlow: false },
  { id: ModeId.VERSUS_RANKED,   label: 'Versus Ranked',    requiresAccount: true,  versusFlow: true  },
  { id: ModeId.VERSUS_UNRANKED, label: 'Versus Unranked',  requiresAccount: true,  versusFlow: true  },
]

export const DIFFICULTIES: DifficultyMeta[] = [
  { id: DifficultyId.EASY,       label: 'Easy'       },
  { id: DifficultyId.MEDIUM,     label: 'Medium'     },
  { id: DifficultyId.HARD,       label: 'Hard'       },
  { id: DifficultyId.SUPER_HARD, label: 'Super Hard' },
]
