import { getSupabaseClient } from './supabase.client'
import type { UserSession } from '../auth/auth.service'

export const authSupabaseService = {
  /**
   * Supabase Auth: Register new user with Email & Password
   */
  async registerWithEmail(email: string, password: string, name: string): Promise<UserSession | null> {
    const supabase = getSupabaseClient()
    if (!supabase) return null

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    })

    if (error || !data.user) {
      throw new Error(error?.message || 'Registration failed')
    }

    const userId = data.user.id
    const handle = email.split('@')[0] || `user_${Date.now()}`

    // Upsert into profiles table
    await supabase.from('profiles').upsert({
      id: userId,
      name,
      handle,
      overall_elo: 1000,
      is_guest: false,
    })

    return {
      id: userId,
      name,
      email,
      isGuest: false,
      elo: 1000,
    }
  },

  /**
   * Supabase Auth: Login existing user with Email & Password
   */
  async loginWithEmail(email: string, password: string): Promise<UserSession | null> {
    const supabase = getSupabaseClient()
    if (!supabase) return null

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user) {
      throw new Error(error?.message || 'Invalid credentials')
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle()

    return {
      id: data.user.id,
      name: profile?.name || data.user.user_metadata?.full_name || 'Player',
      email: data.user.email,
      isGuest: false,
      avatarUrl: profile?.avatar_url,
      elo: profile?.overall_elo || 1000,
    }
  },

  /**
   * Supabase Auth: Anonymous Guest Login
   */
  async loginAsGuest(): Promise<UserSession | null> {
    const supabase = getSupabaseClient()

    const guestUuid = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : '00000000-0000-4000-8000-' + Date.now().toString(16).padStart(12, '0')
    const guestName = `Guest #${Math.floor(1000 + Math.random() * 9000)}`

    if (supabase) {
      try {
        await supabase.from('profiles').upsert({
          id: guestUuid,
          name: guestName,
          handle: `guest_${guestUuid.slice(0, 8)}`,
          overall_elo: 1000,
          is_guest: true,
        })
      } catch {
        // Best effort
      }
    }

    return {
      id: guestUuid,
      name: guestName,
      isGuest: true,
      elo: 1000,
    }
  },

  /**
   * Supabase Auth: Logout current user session
   */
  async logout(): Promise<void> {
    const supabase = getSupabaseClient()
    if (supabase) {
      try {
        const { data: userData } = await supabase.auth.getUser()
        if (userData?.user?.id) {
          await supabase
            .from('profiles')
            .update({
              status: 'offline',
              updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            })
            .eq('id', userData.user.id)
        }
      } catch {
        // Best-effort presence update on logout
      }
      await supabase.auth.signOut()
    }
  },
}
