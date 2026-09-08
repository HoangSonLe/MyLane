import {
  createClient,
  type RealtimeChannel,
  type RealtimeChannelOptions,
  type SupabaseClient,
} from '@supabase/supabase-js'
import { getBackendConfig } from '../backend-config'

let supabaseInstance: SupabaseClient | null = null

/**
 * Opens a Realtime channel on `topic`, first waiting for any previous channel
 * still registered under the same topic to finish leaving.
 *
 * Why: realtime-js `channel()` returns the *existing* channel object while
 * the previous one is still leaving, and `subscribe()` is a no-op on a
 * channel that is not closed. An unmount + remount on the same topic
 * (Home ↔ Lobby `friendships:`, an effect re-run on locale change, React
 * StrictMode in dev) therefore used to produce a silently dead
 * subscription that only the polling fallbacks masked.
 *
 * `setup` receives a fresh channel and must attach `.on(...)` handlers and
 * call `.subscribe()`. The returned function unsubscribes and is safe to
 * call before `setup` has run.
 */
export function openRealtimeChannel(
  supabase: SupabaseClient,
  topic: string,
  setup: (channel: RealtimeChannel) => void,
  params?: RealtimeChannelOptions,
): () => void {
  let cancelled = false
  let channel: RealtimeChannel | null = null
  const fullTopic = `realtime:${topic}`
  const findExisting = () => supabase.getChannels().find((c) => c.topic === fullTopic)

  void (async () => {
    // A previous owner normally calls removeChannel() in its cleanup, so
    // give that leave a short window to complete before forcing it.
    for (let attempt = 0; attempt < 20 && findExisting(); attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
    const stale = findExisting()
    if (stale) await supabase.removeChannel(stale).catch(() => {})
    if (cancelled) return
    channel = supabase.channel(topic, params)
    setup(channel)
  })()

  return () => {
    cancelled = true
    if (channel) void supabase.removeChannel(channel)
  }
}

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance

  const { supabaseUrl, supabaseAnonKey } = getBackendConfig()
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })

  return supabaseInstance
}
