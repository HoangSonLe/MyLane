import { create } from 'zustand'
import { authService, UserSession } from '@/services/auth/auth.service'
import type { AuthCredentials } from '@/services/auth/auth.interface'

interface AuthState {
  user: UserSession | null
  isLoading: boolean
  isInitialized: boolean
  errorMessage: string | null

  checkSession: () => Promise<UserSession | null>
  loginAsGuest: () => Promise<UserSession>
  loginWithEmail: (creds: AuthCredentials) => Promise<UserSession>
  loginWithOAuth: (provider: 'google' | 'discord') => Promise<UserSession>
  logout: () => Promise<void>
  clearError: () => void
}

/**
 * Zustand global store for Auth & User Session state.
 * Specified in docs/technical/README.md (§ Stack Version 1: Client state = Zustand).
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isInitialized: false,
  errorMessage: null,

  checkSession: async () => {
    set({ isLoading: true, errorMessage: null })
    try {
      const user = await authService.checkSession()
      set({ user, isLoading: false, isInitialized: true })
      return user
    } catch {
      set({ user: null, isLoading: false, isInitialized: true })
      return null
    }
  },

  loginAsGuest: async () => {
    set({ isLoading: true, errorMessage: null })
    try {
      const user = await authService.loginAsGuest()
      set({ user, isLoading: false })
      return user
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to start guest session.'
      set({ isLoading: false, errorMessage: msg })
      throw err
    }
  },

  loginWithEmail: async (creds) => {
    set({ isLoading: true, errorMessage: null })
    try {
      const user = await authService.loginWithEmail(creds)
      set({ user, isLoading: false })
      return user
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials or login failed.'
      set({ isLoading: false, errorMessage: msg })
      throw err
    }
  },

  loginWithOAuth: async (provider) => {
    set({ isLoading: true, errorMessage: null })
    try {
      const user = await authService.loginWithOAuth(provider)
      set({ user, isLoading: false })
      return user
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `${provider.toUpperCase()} login failed.`
      set({ isLoading: false, errorMessage: msg })
      throw err
    }
  },

  logout: async () => {
    set({ isLoading: true })
    await authService.logout()
    set({ user: null, isLoading: false })
  },

  clearError: () => set({ errorMessage: null }),
}))
