import axios from 'axios'
import { apiClient, clearToken, getCachedUser, getToken, saveToken } from '@/services/http/api-client'
import { isSupabaseConfigured } from '@/services/backend-config'
import { authSupabaseService, getSupabaseClient } from '@/services/supabase'
import type { AuthCredentials } from './auth.interface'
import { calculateOverallElo } from '@/lib/utils'

export interface UserSession {
  id: string
  name: string
  email?: string
  isGuest: boolean
  isAdmin?: boolean
  avatarUrl?: string
  elo: number
}

interface AuthResponse {
  user: UserSession
  token: string
}

function toFriendlyError(err: unknown, fallback: string): Error {
  if (axios.isAxiosError(err)) {
    if (err.response) {
      const message = (err.response.data as { message?: string } | undefined)?.message
      return new Error(message ?? fallback)
    }
    return new Error('Network error. Please check your connection and try again.')
  }
  return err instanceof Error ? err : new Error(fallback)
}

export const authService = {
  /** Check if there is an active session, by asking Supabase or backend */
  async checkSession(): Promise<UserSession | null> {
    const token = getToken()

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient()
      if (supabase) {
        try {
          const { data } = await supabase.auth.getUser()
          if (data?.user) {
            const userId = data.user.id
            const [{ data: profile }, { data: eloRows }] = await Promise.all([
              supabase.from('profiles').select('name, avatar_url, overall_elo, is_admin').eq('id', userId).maybeSingle(),
              supabase.from('category_elo').select('category, elo').eq('user_id', userId),
            ])

            const overallElo = calculateOverallElo(eloRows, profile?.overall_elo || 1000)

            const userSession: UserSession = {
              id: userId,
              name: profile?.name || data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Player',
              email: data.user.email,
              isGuest: false,
              isAdmin: Boolean(profile?.is_admin),
              avatarUrl: profile?.avatar_url || data.user.user_metadata?.avatar_url || undefined,
              elo: overallElo,
            }
            saveToken('supabase_session_token', userSession)
            return userSession
          }
        } catch {
          // Gracefully fallback to cached user below
        }
      }

      const cachedUser = getCachedUser()
      if (cachedUser) {
        if (supabase && cachedUser.id) {
          try {
            const [{ data: profile }, { data: eloRows }] = await Promise.all([
              supabase.from('profiles').select('name, avatar_url, overall_elo').eq('id', cachedUser.id).maybeSingle(),
              supabase.from('category_elo').select('category, elo').eq('user_id', cachedUser.id),
            ])

            if (profile) {
              const overallElo = calculateOverallElo(eloRows, profile.overall_elo ?? cachedUser.elo ?? 1000)

              const updated: UserSession = {
                ...cachedUser,
                name: profile.name || cachedUser.name,
                avatarUrl: profile.avatar_url || cachedUser.avatarUrl,
                elo: overallElo,
              }
              saveToken(token || 'cached_token', updated)
              return updated
            }
          } catch {
            // Keep cachedUser if query fails
          }
        }
        return cachedUser
      }
      return null
    }

    if (!token) {
      clearToken()
      return null
    }

    const cachedUser = getCachedUser()

    // Background validation request for non-Supabase mode
    apiClient
      .get<{ user: UserSession }>('/auth/session')
      .then(({ data }) => {
        saveToken(token, data.user)
      })
      .catch(() => {
        clearToken()
      })

    if (cachedUser) {
      return cachedUser
    }

    try {
      const { data } = await apiClient.get<{ user: UserSession }>('/auth/session')
      saveToken(token, data.user)
      return data.user
    } catch {
      clearToken()
      return null
    }
  },

  /** Start a guest session */
  async loginAsGuest(): Promise<UserSession> {
    if (isSupabaseConfigured()) {
      const user = await authSupabaseService.loginAsGuest()
      if (user) {
        saveToken('guest_token', user)
        return user
      }
    }
    try {
      const { data } = await apiClient.post<AuthResponse>('/auth/guest')
      saveToken(data.token, data.user)
      return data.user
    } catch (err) {
      throw toFriendlyError(err, 'Failed to start guest session.')
    }
  },

  /** Authenticate with email & password */
  async loginWithEmail(creds: AuthCredentials): Promise<UserSession> {
    if (!navigator.onLine) {
      throw new Error('You are offline. Log in requires an active internet connection.')
    }

    if (isSupabaseConfigured()) {
      try {
        const user = await authSupabaseService.loginWithEmail(creds.email, creds.password)
        if (user) {
          saveToken('supabase_session_token', user)
          return user
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.message.toLowerCase().includes('rate limit')) {
          throw new Error('Supabase email rate limit exceeded. Please log in with an existing account or play as Guest!')
        }
        throw toFriendlyError(err, 'Invalid credentials or login failed.')
      }
    }

    try {
      const { data } = await apiClient.post<AuthResponse>('/auth/login', creds)
      saveToken(data.token, data.user)
      return data.user
    } catch (err) {
      throw toFriendlyError(err, 'Invalid credentials or login failed.')
    }
  },

  /** Register a new account with email & password */
  async registerWithEmail(creds: AuthCredentials): Promise<UserSession> {
    if (!navigator.onLine) {
      throw new Error('You are offline. Registration requires an active internet connection.')
    }

    if (isSupabaseConfigured()) {
      try {
        const user = await authSupabaseService.registerWithEmail(
          creds.email,
          creds.password,
          creds.email.split('@')[0],
        )
        if (user) {
          saveToken('supabase_session_token', user)
          return user
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.message.toLowerCase().includes('rate limit')) {
          throw new Error('Supabase email rate limit reached. Please try again later or play as Guest!')
        }
        throw toFriendlyError(err, 'Account registration failed.')
      }
    }

    try {
      const { data } = await apiClient.post<AuthResponse>('/auth/register', creds)
      saveToken(data.token, data.user)
      return data.user
    } catch (err) {
      throw toFriendlyError(err, 'Account registration failed.')
    }
  },

  /** Authenticate with OAuth provider */
  async loginWithOAuth(provider: 'google' | 'discord'): Promise<UserSession> {
    if (!navigator.onLine) {
      throw new Error(`You are offline. ${provider.toUpperCase()} login requires an active connection.`)
    }

    try {
      const { data } = await apiClient.post<AuthResponse>(`/auth/oauth/${provider}`)
      saveToken(data.token, data.user)
      return data.user
    } catch (err) {
      throw toFriendlyError(err, `${provider.toUpperCase()} login failed.`)
    }
  },

  /** Log out current session */
  async logout(): Promise<void> {
    if (isSupabaseConfigured()) {
      await authSupabaseService.logout()
    } else {
      try {
        await apiClient.post('/auth/logout')
      } catch {
        // Best-effort — still clear local token
      }
    }
    clearToken()
  },
}
