import { getSupabaseClient } from './supabase.client'
import type { GameResultInput, ResultData } from '../result/result.interface'
import type { BoardType, Category, LeaderboardBoard, LeaderboardEntry, SortMetric } from '../leaderboard/leaderboard.interface'
import { computeScore } from '../gameplay/game-rules'
import { ModeId, GameId } from '@/configs/enum'

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

export const gameSupabaseService = {
  /**
   * Submit game result to Supabase `match_history`, `category_bests`, `category_elo`, and `profiles`
   */
  async submitResult(input: GameResultInput): Promise<ResultData> {
    const supabase = getSupabaseClient()
    const usesRankedScoring = input.mode === ModeId.SOLO_RANKED || input.mode === ModeId.VERSUS_RANKED
    const isVersusRanked = input.mode === ModeId.VERSUS_RANKED
    const shouldPersist = usesRankedScoring
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
        let outcome = input.outcome ?? (input.perfect || input.roundsCleared >= 5 ? 'win' : 'loss')
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

        if (prevBest) {
          previousBestScore = usesRankedScoring ? prevBest.ranked_score : prevBest.practice_score
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

        // 4. Upsert category bests
        const newPracticeScore = Math.max(prevBest?.practice_score || 0, !usesRankedScoring ? breakdown.score : 0)
        const newRankedScore = Math.max(prevBest?.ranked_score || 0, usesRankedScoring ? breakdown.score : 0)
        const newHighestLevel = Math.max(prevBest?.highest_level || 0, input.levelReached)

        const { error: bestWriteError } = await supabase.from('category_bests').upsert(
          {
            user_id: userId,
            category: input.game,
            practice_score: newPracticeScore,
            practice_level: Math.max(prevBest?.practice_level || 0, !usesRankedScoring ? input.levelReached : 1),
            ranked_score: newRankedScore,
            ranked_level: Math.max(prevBest?.ranked_level || 0, usesRankedScoring ? input.levelReached : 1),
            highest_level: newHighestLevel,
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

    if (params.metric === 'elo') {
      // Sort by Elo Rating
      let query = supabase
        .from('category_elo')
        .select('user_id, elo, profiles!inner(name, handle, avatar_url)')
        .eq('category', params.category)
        .order('elo', { ascending: false })
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
      // Sort by High Score
      let query = supabase
        .from('category_bests')
        .select('user_id, ranked_score, practice_score, profiles!inner(name, handle, avatar_url), category_elo(elo)')
        .eq('category', params.category)
        .order('ranked_score', { ascending: false })
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
          score: row.ranked_score || row.practice_score || 0,
          elo: eloVal,
          isCurrentUser: row.user_id === currentUserId,
        }
      })
    }

    // Fallback: If no records found for specific category metric, query profiles table directly
    if (entries.length === 0) {
      let profileQuery = supabase
        .from('profiles')
        .select('id, name, handle, avatar_url, overall_elo')
        .order('overall_elo', { ascending: false })
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
        .select('name, handle, avatar_url, overall_elo')
        .eq('id', currentUserId)
        .maybeSingle()

      if (curProfile) {
        pinnedEntry = {
          rank: 999,
          userId: currentUserId,
          username: curProfile.name || 'Player',
          handle: curProfile.handle || 'player',
          avatarUrl: curProfile.avatar_url || undefined,
          score: 0,
          elo: curProfile.overall_elo || 1000,
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
