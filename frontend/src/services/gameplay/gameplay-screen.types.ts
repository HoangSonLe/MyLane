/**
 * gameplay-screen.types.ts — types và labels cho GameplayScreen.
 * Shared types (GameId, ModeId) được import từ configs/enum.ts.
 */
import { GameId, ModeId } from '@/configs/enum'
import { translations } from '@/i18n/translations'

export { GameId, ModeId }

type Dictionary = (typeof translations)['en']

// Locale-aware — takes the resolved dictionary from useTranslation() so
// callers stay in sync with Settings > Language instead of a hardcoded
// English-only Record.
export function getGameLabels(t: Dictionary): Record<GameId, string> {
  return {
    [GameId.NUMBER]:   t.gameLabels.number,
    [GameId.ALPHABET]: t.gameLabels.alphabet,
    [GameId.GRID]:     t.gameLabels.grid,
    [GameId.SEQUENCE]: t.gameLabels.sequence,
    [GameId.COLOR]:    t.gameLabels.color,
  }
}

export function getModeLabels(t: Dictionary): Record<ModeId, string> {
  return {
    [ModeId.SOLO_PRACTICE]:   t.modeLabels.soloPractice,
    [ModeId.SOLO_RANKED]:     t.modeLabels.soloRanked,
    [ModeId.VERSUS_RANKED]:   t.modeLabels.versusRanked,
    [ModeId.VERSUS_UNRANKED]: t.modeLabels.versusUnranked,
  }
}
