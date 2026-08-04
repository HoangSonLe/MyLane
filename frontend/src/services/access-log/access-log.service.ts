import { getSupabaseClient } from '@/services/supabase'
import { isSupabaseConfigured } from '@/services/backend-config'
import type { UserSession } from '@/services/auth/auth.service'

export interface AccessLogEntry {
  id: string
  user_id: string | null
  user_name: string
  user_email?: string | null
  is_guest: boolean
  user_agent?: string | null
  device_type: string
  device_id?: string | null
  page_path: string
  ip_address?: string | null
  location_name?: string | null
  latitude?: number | null
  longitude?: number | null
  created_at: string
}

export interface LogAccessParams {
  user: UserSession | null
  pagePath?: string
}

interface LocationInfo {
  ip?: string
  city?: string
  country?: string
  latitude?: number
  longitude?: number
  locationName?: string
}

let cachedLocation: LocationInfo | null = null

/**
 * Generate a STABLE, DETERMINISTIC Device Fingerprint ID per physical machine/browser.
 * Hashes hardware screen specs, user agent, timezone, CPU cores & touch points.
 * Ensures the same mobile phone or computer ALWAYS gets the exact same DEV-XXXXXX ID on every reload.
 */
export function getOrCreateVisitorDeviceId(): string {
  const STORAGE_KEY = 'gb_visitor_device_id'

  // 1. Try reading persisted ID from localStorage
  try {
    const existing = localStorage.getItem(STORAGE_KEY)
    if (existing) return existing
  } catch {
    // Ignore storage errors
  }

  // 2. Build stable hardware fingerprint string
  const components = [
    navigator.userAgent || '',
    navigator.language || '',
    `${window.screen?.width || 0}x${window.screen?.height || 0}x${window.screen?.colorDepth || 0}`,
    navigator.hardwareConcurrency || 0,
    navigator.maxTouchPoints || 0,
    Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone || '',
  ]

  const str = components.join('|')
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }

  const devId = 'DEV-' + Math.abs(hash).toString(36).substring(0, 6).toUpperCase().padStart(6, '0')

  try {
    localStorage.setItem(STORAGE_KEY, devId)
  } catch {
    // Ignore storage errors
  }

  return devId
}

/** Utility to detect device type from User-Agent */
function parseDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  if (/mobile|android|iphone|ipad|ipod|windows phone/i.test(ua)) {
    if (/ipad|tablet/i.test(ua)) return 'Tablet'
    return 'Mobile'
  }
  return 'Desktop'
}

/** Format User-Agent to clean browser & OS name */
export function formatUserAgent(ua?: string | null): string {
  if (!ua) return 'Unknown Browser'
  if (ua.includes('Edg/')) return 'Edge'
  if (ua.includes('Chrome/')) return 'Chrome'
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari'
  if (ua.includes('Firefox/')) return 'Firefox'
  return 'Web Browser'
}

/** Automatically fetch IP Geolocation in background */
async function fetchLocationInfo(): Promise<LocationInfo> {
  if (cachedLocation) return cachedLocation
  try {
    const res = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(3000) })
    if (res.ok) {
      const data = await res.json()
      if (data && data.success !== false) {
        cachedLocation = {
          ip: data.ip,
          city: data.city,
          country: data.country,
          latitude: data.latitude,
          longitude: data.longitude,
          locationName: [data.city, data.country].filter(Boolean).join(', ') || 'Unknown Location',
        }
        return cachedLocation
      }
    }
  } catch {
    // Silent catch on network timeout or adblocker
  }

  // Fallback: ask browser geolocation if available
  return new Promise((resolve) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          cachedLocation = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            locationName: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
          }
          resolve(cachedLocation)
        },
        () => resolve({ locationName: 'Không xác định' }),
        { timeout: 3000 }
      )
    } else {
      resolve({ locationName: 'Không xác định' })
    }
  })
}

// In-memory fallback cache when offline or without Supabase
const LOCAL_ACCESS_LOGS: AccessLogEntry[] = []

// Auto-prune settings
const MAX_LOG_ROWS = 5000
const MAX_LOG_AGE_DAYS = 30

/**
 * Read throttle window in milliseconds from environment variable (VITE_ACCESS_LOG_THROTTLE_MINUTES).
 * Defaults to 60 minutes (1 hour) if omitted or invalid.
 */
export function getThrottleWindowMs(): number {
  const envMinutes = import.meta.env?.VITE_ACCESS_LOG_THROTTLE_MINUTES
  const parsed = Number(envMinutes)
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.round(parsed * 60 * 1000)
  }
  return 60 * 60 * 1000 // Default 60 minutes (1 hour)
}

/**
 * Background pruning — fire-and-forget, never blocks log writes.
 * Deletes:
 *   1. Rows older than MAX_LOG_AGE_DAYS days
 *   2. Excess rows beyond MAX_LOG_ROWS (oldest first)
 */
