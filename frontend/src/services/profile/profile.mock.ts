import type { ProfileStats } from './profile.interface'

/**
 * Server-side seed for `/api/profile`. `username`/`handle`/`overallElo` are
 * overridden with the real signed-in user's session data by the handler —
 * these are just the fallback shape. Friends come from `/api/lobby/friends`
 * instead (same list Lobby uses), not from here.
 */
export const MOCK_PROFILE: ProfileStats = {
  username: 'Alex Rivera',
  handle: 'alexr',
  avatarUrl: undefined,
  joinedLabel: 'Joined Jun 2024',
  overallElo: 1487,
  categoryElo: [
    { category: 'number',   label: 'Number Memory',   elo: 1620, delta: +18 },
    { category: 'alphabet', label: 'Alphabet Memory',  elo: 1390, delta: -12 },
    { category: 'grid',     label: 'Grid Memory',      elo: 1510, delta:  +5 },
    { category: 'sequence', label: 'Sequence Memory',  elo: 1428, delta:  +0 },
    { category: 'color',    label: 'Color Memory',     elo: 1150, delta:  +9 },
  ],
  categoryBests: [
    { category: 'number',   label: 'Number',   practiceScore: 4200, practiceLevel: 10, rankedScore: 3860, rankedLevel: 10, highestLevel: 10 },
    { category: 'alphabet', label: 'Alphabet', practiceScore: 2950, practiceLevel: 10, rankedScore: 2640, rankedLevel: 10, highestLevel: 10 },
    { category: 'grid',     label: 'Grid',     practiceScore: 3540, practiceLevel: 10, rankedScore: 3110, rankedLevel: 10, highestLevel: 10 },
    { category: 'sequence', label: 'Sequence', practiceScore: 3220, practiceLevel: 10, rankedScore: 2980, rankedLevel: 10, highestLevel: 10 },
    { category: 'color',    label: 'Color',    practiceScore: 1480, practiceLevel: 6,  rankedScore: 1180, rankedLevel: 5,  highestLevel: 6  },
  ],
  totalGames: 284,
  wins: 148,
  losses: 112,
  draws: 24,
  matchHistory: [
    { id: 'm1',  category: 'number',   categoryLabel: 'Number',   mode: 'Solo Ranked',    outcome: 'win',  score: 3860, playedAt: 'Today' },
    { id: 'm2',  category: 'sequence', categoryLabel: 'Sequence', mode: 'Versus Ranked',  outcome: 'win',  score: 2980, opponentName: 'Mia Torres',  playerRoundScore: 4, opponentRoundScore: 3, eloChange: +18, playedAt: 'Today' },
    { id: 'm3',  category: 'alphabet', categoryLabel: 'Alphabet', mode: 'Versus Ranked',  outcome: 'loss', score: 2410, opponentName: 'Priya Mehta', playerRoundScore: 2, opponentRoundScore: 4, eloChange: -12, playedAt: 'Today' },
    { id: 'm4',  category: 'grid',     categoryLabel: 'Grid',     mode: 'Solo Practice',  outcome: 'win',  score: 3110, playedAt: 'Yesterday' },
    { id: 'm5',  category: 'number',   categoryLabel: 'Number',   mode: 'Versus Ranked',  outcome: 'win',  score: 3540, opponentName: 'Jake Norris', playerRoundScore: 5, opponentRoundScore: 2, eloChange: +14, playedAt: 'Yesterday' },
    { id: 'm6',  category: 'color',    categoryLabel: 'Color',    mode: 'Solo Practice',  outcome: 'win',  score: 1480, playedAt: 'Yesterday' },
    { id: 'm7',  category: 'alphabet', categoryLabel: 'Alphabet', mode: 'Solo Ranked',    outcome: 'loss', score: 2120, playedAt: '2d ago' },
    { id: 'm8',  category: 'grid',     categoryLabel: 'Grid',     mode: 'Versus Unranked', outcome: 'draw', score: 2640, opponentName: 'Sam Okafor',  playerRoundScore: 3, opponentRoundScore: 3, playedAt: '2d ago' },
    { id: 'm9',  category: 'number',   categoryLabel: 'Number',   mode: 'Solo Practice',  outcome: 'win',  score: 4200, playedAt: '3d ago' },
    { id: 'm10', category: 'sequence', categoryLabel: 'Sequence', mode: 'Versus Ranked',  outcome: 'loss', score: 2210, opponentName: 'Lena Park',   playerRoundScore: 1, opponentRoundScore: 4, eloChange: -20, playedAt: '3d ago' },
    { id: 'm11', category: 'grid',     categoryLabel: 'Grid',     mode: 'Solo Ranked',    outcome: 'win',  score: 2990, playedAt: '4d ago' },
    { id: 'm12', category: 'alphabet', categoryLabel: 'Alphabet', mode: 'Versus Ranked',  outcome: 'win',  score: 2640, opponentName: 'Jake Norris', playerRoundScore: 4, opponentRoundScore: 2, eloChange: +10, playedAt: '4d ago' },
  ],
}
