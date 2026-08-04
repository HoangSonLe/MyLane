import { create } from 'zustand'

import { isSupabaseConfigured } from '@/services/backend-config'
import {
  inviteMuteSupabaseService,
  type AccountInviteMuteRecord,
} from '@/services/supabase/invite-mute.supabase'

export type MuteDurationOption = '5m' | '15m' | '30m' | 'session'

export interface InviteMuteTarget {
  userId: string
  handle: string
}

interface MuteRecord extends InviteMuteTarget {
  until: number
}

type MutedMap = Record<string, MuteRecord>
type StoredAccountMaps = Record<string, MutedMap>

const STORAGE_KEY = 'gb_account_invite_mutes_v2'
const LEGACY_STORAGE_KEY = 'gb_muted_inviters_v1'
const LEGACY_MIGRATION_KEY = 'gb_muted_inviters_v1_account'

interface InviteMuteState {
  accountId: string | null
  accountMutedMap: MutedMap
  sessionMutedMap: MutedMap
  isHydrated: boolean
  syncAccount: (accountId: string) => Promise<void>
  subscribeToAccount: (accountId: string) => () => void
  clearAccount: () => void
  muteUser: (target: InviteMuteTarget, option: MuteDurationOption) => Promise<void>
  unmuteUser: (target: InviteMuteTarget) => Promise<void>
  isMuted: (target: InviteMuteTarget) => boolean
}

function idKey(userId: string) {
  return `id:${userId}`
}

function handleKey(handle: string) {
  return `handle:${handle.trim().toLowerCase()}`
}

function targetKeys(target: InviteMuteTarget) {
  return [idKey(target.userId), handleKey(target.handle)]
}

function cleanMutedMap(map: MutedMap): MutedMap {
  const now = Date.now()
  return Object.fromEntries(
    Object.entries(map).filter(([, record]) => record.until > now)
  )
}

function readStoredAccountMaps(): StoredAccountMaps {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) as StoredAccountMaps : {}
  } catch {
    return {}
  }
}

function migrateLegacyMap(accountId: string): MutedMap {
  try {
    const migratedAccount = localStorage.getItem(LEGACY_MIGRATION_KEY)
    if (migratedAccount) return {}

    const raw = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!raw) return {}
    const legacy = JSON.parse(raw) as Record<string, { until: number; sessionOnly?: boolean }>
    const now = Date.now()
    const migrated: MutedMap = {}
    for (const [handle, record] of Object.entries(legacy)) {
      if (record.sessionOnly || record.until <= now) continue
      migrated[handleKey(handle)] = { userId: '', handle, until: record.until }
    }
    localStorage.setItem(LEGACY_MIGRATION_KEY, accountId)
    return migrated
  } catch {
    return {}
  }
}

function loadAccountMap(accountId: string): MutedMap {
  const stored = readStoredAccountMaps()[accountId] || {}
  return cleanMutedMap({ ...migrateLegacyMap(accountId), ...stored })
}

function saveAccountMap(accountId: string, map: MutedMap) {
  try {
    const allAccounts = readStoredAccountMaps()
    allAccounts[accountId] = cleanMutedMap(map)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allAccounts))
  } catch {
    // A storage failure must not stop the in-memory mute from working.
  }
}

function mapRemoteMute(record: AccountInviteMuteRecord): MuteRecord {
  return {
    userId: record.mutedUserId,
    handle: record.mutedHandle,
    until: new Date(record.untilTimestamp).getTime(),
  }
}

function durationUntil(option: Exclude<MuteDurationOption, 'session'>) {
  const minutes = option === '5m' ? 5 : option === '15m' ? 15 : 30
  return Date.now() + minutes * 60 * 1000
}