async function pruneOldLogsBackground(): Promise<void> {
  if (!isSupabaseConfigured()) return
  const supabase = getSupabaseClient()
  if (!supabase) return

  try {
    // 1. Delete entries older than 30 days
    const cutoffDate = new Date(Date.now() - MAX_LOG_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString()
    await supabase.from('access_logs').delete().lt('created_at', cutoffDate)

    // 2. If still over MAX_LOG_ROWS, delete the oldest excess rows
    const { count } = await supabase
      .from('access_logs')
      .select('id', { count: 'exact', head: true })

    if ((count ?? 0) > MAX_LOG_ROWS) {
      const excess = (count ?? 0) - MAX_LOG_ROWS
      const { data: oldest } = await supabase
        .from('access_logs')
        .select('id')
        .order('created_at', { ascending: true })
        .limit(excess)

      if (oldest && oldest.length > 0) {
        const ids = oldest.map((r: { id: string }) => r.id)
        await supabase.from('access_logs').delete().in('id', ids)
      }
    }
  } catch {
    // Silent — pruning is best-effort only
  }
}

/**
 * Check Supabase DB for a recent log entry within the throttle window (VITE_ACCESS_LOG_THROTTLE_MINUTES).
 * Falls back to in-memory check when Supabase is unavailable.
 */
async function isRecentlyLoggedInDB(user: UserSession | null, deviceId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  const supabase = getSupabaseClient()
  if (!supabase) return false

  try {
    const windowMs = getThrottleWindowMs()
    const cutoffAgo = new Date(Date.now() - windowMs).toISOString()

    let query = supabase
      .from('access_logs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', cutoffAgo)

    if (user && !user.isGuest) {
      // Logged-in user: throttle by user_id
      query = query.eq('user_id', user.id)
    } else {
      // Guest: throttle by device_id
      query = query.eq('device_id', deviceId).is('user_id', null)
    }

    const { count } = await query
    return (count ?? 0) > 0
  } catch {
    return false
  }
}

export const accessLogService = {
  /** Log visitor access entry — throttled via DB check (VITE_ACCESS_LOG_THROTTLE_MINUTES) */
  _isLogging: false,
  async logAccess({ user, pagePath = window.location.pathname }: LogAccessParams): Promise<void> {
    // Mutex: prevent concurrent calls from both passing the DB throttle check
    if (this._isLogging) return
    this._isLogging = true

    try {
      const userAgent = navigator.userAgent || ''
      const deviceType = parseDeviceType(userAgent)
      const deviceId = getOrCreateVisitorDeviceId()
      const loc = await fetchLocationInfo()

      // DB-side throttle: skip if a recent log exists within 1 hour
      const alreadyLogged = await isRecentlyLoggedInDB(user, deviceId)
      if (alreadyLogged) return

      const entry: AccessLogEntry = {
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        user_id: user ? user.id : null,
        user_name: user ? user.name : 'Khách vãng lai (Guest)',
        user_email: user?.email || null,
        is_guest: user ? user.isGuest : true,
        user_agent: userAgent,
        device_type: deviceType,
        device_id: deviceId,
        page_path: pagePath,
        ip_address: loc.ip || null,
        location_name: loc.locationName || 'Không xác định',
        latitude: loc.latitude || null,
        longitude: loc.longitude || null,
        created_at: new Date().toISOString(),
      }

      // Always append to local in-memory log
      LOCAL_ACCESS_LOGS.unshift(entry)
      if (LOCAL_ACCESS_LOGS.length > 200) LOCAL_ACCESS_LOGS.pop()

      // Send to Supabase if configured
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient()
        if (supabase) {
          try {
            await supabase.from('access_logs').insert({
              user_id: entry.user_id,
              user_name: entry.user_name,
              user_email: entry.user_email,
              is_guest: entry.is_guest,
              user_agent: entry.user_agent,
              device_type: entry.device_type,
              device_id: entry.device_id,
              page_path: entry.page_path,
              ip_address: entry.ip_address,
              location_name: entry.location_name,
              latitude: entry.latitude,
              longitude: entry.longitude,
            })
            // Fire-and-forget background prune after successful insert
            void pruneOldLogsBackground()
          } catch (err) {
            console.warn('[AccessLog] Failed to persist log to Supabase:', err)
          }
        }
      }
    } finally {
      // Always release mutex so future log calls (after 10 min) are allowed
      this._isLogging = false
    }
  },

  /**
   * Manually trigger a prune (Admin only) — e.g. from Settings panel.
   * Respects same MAX_LOG_ROWS / MAX_LOG_AGE_DAYS limits.
   */
  async pruneOldLogs(): Promise<void> {
    await pruneOldLogsBackground()
  },

  /** Query access logs (Admin only) */
  async getAccessLogs(limit: number = 100): Promise<AccessLogEntry[]> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient()
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('access_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit)

          if (!error && data) {
            return data as AccessLogEntry[]
          }
        } catch (err) {
          console.warn('[AccessLog] Error fetching logs from Supabase:', err)
        }
      }
    }

    // Return in-memory logs fallback
    return LOCAL_ACCESS_LOGS.slice(0, limit)
  },

  /** Clear access logs (Admin only) */
  async clearAccessLogs(): Promise<void> {
    LOCAL_ACCESS_LOGS.length = 0
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient()
      if (supabase) {
        await supabase.from('access_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      }
    }
  },
}
