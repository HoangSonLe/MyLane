import axios from 'axios'
import { apiClient } from '@/services/http/api-client'
import { isSupabaseConfigured } from '@/services/backend-config'
import { versusSupabaseService } from '@/services/supabase'
import type { GameCategoryId, PublicRoomSummary, Room, RoundMode, DifficultyId, RoomEntrySource, VersusRoundResult } from './versus-room.interface'

export class RoomNotFoundError extends Error { name = 'RoomNotFoundError' }
export class RoomExpiredError extends Error { name = 'RoomExpiredError' }
export class RoomFullError extends Error { name = 'RoomFullError' }
export class NoAvailableRoomsError extends Error { name = 'NoAvailableRoomsError' }

/** Accepts either a raw room code or a shared room URL and returns the code. */
export function normalizeRoomCode(value: string): string {
  const withoutQuery = value.trim().split(/[?#]/, 1)[0].replace(/\/+$/, '')
  return (withoutQuery.split('/').filter(Boolean).at(-1) || '').toUpperCase()
}

export const versusRoomService = {
  /** Creates a room as host with Public/Private option and Difficulty setting. */
  async createRoom(input: { category: GameCategoryId; mode: RoundMode; difficulty?: DifficultyId; roomName: string; isPrivate?: boolean; entrySource?: RoomEntrySource }): Promise<Room> {
    if (isSupabaseConfigured()) {
      return versusSupabaseService.createRoom(input)
    }
    const { data } = await apiClient.post<{ room: Room }>('/versus-room', input)
    return data.room
  },

  /** Fetches list of open Public rooms available in the Lobby. */
  async getAvailableRooms(): Promise<PublicRoomSummary[]> {
    if (isSupabaseConfigured()) {
      return versusSupabaseService.getAvailableRooms()
    }
    const { data } = await apiClient.get<{ rooms: PublicRoomSummary[] }>('/versus-room/available')
    return data.rooms
  },

  /** Quick Join — matches instantly into the first open Public room. */
  async quickJoinRoom(): Promise<Room> {
    if (isSupabaseConfigured()) {
      return versusSupabaseService.quickJoinRoom()
    }
    const { data } = await apiClient.post<{ room: Room }>('/versus-room/quick-join')
    return data.room
  },

  /** Find match by Elo range */
  async findMatchByElo(input: { category: GameCategoryId; userElo: number; eloDelta: number }): Promise<Room | null> {
    if (isSupabaseConfigured()) {
      return versusSupabaseService.findMatchByElo(input)
    }
    return null
  },

  /** Joins an existing room by code — the joiner becomes the room's opponent. */
  async joinRoom(code: string): Promise<Room> {
    const normalizedCode = normalizeRoomCode(code)
    if (isSupabaseConfigured()) {
      return versusSupabaseService.joinRoom(normalizedCode)
    }
    try {
      const { data } = await apiClient.post<{ room: Room }>(`/versus-room/${encodeURIComponent(normalizedCode)}/join`)
      return data.room
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        throw new RoomNotFoundError('Room not found')
      }
      if (axios.isAxiosError(err) && err.response?.status === 410) {
        throw new RoomExpiredError('Room expired')
      }
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        throw new RoomFullError('Room is full')
      }
      throw err
    }
  },

  /** Sets the current participant's explicit ready state. */
  async setRoomReady(code: string, ready: boolean): Promise<Room> {
    if (isSupabaseConfigured()) {
      return versusSupabaseService.setRoomReady(code, ready)
    }
    const { data } = await apiClient.post<{ room: Room }>(`/versus-room/${encodeURIComponent(code)}/ready`, { ready })
    return data.room
  },

  /** Starts a room atomically once both participants are ready. */
  async startRoom(code: string): Promise<Room> {
    if (isSupabaseConfigured()) {
      return versusSupabaseService.startRoom(code)
    }
    const { data } = await apiClient.post<{ room: Room }>(`/versus-room/${encodeURIComponent(code)}/start`)
    return data.room
  },

  async submitRound(code: string, roundNumber: number, correct: boolean): Promise<VersusRoundResult> {
    if (isSupabaseConfigured()) {
      return versusSupabaseService.submitRound(code, roundNumber, correct)
    }
    const { data } = await apiClient.post<{ result: VersusRoundResult }>(`/versus-room/${encodeURIComponent(code)}/round`, { roundNumber, correct })
    return data.result
  },

  async forfeitMatch(code: string): Promise<{ outcome: 'win' | 'loss'; eloChange: number }> {
    if (isSupabaseConfigured()) {
      return versusSupabaseService.forfeitMatch(code)
    }
    const { data } = await apiClient.post<{ outcome: 'win' | 'loss'; eloChange: number }>(`/versus-room/${encodeURIComponent(code)}/forfeit`)
    return data
  },

  /** Leaves a room — transfers Host role to opponent if Host leaves, or deletes room if empty. */
  async leaveRoom(code: string): Promise<{ room: Room | null; hostTransferred: boolean }> {
    if (isSupabaseConfigured()) {
      return versusSupabaseService.leaveRoom(code)
    }
    const { data } = await apiClient.post<{ room: Room | null; hostTransferred: boolean }>(`/versus-room/${encodeURIComponent(code)}/leave`)
    return data
  },

  /** Keeps a waiting room alive while an authenticated participant is present. */
  async heartbeatRoom(code: string): Promise<void> {
    if (isSupabaseConfigured()) {
      return versusSupabaseService.heartbeatRoom(code)
    }
  },

  /** Toggles Public vs Private privacy setting for a room. */
  async toggleRoomPrivacy(code: string, isPrivate: boolean): Promise<Room> {
    if (isSupabaseConfigured()) {
      return versusSupabaseService.toggleRoomPrivacy(code, isPrivate)
    }
    const { data } = await apiClient.post<{ room: Room }>(`/versus-room/${encodeURIComponent(code)}/toggle-privacy`, { isPrivate })
    return data.room
  },

  /** Updates room status ('waiting', 'in_progress', 'finished') */
  async updateRoomStatus(code: string, status: 'waiting' | 'in_progress' | 'finished'): Promise<void> {
    if (isSupabaseConfigured()) {
      return versusSupabaseService.updateRoomStatus(code, status)
    }
    if (status === 'in_progress') {
      await this.startRoom(code)
    }
  },

  /** Polls current room state. */
  async getRoom(code: string): Promise<Room> {
    if (isSupabaseConfigured()) {
      return versusSupabaseService.getRoom(code)
    }
    try {
      const { data } = await apiClient.get<{ room: Room }>(`/versus-room/${encodeURIComponent(code)}`)
      return data.room
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        throw new RoomNotFoundError('Room not found')
      }
      if (axios.isAxiosError(err) && err.response?.status === 410) {
        throw new RoomExpiredError('Room expired')
      }
      throw err
    }
  },

  /** Subscribes to real-time changes on available public rooms */
  subscribeToAvailableRooms(onChange: () => void): () => void {
    if (isSupabaseConfigured()) {
      return versusSupabaseService.subscribeToAvailableRooms(onChange)
    }
    return () => {}
  },

  /** Subscribes to real-time changes on one specific room (score, status, forfeit, finish). */
  subscribeToRoomUpdates(code: string, onChange: () => void): () => void {
    if (isSupabaseConfigured()) {
      return versusSupabaseService.subscribeToRoomUpdates(code, onChange)
    }
    return () => {}
  },

  /** Tracks who's actually connected to a room right now (browser-close/network-drop detection). */
  subscribeToRoomPresence(code: string, userId: string, onSync: (onlineUserIds: string[]) => void): () => void {
    if (isSupabaseConfigured()) {
      return versusSupabaseService.subscribeToRoomPresence(code, userId, onSync)
    }
    return () => {}
  },
}
