import { http, HttpResponse } from 'msw'
import { decodeToken } from './fake-users'
import { calculateEloDelta, computeScore } from '@/services/gameplay/game-rules'
import { GAME_STATS_SEED } from '@/services/game-select/game-select.mock'
import { MOCK_LAST_PLAYED } from '@/services/home/home.mock'
import { MOCK_PROFILE } from '@/services/profile/profile.mock'
import { GameId, ModeId } from '@/configs/enum'
import type { GameResultInput, ResultData } from '@/services/result/result.interface'

const GAME_LABELS: Record<GameId, string> = {
  [GameId.NUMBER]: 'Number Memory',
  [GameId.ALPHABET]: 'Alphabet Memory',
  [GameId.GRID]: 'Grid Memory',
  [GameId.SEQUENCE]: 'Sequence Memory',
  [GameId.COLOR]: 'Color Memory',
}

const MODE_LABELS: Record<ModeId, string> = {
  [ModeId.SOLO_PRACTICE]: 'Solo Practice',
  [ModeId.SOLO_RANKED]: 'Solo Ranked',
  [ModeId.SOLO_ENDLESS]: 'Solo Endless',
  [ModeId.VERSUS_RANKED]: 'Versus Ranked',
  [ModeId.VERSUS_UNRANKED]: 'Versus Unranked',
}

/**
 * Fake backend for submitting a just-finished Solo session
 * (docs/gameplay/README.md § Scoring Formula; docs/technical/known-gaps.md
 * #5). Computes the final score using the same `computeScore()` the client
 * uses for its offline fallback, and — for a real account — updates the
 * in-memory GAME_STATS_SEED / MOCK_LAST_PLAYED so Home/Game Select reflect
 * the run that was just played. Guests get a computed score back but
 * nothing is persisted (docs/product: guest progress has no server-side
 * save). Versus results aren't submitted through here — VersusGameplayScreen
 * has its own separate (still-unwired) result/Elo path, out of scope.
 */
export const resultHandlers = [
  http.post('/api/game/result', async ({ request }) => {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = token ? decodeToken(token) : null

    const input = (await request.json()) as GameResultInput
    const isRanked = input.mode === ModeId.SOLO_RANKED || input.mode === ModeId.VERSUS_RANKED
    const isVersusRanked = input.mode === ModeId.VERSUS_RANKED
    const breakdown = computeScore({
      game: input.game,
      difficulty: input.difficulty,
      roundsCleared: input.roundsCleared,
      maxConsecutiveItems: input.maxConsecutiveItems,
      bonusSeconds: input.bonusSeconds,
      perfect: input.perfect,
      completedAllLevels: input.completedAllLevels,
      isRanked,
    })

    const isGuest = !user || user.isGuest
    // Practice and Endless also persist stats now — only Elo (isVersusRanked
    // above) stays exclusively Ranked. See game.supabase.ts's shouldPersist
    // for the real-backend equivalent.
    const shouldPersist = !isGuest && (isRanked || input.mode === ModeId.SOLO_PRACTICE || input.mode === ModeId.SOLO_ENDLESS)
    const outcome = input.outcome ?? (input.perfect || input.roundsCleared >= 5 ? 'win' : 'loss')
    const previousElo = isVersusRanked && shouldPersist ? (user?.elo ?? 1000) : undefined
    const eloChange = previousElo === undefined
      ? undefined
      : calculateEloDelta(previousElo, input.opponentElo ?? 1000, outcome)
    const statsEntry = GAME_STATS_SEED.find((s) => s.id === input.game)
    const previousBestScore = shouldPersist && statsEntry ? statsEntry.bestScore : null
    const previousBestLevel = shouldPersist && statsEntry ? statsEntry.highestLevel : null
    const isNewRecord = shouldPersist && statsEntry
      ? breakdown.score > (statsEntry.bestScore ?? 0) || input.levelReached > (statsEntry.highestLevel ?? 0)
      : false

    if (shouldPersist && statsEntry) {
      statsEntry.bestScore = Math.max(statsEntry.bestScore ?? 0, breakdown.score)
      statsEntry.highestLevel = Math.max(statsEntry.highestLevel ?? 0, input.levelReached)
      MOCK_LAST_PLAYED.game = GAME_LABELS[input.game]
      MOCK_LAST_PLAYED.mode = MODE_LABELS[input.mode]
      MOCK_LAST_PLAYED.score = input.levelReached
      MOCK_LAST_PLAYED.maxScore = 10
      MOCK_LAST_PLAYED.roundsPlayed = input.roundsCleared

      // Sync to ProfileStats
      MOCK_PROFILE.totalGames += 1
      if (outcome === 'win') MOCK_PROFILE.wins += 1
      else if (outcome === 'draw') MOCK_PROFILE.draws += 1
      else MOCK_PROFILE.losses += 1

      const catLabelShort = GAME_LABELS[input.game].replace(' Memory', '')
      MOCK_PROFILE.matchHistory.unshift({
        id: `m_${Date.now()}`,
        category: input.game,
        categoryLabel: catLabelShort,
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

    const result: ResultData = {
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
    }

    return HttpResponse.json({ result })
  }),
]
