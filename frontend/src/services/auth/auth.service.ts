import axios from 'axios'
import { apiClient, clearToken, getCachedUser, getToken, saveToken } from '@/services/http/api-client'
import { isSupabaseConfigured } from '@/services/backend-config'
import { authSupabaseService, getSupabaseClient } from '@/services/supabase'
import type { AuthCredentials } from './auth.interface'

export interface UserSession {
  id: string
  name: string
  email?: string
  isGuest: boolean
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
            const userSession: UserSession = {
              id: data.user.id,
              name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Player',
              email: data.user.email,
              isGuest: false,
              elo: 1000,
            }
            saveToken('supabase_session_token', userSession)
            return userSession
          }
        } catch {
          // Gracefully fallback to cached user below
        }
      }

      const cachedUser = getCachedUser()
      if (cachedUser && !cachedUser.isGuest) {
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
      } catch (err: any) {
        if (err?.message?.toLowerCase().includes('rate limit')) {
          throw new Error('Supabase email rate limit exceeded. Please log in with an existing account or play as Guest!')
        }
        try {
          const user = await authSupabaseService.registerWithEmail(creds.email, creds.password, creds.email.split('@')[0])
          if (user) {
            saveToken('supabase_session_token', user)
            return user
          }
        } catch (regErr: any) {
          if (regErr?.message?.toLowerCase().includes('rate limit')) {
            throw new Error('Supabase email rate limit reached (3/hour on free tier). Please log in with an existing account or play as Guest!')
          }
          throw new Error(regErr.message || err.message || 'Supabase authentication failed')
        }
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
