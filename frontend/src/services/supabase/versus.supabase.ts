import { DifficultyId, RoomEntrySource } from '@/configs/enum'
import type { GameCategoryId, PublicRoomSummary, Room, RoundMode, VersusRoundResult } from '../versus-room/versus-room.interface'
import {
  NoAvailableRoomsError,
  RoomFullError,
  RoomNotFoundError,
} from '../versus-room/versus-room.service'
import { getSupabaseClient } from './supabase.client'

function requireSupabase() {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase client uninitialized')
  return supabase
}

function throwRoomError(error: any): never {
  const message = String(error?.message || error?.details || 'Room request failed')
  if (message.includes('ROOM_NOT_FOUND')) throw new RoomNotFoundError('Room not found')
  if (message.includes('ROOM_FULL')) throw new RoomFullError('Room is full')
  throw new Error(message)
}

function dbValue(value: string): string {
  return value.replace(/-/g, '_')
}

function appEntrySource(value: string | null | undefined): RoomEntrySource {
  const normalized = String(value || RoomEntrySource.CUSTOM).replace(/_/g, '-')
  return Object.values(RoomEntrySource).includes(normalized as RoomEntrySource)
    ? normalized as RoomEntrySource
    : RoomEntrySource.CUSTOM
}

export const versusSupabaseService = {
  subscribeToRoom(roomCode: string, onMessage: (payload: any) => void) {
    const supabase = getSupabaseClient()
    if (!supabase) return null
    const channel = supabase.channel(`room:${roomCode}`, {
      config: { broadcast: { self: true } },
    })
    channel
      .on('broadcast', { event: 'game-event' }, ({ payload }) => onMessage(payload))
      .subscribe()

    return {
      sendEvent(event: string, data: any) {
        return channel.send({
          type: 'broadcast',
          event: 'game-event',
          payload: { event, data },
        })
      },
      unsubscribe() {
        void supabase.removeChannel(channel)
      },
    }
  },

  async getAvailableRooms(): Promise<PublicRoomSummary[]> {
    const supabase = requireSupabase()
    const { data: userData, error: authError } = await supabase.auth.getUser()
    if (authError) throwRoomError(authError)
    const currentUserId = userData?.user?.id

    let query = supabase
      .from('versus_rooms')
      .select('code, room_name, category, mode, difficulty, player_count, max_players, host_id, privacy')
      .eq('privacy', 'public')
      .eq('status', 'waiting')
      .lt('player_count', 2)

    if (currentUserId) query = query.neq('host_id', currentUserId)
    const { data, error } = await query.order('created_at', { ascending: false }).limit(20)
    if (error) throwRoomError(error)

    const hostIds = [...new Set((data || []).map((row: any) => row.host_id).filter(Boolean))]

    const [profilesRes, categoryElosRes] = await Promise.all([
      hostIds.length > 0
        ? supabase.from('profiles').select('id, name, overall_elo').in('id', hostIds)
        : Promise.resolve({ data: [], error: null }),
      hostIds.length > 0
        ? supabase.from('category_elo').select('user_id, category, elo').in('user_id', hostIds)
        : Promise.resolve({ data: [], error: null }),
    ])

    if (profilesRes.error) throwRoomError(profilesRes.error)
    if (categoryElosRes.error) throwRoomError(categoryElosRes.error)

    const profileMap = new Map((profilesRes.data || []).map((p: any) => [p.id, p]))
    const eloMap = new Map((categoryElosRes.data || []).map((row: any) => [`${row.user_id}:${row.category}`, row.elo]))

    return (data || []).map((row: any) => {
      const hostP = profileMap.get(row.host_id)
      return {
        code: row.code,
        roomName: row.room_name || row.code,
        hostName: hostP?.name || 'Host',
        hostElo: eloMap.get(`${row.host_id}:${row.category}`) ?? hostP?.overall_elo ?? 1000,
        category: row.category as GameCategoryId,
        mode: String(row.mode).replace(/_/g, '-') as RoundMode,
        difficulty: String(row.difficulty || DifficultyId.MEDIUM).replace(/_/g, '-') as DifficultyId,
        playerCount: row.player_count || 1,
        maxPlayers: row.max_players || 2,
        isPrivate: row.privacy === 'private',
      }
    })
  },

  async findMatchByElo(input: {
    category: GameCategoryId
    userElo: number
    eloDelta: number
  }): Promise<Room | null> {
    const rooms = await this.getAvailableRooms()
    const candidate = rooms.find((room) =>
      room.category === input.category &&
      room.hostElo >= Math.max(100, input.userElo - input.eloDelta) &&
      room.hostElo <= input.userElo + input.eloDelta
    )
    return candidate ? this.joinRoom(candidate.code) : null
  },

  async createRoom(input: {
    category: GameCategoryId
    mode: RoundMode
    difficulty?: DifficultyId
    roomName: string
    isPrivate?: boolean
    entrySource?: RoomEntrySource
  }): Promise<Room> {
    const supabase = requireSupabase()
    const { data, error } = await supabase.rpc('create_versus_room', {
      p_category: input.category,
      p_mode: dbValue(input.mode),
      p_difficulty: dbValue(input.difficulty || DifficultyId.MEDIUM),
      p_room_name: input.roomName,
      p_is_private: !!input.isPrivate,
      p_entry_source: dbValue(input.entrySource || RoomEntrySource.CUSTOM),
    })
    if (error) throwRoomError(error)
    return this.getRoom(String(data))
  },

  async quickJoinRoom(): Promise<Room> {
    const available = await this.getAvailableRooms()
    for (const room of available) {
      try {
        return await this.joinRoom(room.code)
      } catch (error) {
        // Another user may have occupied this room between list and join. The
        // atomic join RPC tells us to try the next candidate safely.
        if (!(error instanceof RoomFullError)) throw error
      }
    }
    throw new NoAvailableRoomsError('Không có phòng công khai nào đang chờ từ người chơi khác.')
  },

  async joinRoom(code: string): Promise<Room> {
    const supabase = requireSupabase()
    const normalizedCode = code.trim().split('/').filter(Boolean).at(-1) || code.trim()
    const { data, error } = await supabase.rpc('join_versus_room', {
      p_code: normalizedCode,
    })
    if (error) throwRoomError(error)
    return this.getRoom(String(data))
  },

  async leaveRoom(code: string): Promise<{ room: Room | null; hostTransferred: boolean }> {
    const supabase = requireSupabase()
    const { data, error } = await supabase.rpc('leave_versus_room', { p_code: code })
    if (error) throwRoomError(error)
    const result = Array.isArray(data) ? data[0] : data
    if (!result || result.room_deleted) {
      return { room: null, hostTransferred: !!result?.host_transferred }
    }
    return {
      room: await this.getRoom(result.room_code || code),
      hostTransferred: !!result.host_transferred,
    }
  },

  async setRoomReady(code: string, ready: boolean): Promise<Room> {
    const supabase = requireSupabase()
    const { error } = await supabase.rpc('set_versus_room_ready', {
      p_code: code,
      p_ready: ready,
    })
    if (error) throwRoomError(error)
    return this.getRoom(code)
  },

  async startRoom(code: string): Promise<Room> {
    const supabase = requireSupabase()
    const { error } = await supabase.rpc('start_versus_room', { p_code: code })
    if (error) throwRoomError(error)
    return this.getRoom(code)
  },

  async submitRound(code: string, roundNumber: number, correct: boolean): Promise<VersusRoundResult> {
    const supabase = requireSupabase()
    const { data, error } = await supabase.rpc('submit_versus_round', {
      p_code: code,
      p_round_number: roundNumber,
      p_correct: correct,
    })
    if (error) throwRoomError(error)
    const row = Array.isArray(data) ? data[0] : data
    return {
      matchStatus: row.match_status,
      hostScore: row.host_score,
      guestScore: row.guest_score,
      hostRoundsCompleted: row.host_rounds_completed,
      guestRoundsCompleted: row.guest_rounds_completed,
      winnerId: row.winner_id || null,
      outcome: row.current_user_outcome || null,
      eloChange: row.elo_change || 0,
    }
  },

  async forfeitMatch(code: string): Promise<{ outcome: 'win' | 'loss'; eloChange: number }> {
    const supabase = requireSupabase()
    const { data, error } = await supabase.rpc('forfeit_versus_match', { p_code: code })
    if (error) throwRoomError(error)
    const row = Array.isArray(data) ? data[0] : data
    return { outcome: row.current_user_outcome, eloChange: row.elo_change || 0 }
  },

  async updateRoomStatus(code: string, status: 'waiting' | 'in_progress' | 'finished'): Promise<void> {
    if (status !== 'in_progress') {
      throw new Error(`Unsupported direct room transition: ${status}`)
    }
    await this.startRoom(code)
  },

  async toggleRoomPrivacy(code: string, isPrivate: boolean): Promise<Room> {
    const supabase = requireSupabase()
    const { error } = await supabase.rpc('toggle_versus_room_privacy', {
      p_code: code,
      p_is_private: isPrivate,
    })
    if (error) throwRoomError(error)
    return this.getRoom(code)
  },

  async getRoom(code: string): Promise<Room> {
    const supabase = requireSupabase()
    const normalizedCode = code.trim().split('/').filter(Boolean).at(-1) || code.trim()
    const { data: roomRow, error } = await supabase
      .from('versus_rooms')
      .select('*, host:profiles!host_id(name, handle, overall_elo), guest:profiles!guest_id(name, handle, overall_elo)')
      .eq('code', normalizedCode.toUpperCase())
      .maybeSingle()

    if (error) throwRoomError(error)
    if (!roomRow) throw new RoomNotFoundError('Room not found')

    const participantIds = [roomRow.host_id, roomRow.guest_id].filter(Boolean)
    const { data: categoryElos, error: categoryEloError } = await supabase
      .from('category_elo')
      .select('user_id, elo')
      .eq('category', roomRow.category)
      .in('user_id', participantIds)
    if (categoryEloError) throwRoomError(categoryEloError)
    const eloByUser = new Map((categoryElos || []).map((row: any) => [row.user_id, row.elo]))

    return {
      code: roomRow.code,
      matchId: roomRow.match_id || undefined,
      link: `${window.location.origin}/?room=${encodeURIComponent(roomRow.code)}`,
      seed: roomRow.seed || roomRow.code,
      roomName: roomRow.room_name || roomRow.code,
      category: roomRow.category as GameCategoryId,
      mode: String(roomRow.mode).replace(/_/g, '-') as RoundMode,
      difficulty: String(roomRow.difficulty || DifficultyId.MEDIUM).replace(/_/g, '-') as DifficultyId,
      isPrivate: roomRow.privacy === 'private',
      host: {
        id: roomRow.host_id,
        name: roomRow.host?.name || 'Host Player',
        handle: roomRow.host?.handle || 'host',
        elo: eloByUser.get(roomRow.host_id) ?? 1000,
        ready: !!roomRow.host_ready,
      },
      opponent: roomRow.guest_id
        ? {
            id: roomRow.guest_id,
            name: roomRow.guest?.name || 'Guest Player',
            handle: roomRow.guest?.handle || 'guest',
            elo: eloByUser.get(roomRow.guest_id) ?? 1000,
            ready: !!roomRow.guest_ready,
          }
        : null,
      opponentJoined: !!roomRow.guest_id,
      status: roomRow.status || 'waiting',
      entrySource: appEntrySource(roomRow.entry_source),
      startAt: roomRow.start_at || null,
      hostScore: roomRow.host_score || 0,
      guestScore: roomRow.guest_score || 0,
      hostRoundsCompleted: roomRow.host_rounds_completed || 0,
      guestRoundsCompleted: roomRow.guest_rounds_completed || 0,
      winnerId: roomRow.winner_id || null,
      finishReason: roomRow.finish_reason || null,
      hostEloDelta: roomRow.host_elo_delta || 0,
      guestEloDelta: roomRow.guest_elo_delta || 0,
    }
  },

  subscribeToAvailableRooms(onChange: () => void): () => void {
    const supabase = getSupabaseClient()
    if (!supabase) return () => {}
    const channel = supabase
      .channel('public_versus_rooms_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'versus_rooms' }, onChange)
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  },
}
