import axios from 'axios'
import { apiClient, clearToken, getToken, saveToken } from '@/services/http/api-client'
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
  /** Check if there is an active session, by asking the backend to validate the saved token */
  async checkSession(): Promise<UserSession | null> {
    const token = getToken()
    if (!token) return null

    try {
      const { data } = await apiClient.get<{ user: UserSession }>('/auth/session')
      return data.user
    } catch {
      clearToken()
      return null
    }
  },

  /** Start a guest session */
  async loginAsGuest(): Promise<UserSession> {
    try {
      const { data } = await apiClient.post<AuthResponse>('/auth/guest')
      saveToken(data.token)
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

    try {
      const { data } = await apiClient.post<AuthResponse>('/auth/login', creds)
      saveToken(data.token)
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
      saveToken(data.token)
      return data.user
    } catch (err) {
      throw toFriendlyError(err, `${provider.toUpperCase()} login failed.`)
    }
  },

  /** Log out current session */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout')
    } catch {
      // Best-effort — still clear the local token below even if the request fails.
    }
    clearToken()
  },
}
