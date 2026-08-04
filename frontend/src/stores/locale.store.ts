import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Locale = 'en' | 'vi'

const DEFAULT_LOCALE: Locale = 'vi'

function applyLocaleToDocument(locale: Locale) {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale
  }
}

applyLocaleToDocument(DEFAULT_LOCALE)

interface LocaleState {
  locale: Locale
  /** User-triggered — updates state AND caller is responsible for saving to the server. */
  setLocale: (locale: Locale) => void
  /**
   * Server-triggered — overwrites the local cache with the authoritative server value.
   * Does NOT save back to the server (would cause a loop).
   * Call this after a successful `GET /api/settings` on login / session restore.
   */
  syncFromServer: (locale: Locale) => void
}

/**
 * Zustand global store for the player's language preference (English /
 * Vietnamese), following the same pattern as auth.store.ts and
 * network.store.ts (docs/technical/README.md: "Client state = Zustand").
 * Persisted to localStorage so the choice survives a reload — this is the
 * store behind the previously-disabled Settings > Language row.
 */
export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (locale) => {
        applyLocaleToDocument(locale)
        set({ locale })
      },
      syncFromServer: (locale) => {
        applyLocaleToDocument(locale)
        set({ locale })
      },
    }),
    {
      name: 'ma-locale',
      onRehydrateStorage: () => (state) => {
        applyLocaleToDocument(state?.locale ?? DEFAULT_LOCALE)
      },
    },
  ),
)
