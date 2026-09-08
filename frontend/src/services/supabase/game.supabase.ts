import { getSupabaseClient } from './supabase.client'
import type { GameResultInput, ResultData } from '../result/result.interface'
import type { BoardType, Category, LeaderboardBoard, LeaderboardEntry, SortMetric } from '../leaderboard/leaderboard.interface'
import type { GameStats } from '../game-select/game-select.interface'
import { computeScore } from '../gameplay/game-rules'
import { ModeId, GameId } from '@/configs/enum'

const ALL_CATEGORIES = [GameId.NUMBER, GameId.ALPHABET, GameId.GRID, GameId.SEQUENCE, GameId.COLOR]

const GAME_LABELS: Record<string, string> = {
  number: 'Number Memory',
  alphabet: 'Alphabet Memory',
  grid: 'Grid Memory',
  sequence: 'Sequence Memory',
  color: 'Color Memory',
}

const MODE_LABELS: Record<string, string> = {
  'solo-practice': 'Solo Practice',
  'solo-ranked': 'Solo Ranked',
  'versus-ranked': 'Versus Ranked',
  'versus-unranked': 'Versus Unranked',
}

function throwIfSupabaseError(error: any, context: string): void {
  if (error) throw new Error(`${context}: ${error.message || error.details || 'Supabase request failed'}`)
}

/** Calendar-week (Monday 00:00 UTC) / calendar-month (1st 00:00 UTC) reset boundary — see getLeaderboard's weekly/monthly branch. */
function getPeriodStart(board: 'weekly' | 'monthly'): string {
  const now = new Date()
  if (board === 'monthly') {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
  }
  const dayIndex = (now.getUTCDay() + 6) % 7 // Mon=0 .. Sun=6
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - dayIndex)).toISOString()
}

