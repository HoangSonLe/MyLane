/**
 * configs/enum.ts — Single source of truth cho tất cả shared TypeScript enums.
 *
 * Rule:
 * 1. Tất cả shared enum dùng ở 2+ feature đều định nghĩa ở đây dưới dạng TS enum.
 * 2. Tuyệt đối không so sánh bằng string literal thô (vd: screenState === 'loading').
 *    Luôn dùng Enum member (vd: screenState === ScreenState.LOADING).
 */

// ─── Screen State ─────────────────────────────────────────────────────────────
export enum ScreenState {
  NORMAL = 'normal',
  LOADING = 'loading',
  EMPTY = 'empty',
  ERROR = 'error',
  OFFLINE = 'offline',
  GUEST = 'guest',
  READY = 'ready',
  WAITING = 'waiting',
  RECONNECTING = 'reconnecting',
  RESULT = 'result',
}

// ─── Game Domain ──────────────────────────────────────────────────────────────
export enum GameId {
  NUMBER = 'number',
  ALPHABET = 'alphabet',
  GRID = 'grid',
  SEQUENCE = 'sequence',
}

export enum ModeId {
  SOLO_PRACTICE = 'solo-practice',
  SOLO_RANKED = 'solo-ranked',
  VERSUS_RANKED = 'versus-ranked',
  VERSUS_UNRANKED = 'versus-unranked',
}

export enum DifficultyId {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  SUPER_HARD = 'super-hard',
}

export enum EntryPoint {
  HOME = 'home',
  LOBBY = 'lobby',
}

// ─── Gameplay Phase ───────────────────────────────────────────────────────────
export enum Phase {
  IDLE = 'idle',
  VIEWING = 'viewing',
  ANSWERING = 'answering',
  CORRECT = 'correct',
  WRONG = 'wrong',
  PAUSED = 'paused',
  COMPLETE = 'complete',
}

// ─── Versus ───────────────────────────────────────────────────────────────────
export enum RoundMode {
  VERSUS_RANKED = 'versus-ranked',
  VERSUS_UNRANKED = 'versus-unranked',
}

export enum OpponentStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ANSWERED = 'answered',
  LOCKED_IN = 'locked-in',
  WAITING = 'waiting',
  RECONNECTING = 'reconnecting',
}
