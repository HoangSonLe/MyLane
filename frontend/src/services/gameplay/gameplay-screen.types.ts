/**
 * gameplay-screen.types.ts — types và labels cho GameplayScreen.
 * Shared types (GameId, ModeId) được import từ configs/enum.ts.
 */
import { GameId, ModeId } from '@/configs/enum'

export { GameId, ModeId }

export const GAME_LABELS: Record<GameId, string> = {
  [GameId.NUMBER]:   'Number Memory',
  [GameId.ALPHABET]: 'Alphabet Memory',
  [GameId.GRID]:     'Grid Memory',
  [GameId.SEQUENCE]: 'Sequence Memory',
}

export const MODE_LABELS: Record<ModeId, string> = {
  [ModeId.SOLO_PRACTICE]:   'Solo Practice',
  [ModeId.SOLO_RANKED]:     'Solo Ranked',
  [ModeId.VERSUS_RANKED]:   'Versus Ranked',
  [ModeId.VERSUS_UNRANKED]: 'Versus Unranked',
}