export const gameSupabaseService = {
  /**
   * Submit game result to Supabase `match_history`, `category_bests`, `category_elo`, and `profiles`
   */
  async submitResult(input: GameResultInput): Promise<ResultData> {
    const supabase = getSupabaseClient()
    const usesRankedScoring = input.mode === ModeId.SOLO_RANKED || input.mode === ModeId.VERSUS_RANKED
    const isVersusRanked = input.mode === ModeId.VERSUS_RANKED
    // Practice and Endless also update category_bests (practice_score/
    // practice_level, and highest_level for the Level-10 Endless unlock +
    // Game Select's Starting Level picker) — just never category_elo, which
    // stays exclusively Versus Ranked (isVersusRanked below), per
    // docs/gameplay/README.md "Elo ... calculated only for Versus Ranked".
    const shouldPersist = usesRankedScoring || input.mode === ModeId.SOLO_PRACTICE || input.mode === ModeId.SOLO_ENDLESS
    const breakdown = computeScore({ ...input, isRanked: usesRankedScoring })

    let previousBestScore: number | null = null
    let previousBestLevel: number | null = null
    let isNewRecord = false
    let eloChange: number | undefined
    let previousElo: number | undefined

    if (supabase) {
      const { data: userData, error: authError } = await supabase.auth.getUser()
      throwIfSupabaseError(authError, 'Read authenticated user')
      const userId = userData?.user?.id

      if (userId && shouldPersist) {
        // Solo outcome (docs/gameplay/README.md § Accounts): a run counts as
        // a win only when it completed Level 10; every other ending is a
        // loss. Versus passes its server-owned outcome explicitly.
        let outcome = input.outcome ?? (input.completedAllLevels ? 'win' : 'loss')
        const catLabelShort = (GAME_LABELS[input.game] || input.game).replace(' Memory', '')
        const dbMode = (input.mode as string).replace(/-/g, '_')
        const dbDifficulty = (input.difficulty as string).replace(/-/g, '_')

        // 1. Fetch previous category best
        const { data: prevBest, error: prevBestError } = await supabase
          .from('category_bests')
          .select('*')
          .eq('user_id', userId)
          .eq('category', input.game)
          .maybeSingle()
        throwIfSupabaseError(prevBestError, 'Read previous category best')

        // category_bests tracks Solo Ranked and Versus Ranked bests separately
        // (docs/gameplay/README.md "best score ... per category + mode") — see
        // the category_bests table in database/schema.sql.
        if (prevBest) {
          previousBestScore = usesRankedScoring
            ? (isVersusRanked ? prevBest.versus_ranked_score : prevBest.solo_ranked_score)
            : prevBest.practice_score
          previousBestLevel = prevBest.highest_level
        }

        isNewRecord =
          previousBestScore === null ||
          breakdown.score > (previousBestScore || 0) ||
          input.levelReached > (previousBestLevel || 0)

        // 2. Elo belongs exclusively to Versus Ranked.
        if (isVersusRanked) {
          if (!input.matchId) {
            throw new Error('Versus Ranked result requires a server match ID')
          }

          const { data: existingElo, error: eloReadError } = await supabase
            .from('category_elo')
            .select('elo')
            .eq('user_id', userId)
            .eq('category', input.game)
            .maybeSingle()
          throwIfSupabaseError(eloReadError, 'Read category Elo')

          const { data: matchRoom, error: matchRoomError } = await supabase
            .from('versus_rooms')
            .select('host_id, guest_id, winner_id, status, host_elo_delta, guest_elo_delta')
            .eq('match_id', input.matchId)
            .maybeSingle()
          throwIfSupabaseError(matchRoomError, 'Read authoritative Versus result')
          if (!matchRoom || matchRoom.status !== 'finished') {
            throw new Error('Versus result is not finalized by the server')
          }
          const isHost = matchRoom.host_id === userId
          if (!isHost && matchRoom.guest_id !== userId) throw new Error('Not a match participant')
          outcome = matchRoom.winner_id === null
            ? 'draw'
            : matchRoom.winner_id === userId ? 'win' : 'loss'
          const serverDelta = isHost ? matchRoom.host_elo_delta || 0 : matchRoom.guest_elo_delta || 0
          eloChange = serverDelta
          const currentElo = existingElo?.elo ?? 1000
          previousElo = currentElo - serverDelta
        }

        const historyValues = {
          user_id: userId,
          match_id: input.matchId || null,
          idempotency_key: input.matchId || null,
          category: input.game,
          category_label: catLabelShort,
          mode: dbMode,
          difficulty: dbDifficulty,
          outcome,
          score: breakdown.score,
          level_reached: input.levelReached,
          rounds_cleared: input.roundsCleared,
          bonus_seconds: input.bonusSeconds,
          perfect: input.perfect,
          completed_all_levels: input.completedAllLevels,
          opponent_name: input.versusComparison?.opponentName || null,
          player_round_score: input.versusComparison?.playerScore ?? null,
          opponent_round_score: input.versusComparison?.opponentScore ?? null,
          elo_change: eloChange ?? 0,
          played_at: new Date().toISOString(),
        }

        // 3. Natural Versus completion updates the server-created history row;
        // retries cannot create a second row or apply Elo twice.
        if (input.matchId) {
          const { data: existingHistory, error: historyReadError } = await supabase
            .from('match_history')
            .select('id')
            .eq('user_id', userId)
            .eq('match_id', input.matchId)
            .maybeSingle()
          throwIfSupabaseError(historyReadError, 'Read Versus match history')
          if (existingHistory) {
            const { error: historyUpdateError } = await supabase
              .from('match_history')
              .update({
                score: breakdown.score,
                level_reached: input.levelReached,
                rounds_cleared: input.roundsCleared,
                bonus_seconds: input.bonusSeconds,
                perfect: input.perfect,
                completed_all_levels: input.completedAllLevels,
                ...(input.versusComparison
                  ? {
                      opponent_name: input.versusComparison.opponentName,
                      player_round_score: input.versusComparison.playerScore,
                      opponent_round_score: input.versusComparison.opponentScore,
                    }
                  : {}),
              })
              .eq('id', existingHistory.id)
              .eq('user_id', userId)
            throwIfSupabaseError(historyUpdateError, 'Update Versus match history')
          } else {
            const { error: historyInsertError } = await supabase.from('match_history').insert(historyValues)
            throwIfSupabaseError(historyInsertError, 'Insert Versus match history')
          }
        } else {
          const { error: historyInsertError } = await supabase.from('match_history').insert(historyValues)
          throwIfSupabaseError(historyInsertError, 'Insert match history')
        }

        // 4. Upsert category bests — solo_ranked_*/versus_ranked_* stay
        // independent; ranked_score/ranked_level are DB-generated
        // (GREATEST of the two) and must not be written here.
        const isSoloRanked = usesRankedScoring && !isVersusRanked
        const newPracticeScore = Math.max(prevBest?.practice_score || 0, !usesRankedScoring ? breakdown.score : 0)
        const newSoloRankedScore = Math.max(prevBest?.solo_ranked_score || 0, isSoloRanked ? breakdown.score : 0)
        const newVersusRankedScore = Math.max(prevBest?.versus_ranked_score || 0, isVersusRanked ? breakdown.score : 0)
        const newHighestLevel = Math.max(prevBest?.highest_level || 0, input.levelReached)

        const { error: bestWriteError } = await supabase.from('category_bests').upsert(
          {
            user_id: userId,
            category: input.game,
            practice_score: newPracticeScore,
            practice_level: Math.max(prevBest?.practice_level || 0, !usesRankedScoring ? input.levelReached : 1),
            solo_ranked_score: newSoloRankedScore,
            solo_ranked_level: Math.max(prevBest?.solo_ranked_level || 0, isSoloRanked ? input.levelReached : 1),
            versus_ranked_score: newVersusRankedScore,
            versus_ranked_level: Math.max(prevBest?.versus_ranked_level || 0, isVersusRanked ? input.levelReached : 1),
            highest_level: newHighestLevel,
            // Endless unlock flag (docs: "completes Level 10") — sticky once earned.
            completed_level_10: Boolean(prevBest?.completed_level_10) || input.completedAllLevels,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,category' }
        )
        throwIfSupabaseError(bestWriteError, 'Update category best')
      }
    }

    return {
      game: GAME_LABELS[input.game] || input.game,
      mode: input.mode,
      modeLabel: MODE_LABELS[input.mode] || input.mode,
      score: breakdown.score,
      levelReached: input.levelReached,
      previousBestScore,
      previousBestLevel,
      isNewRecord,
      rankedBreakdown: usesRankedScoring ? breakdown : undefined,
      eloChange,
      previousElo,
    }
  },

  /**
   * Fetch per-category Elo/best-score/highest-level for Game Select. Only
   * Ranked play ever writes `category_bests`/`category_elo` (see
   * submitResult's `shouldPersist` gate above — docs/gameplay/README.md
   * "Only Ranked games count toward records/leaderboard"), so a category
   * with no row here genuinely has no Ranked history yet: bestScore/
   * highestLevel come back `null` rather than a fabricated number —
   * GameCard/ModeChip already render that as "—" / "Level 1".
   */
  async getStats(): Promise<GameStats[]> {
    const supabase = getSupabaseClient()
    if (!supabase) return []

    const { data: userData, error: authError } = await supabase.auth.getUser()
    throwIfSupabaseError(authError, 'Read authenticated user')
    const userId = userData?.user?.id
    if (!userId) return []

    const [
      { data: eloRows, error: eloError },
      { data: bestRows, error: bestError },
    ] = await Promise.all([
      supabase.from('category_elo').select('*').eq('user_id', userId),
      supabase.from('category_bests').select('*').eq('user_id', userId),
    ])
    throwIfSupabaseError(eloError, 'Read category Elo')
    throwIfSupabaseError(bestError, 'Read category bests')

    const eloMap = new Map((eloRows || []).map((e: any) => [e.category, e]))
    const bestMap = new Map((bestRows || []).map((b: any) => [b.category, b]))

    return ALL_CATEGORIES.map((id) => {
      const elo = eloMap.get(id)
      const best = bestMap.get(id)
      return {
        id,
        elo: elo?.elo || 1000,
        bestScore: best?.ranked_score ?? null,
        highestLevel: best?.highest_level ?? null,
        completedLevel10: Boolean(best?.completed_level_10),
      }
    })
  },

  /**
   * Fetch Leaderboard Rankings from Supabase
   */
  async getLeaderboard(params: {
    board: BoardType
    category: Category
    metric: SortMetric
  }): Promise<LeaderboardBoard> {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return { entries: [], pinnedEntry: null, isEmpty: true }
    }

    const { data: userData } = await supabase.auth.getUser()
    const currentUserId = userData?.user?.id

    let allowedUserIds: string[] | null = null

    // If Friends board: fetch accepted friend IDs
    if (params.board === 'friends' && currentUserId) {
      const { data: friendships } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`)

      const friendIds = (friendships || []).map((f: any) =>
        f.requester_id === currentUserId ? f.addressee_id : f.requester_id
      )
      allowedUserIds = [currentUserId, ...friendIds]
    }

    let entries: LeaderboardEntry[] = []

    // docs/gameplay/README.md § Endless Mode: "Has its own leaderboard
    // (ranked by highest item count / beginCount reached)" — that depth
    // lives in match_history.rounds_cleared per Endless run, not in
    // category_bests (which Endless never advances beyond its unlock
    // level for). No pre-aggregated "best Endless depth" column exists yet,
    // so this aggregates client-side over recent Endless runs; a
    // category_bests column updated at submit-time would scale better if
    // this list ever needs to look further back than the last ~500 runs.
    if (params.board === 'endless') {
      const { data: rows } = await supabase
        .from('match_history')
        .select('user_id, rounds_cleared, profiles!inner(name, handle, avatar_url)')
        .eq('category', params.category)
        .eq('mode', 'solo_endless')
        .order('rounds_cleared', { ascending: false })
        .limit(500)

      const bestPerUser = new Map<string, any>()
      for (const row of rows || []) {
        if (!bestPerUser.has(row.user_id)) bestPerUser.set(row.user_id, row)
      }

      entries = [...bestPerUser.values()]
        .slice(0, 100)
        .map((row: any, index: number) => ({
          rank: index + 1,
          userId: row.user_id,
          username: row.profiles?.name || 'Player',
          handle: row.profiles?.handle || 'player',
          avatarUrl: row.profiles?.avatar_url || undefined,
          score: row.rounds_cleared || 0,
          elo: 1000,
          isCurrentUser: row.user_id === currentUserId,
        }))
    } else if (params.board === 'weekly' || params.board === 'monthly') {
      // docs/gameplay/README.md: "Weekly (resets weekly), Monthly (resets
      // monthly)" — reset boundary assumed calendar week (Mon 00:00 UTC) /
      // calendar month (1st 00:00 UTC); not specified further in docs, so
      // this is a judgment call, not a confirmed design decision. Only
      // Ranked matches count (same "Only Ranked ... records/leaderboard"
      // rule as Global All-time), best single score per user within the
      // period — computed from match_history since category_bests only
      // tracks all-time bests, not a rolling window.
      const periodStart = getPeriodStart(params.board)
      let query = supabase
        .from('match_history')
        .select('user_id, score, profiles!inner(name, handle, avatar_url)')
        .eq('category', params.category)
        .in('mode', ['solo_ranked', 'versus_ranked'])
        .gte('played_at', periodStart)
        .order('score', { ascending: false })
        .limit(500)

      if (allowedUserIds) {
        query = query.in('user_id', allowedUserIds)
      }

      const { data: rows } = await query

      const bestPerUser = new Map<string, any>()
      for (const row of rows || []) {
        if (!bestPerUser.has(row.user_id)) bestPerUser.set(row.user_id, row)
      }

      entries = [...bestPerUser.values()]
        .slice(0, 100)
        .map((row: any, index: number) => ({
          rank: index + 1,
          userId: row.user_id,
          username: row.profiles?.name || 'Player',
          handle: row.profiles?.handle || 'player',
          avatarUrl: row.profiles?.avatar_url || undefined,
          score: row.score || 0,
          elo: 1000,
          isCurrentUser: row.user_id === currentUserId,
        }))
    } else if (params.metric === 'elo') {
      // Sort by Elo Rating (primary: elo DESC, secondary tie-breaker: user_id ASC)
      let query = supabase
        .from('category_elo')
        .select('user_id, elo, profiles!inner(name, handle, avatar_url)')
        .eq('category', params.category)
        .order('elo', { ascending: false })
        .order('user_id', { ascending: true })
        .limit(100)

      if (allowedUserIds) {
        query = query.in('user_id', allowedUserIds)
      }

      const { data: rows } = await query

      entries = (rows || []).map((row: any, index: number) => ({
        rank: index + 1,
        userId: row.user_id,
        username: row.profiles?.name || 'Player',
        handle: row.profiles?.handle || 'player',
        avatarUrl: row.profiles?.avatar_url || undefined,
        score: 0,
        elo: row.elo || 1000,
        isCurrentUser: row.user_id === currentUserId,
      }))
    } else {
      // Sort by High Score (primary: ranked_score DESC, secondary tie-breaker: user_id ASC)
      let query = supabase
        .from('category_bests')
        .select('user_id, ranked_score, profiles!inner(name, handle, avatar_url), category_elo(elo)')
        .eq('category', params.category)
        .order('ranked_score', { ascending: false })
        .order('user_id', { ascending: true })
        .limit(100)

      if (allowedUserIds) {
        query = query.in('user_id', allowedUserIds)
      }

      const { data: rows } = await query

      entries = (rows || []).map((row: any, index: number) => {
        const eloVal = Array.isArray(row.category_elo)
          ? row.category_elo[0]?.elo || 1000
          : (row.category_elo as any)?.elo || 1000

        return {
          rank: index + 1,
          userId: row.user_id,
          username: row.profiles?.name || 'Player',
          handle: row.profiles?.handle || 'player',
          avatarUrl: row.profiles?.avatar_url || undefined,
          // docs/gameplay/README.md: "Only Ranked games count toward
          // records/leaderboard" — practice_score must never leak in here,
          // even as a fallback (a Practice-only player showing their
          // practice_score at a low rank reads as a data bug, not a
          // feature).
          score: row.ranked_score || 0,
          elo: eloVal,
          isCurrentUser: row.user_id === currentUserId,
        }
      })
    }

    // Fallback: If no records found for specific category metric, query profiles table directly.
    // Not for Endless/Weekly/Monthly — an empty board there must stay empty
    // (docs: proper "no data yet" empty state), not silently substitute a
    // generic all-time Elo-sorted profile list mislabeled as that board.
    const isPeriodOrEndlessBoard = params.board === 'endless' || params.board === 'weekly' || params.board === 'monthly'
    if (entries.length === 0 && !isPeriodOrEndlessBoard) {
      let profileQuery = supabase
        .from('profiles')
        .select('id, name, handle, avatar_url, overall_elo')
        .order('overall_elo', { ascending: false })
        .order('id', { ascending: true })
        .limit(100)

      if (allowedUserIds) {
        profileQuery = profileQuery.in('id', allowedUserIds)
      }

      const { data: profileRows } = await profileQuery

      entries = (profileRows || []).map((p: any, index: number) => ({
        rank: index + 1,
        userId: p.id,
        username: p.name || 'Player',
        handle: p.handle || 'player',
        avatarUrl: p.avatar_url || undefined,
        score: 0,
        elo: p.overall_elo || 1000,
        isCurrentUser: p.id === currentUserId,
      }))
    }

    // Determine pinnedEntry if current user is not in the top displayed list
    let pinnedEntry: LeaderboardEntry | null = null
    const currentUserInEntries = entries.find((e) => e.isCurrentUser)

    if (!currentUserInEntries && currentUserId) {
      const { data: curProfile } = await supabase
        .from('profiles')
        .select('name, handle, avatar_url')
        .eq('id', currentUserId)
        .maybeSingle()

      if (curProfile) {
        // Mirror whichever branch above built `entries`, scoped to just this
        // user, so the pinned row's score/elo mean the same thing as every
        // other row on this exact board/metric — previously this always
        // hardcoded score: 0 and elo: overall_elo (wrong metric entirely for
        // a category board), which read as "you have 0 points" even when
        // the player had a real score.
        let pinnedScore = 0
        let pinnedElo = 1000

        if (params.board === 'endless') {
          const { data: row } = await supabase
            .from('match_history')
            .select('rounds_cleared')
            .eq('user_id', currentUserId)
            .eq('category', params.category)
            .eq('mode', 'solo_endless')
            .order('rounds_cleared', { ascending: false })
            .limit(1)
            .maybeSingle()
          pinnedScore = row?.rounds_cleared || 0
        } else if (params.board === 'weekly' || params.board === 'monthly') {
          const { data: row } = await supabase
            .from('match_history')
            .select('score')
            .eq('user_id', currentUserId)
            .eq('category', params.category)
            .in('mode', ['solo_ranked', 'versus_ranked'])
            .gte('played_at', getPeriodStart(params.board))
            .order('score', { ascending: false })
            .limit(1)
            .maybeSingle()
          pinnedScore = row?.score || 0
        } else if (params.metric === 'elo') {
          const { data: row } = await supabase
            .from('category_elo')
            .select('elo')
            .eq('user_id', currentUserId)
            .eq('category', params.category)
            .maybeSingle()
          pinnedElo = row?.elo || 1000
          // score stays 0 — every entry on the "By Elo" view shows score: 0.
        } else {
          const [{ data: bestRow }, { data: eloRow }] = await Promise.all([
            supabase
              .from('category_bests')
              .select('ranked_score')
              .eq('user_id', currentUserId)
              .eq('category', params.category)
              .maybeSingle(),
            supabase
              .from('category_elo')
              .select('elo')
              .eq('user_id', currentUserId)
              .eq('category', params.category)
              .maybeSingle(),
          ])
          pinnedScore = bestRow?.ranked_score || 0
          pinnedElo = eloRow?.elo || 1000
        }

        pinnedEntry = {
          rank: 999,
          userId: currentUserId,
          username: curProfile.name || 'Player',
          handle: curProfile.handle || 'player',
          avatarUrl: curProfile.avatar_url || undefined,
          score: pinnedScore,
          elo: pinnedElo,
          isCurrentUser: true,
        }
      }
    }

    return {
      entries,
      pinnedEntry,
      isEmpty: entries.length === 0,
    }
  },
}
