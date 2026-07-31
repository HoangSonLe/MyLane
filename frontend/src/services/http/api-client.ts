import axios from 'axios'

const TOKEN_KEY = 'ma_token'

/**
 * Shared HTTP client (Axios, per docs/technical/README.md).
 * Points at whichever fake backend is active for local dev:
 * - VITE_MOCK_MODE=msw (default): baseURL stays relative, MSW answers in-browser.
 * - VITE_MOCK_MODE=server: baseURL points at the standalone mock-server/ process.
 * Swapping to the real ASP.NET Core API later is just changing VITE_API_BASE_URL.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}