export const useInviteMuteStore = create<InviteMuteState>((set, get) => ({
  accountId: null,
  accountMutedMap: {},
  sessionMutedMap: {},
  isHydrated: false,

  syncAccount: async (accountId: string) => {
    const accountChanged = get().accountId !== accountId
    const localMap = loadAccountMap(accountId)
    saveAccountMap(accountId, localMap)
    set({
      accountId,
      accountMutedMap: localMap,
      sessionMutedMap: accountChanged ? {} : get().sessionMutedMap,
      isHydrated: false,
    })

    if (!isSupabaseConfigured()) {
      set({ isHydrated: true })
      return
    }

    try {
      const remoteRecords = await inviteMuteSupabaseService.getActiveMutes(accountId)
      if (get().accountId !== accountId) return

      const remoteMap: MutedMap = {}
      for (const remoteRecord of remoteRecords) {
        const record = mapRemoteMute(remoteRecord)
        if (record.until > Date.now()) remoteMap[idKey(record.userId)] = record
      }

      // Handle-only entries are legacy local mutes. Keep them until their
      // original expiry, while all new mutes use the immutable profile id.
      const legacyMap = Object.fromEntries(
        Object.entries(localMap).filter(([key]) => key.startsWith('handle:'))
      )
      const merged = { ...legacyMap, ...remoteMap }
      saveAccountMap(accountId, merged)
      set({ accountMutedMap: merged, isHydrated: true })
    } catch {
      // Local cache remains functional if account sync is temporarily offline.
      if (get().accountId === accountId) set({ isHydrated: true })
    }
  },

  subscribeToAccount: (accountId: string) => {
    if (!isSupabaseConfigured()) return () => {}
    return inviteMuteSupabaseService.subscribeToMutes(accountId, (remoteRecord) => {
      if (get().accountId !== accountId) return
      const record = mapRemoteMute(remoteRecord)
      set((state) => {
        const updated = { ...state.accountMutedMap }
        delete updated[handleKey(record.handle)]
        if (record.until > Date.now()) updated[idKey(record.userId)] = record
        else delete updated[idKey(record.userId)]
        saveAccountMap(accountId, updated)
        return { accountMutedMap: updated }
      })
    })
  },

  clearAccount: () => {
    set({
      accountId: null,
      accountMutedMap: {},
      sessionMutedMap: {},
      isHydrated: false,
    })
  },

  muteUser: async (target: InviteMuteTarget, option: MuteDurationOption) => {
    const accountId = get().accountId
    const key = idKey(target.userId)

    if (option === 'session') {
      set((state) => ({
        sessionMutedMap: {
          ...state.sessionMutedMap,
          [key]: { ...target, until: Number.POSITIVE_INFINITY },
        },
      }))
      return
    }

    const record: MuteRecord = { ...target, until: durationUntil(option) }
    set((state) => {
      const updated = { ...state.accountMutedMap, [key]: record }
      delete updated[handleKey(target.handle)]
      if (accountId) saveAccountMap(accountId, updated)
      return { accountMutedMap: updated }
    })

    if (!accountId || !isSupabaseConfigured()) return
    try {
      await inviteMuteSupabaseService.upsertMute(
        accountId,
        target,
        new Date(record.until).toISOString()
      )
    } catch {
      // Keep the local mute active; the next explicit mute can retry sync.
    }
  },

  unmuteUser: async (target: InviteMuteTarget) => {
    const accountId = get().accountId
    const keys = targetKeys(target)
    set((state) => {
      const accountMutedMap = { ...state.accountMutedMap }
      const sessionMutedMap = { ...state.sessionMutedMap }
      for (const key of keys) {
        delete accountMutedMap[key]
        delete sessionMutedMap[key]
      }
      if (accountId) saveAccountMap(accountId, accountMutedMap)
      return { accountMutedMap, sessionMutedMap }
    })

    if (!accountId || !target.userId || !isSupabaseConfigured()) return
    try {
      await inviteMuteSupabaseService.expireMute(accountId, target.userId)
    } catch {
      // The local unmute still takes effect while the connection recovers.
    }
  },

  isMuted: (target: InviteMuteTarget) => {
    const now = Date.now()
    const keys = targetKeys(target)
    return keys.some((key) => {
      const sessionRecord = get().sessionMutedMap[key]
      if (sessionRecord?.until > now) return true
      const accountRecord = get().accountMutedMap[key]
      return Boolean(accountRecord && accountRecord.until > now)
    })
  },
}))
