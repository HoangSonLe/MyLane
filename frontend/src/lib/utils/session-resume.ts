import { DifficultyId, GameId, ModeId, RoomEntrySource } from '@/configs/enum'
import { clearSessionJSON, readSessionJSON, writeSessionJSON } from './safe-storage'

/**
 * Restores the player's spot after an unplanned full page reload (mobile tab
 * discard, HMR full reload, accidental refresh) — never for cross-session
 * continuity, so this deliberately lives in sessionStorage, not localStorage.
 * See docs/technical/known-gaps.md "Resume-on-reload" for scope/limits.
 */
export type ResumableScreen = 'game' | 'versus-room' | 'versus-game'

export interface ResumeState {
  screen: ResumableScreen
  session: { game: GameId; mode: ModeId; difficulty: DifficultyId }
  roomCode?: string
  roomEntrySource?: RoomEntrySource
}

const RESUME_KEY = 'mylane:resume:v1'

export function saveResumeState(state: ResumeState) {
  writeSessionJSON(RESUME_KEY, state)
}

export function loadResumeState(): ResumeState | null {
  const parsed = readSessionJSON<ResumeState>(RESUME_KEY)
  if (!parsed || !parsed.screen || !parsed.session) return null
  return parsed
}

export function clearResumeState() {
  clearSessionJSON(RESUME_KEY)
}
