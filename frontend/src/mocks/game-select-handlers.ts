import { http, HttpResponse } from 'msw'
import { GAME_STATS_SEED } from '@/services/game-select/game-select.mock'

/**
 * Fake backend for Game Select stats (docs/ui/screen-interface-spec.md §
 * Game Select). The 4 games themselves are fixed client-side content — only
 * per-player Elo/best-score/highest-level comes from here.
 */
export const gameSelectHandlers = [
  http.get('/api/game-select/stats', () => {
    return HttpResponse.json({ stats: GAME_STATS_SEED })
  }),
]
