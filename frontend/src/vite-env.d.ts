/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Which fake Auth backend to use in dev: 'msw' (default, in-browser) or 'server' (standalone Node process). */
  readonly VITE_MOCK_MODE?: 'msw' | 'server'
  /** Base URL for the Auth API. Defaults to '/api' (same-origin, required for MSW). */
  readonly VITE_API_BASE_URL?: string
}
