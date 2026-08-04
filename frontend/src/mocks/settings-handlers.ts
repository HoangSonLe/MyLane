import { http, HttpResponse } from 'msw'
import { decodeToken } from './fake-users'
import { MOCK_SETTINGS } from '@/services/settings/settings.mock'
import type { SettingsData } from '@/services/settings/settings.interface'
import type { Locale } from '@/stores/locale.store'

const GUEST_SETTINGS: SettingsData = { linkedMethods: [], notifications: true, sounds: true, haptics: false, locale: 'vi', theme: 'light' }

/**
 * In-memory locale store — simulates the database row for each user.
 * Keyed by user ID decoded from the mock Bearer token.
 * Resets on page reload (acceptable for dev — the real backend has a DB).
 */
const userLocales = new Map<string, Locale>()

/**
 * Fake backend for Settings (docs/ui/screen-interface-spec.md § Settings).
 * Guests still get usable defaults (no server-side account to link methods
 * to) rather than a 401 — sound/notification prefs are meaningful even for
 * a guest session.
 */
export const settingsHandlers = [
  http.get('/api/settings', ({ request }) => {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = token ? decodeToken(token) : null
    if (!user || user.isGuest) return HttpResponse.json({ settings: GUEST_SETTINGS })

    // Return saved locale if the user has changed it, otherwise fall back to seed data.
    const savedLocale = userLocales.get(user.id)
    const settings: SettingsData = {
      ...MOCK_SETTINGS,
      locale: savedLocale ?? MOCK_SETTINGS.locale,
    }
    return HttpResponse.json({ settings })
  }),

  /**
   * PATCH /api/settings/locale — persists the user's chosen language.
   * Mirrors what the real ASP.NET Core endpoint will do (update a single
   * column in the users table and return 204 No Content).
   */
  http.patch('/api/settings/locale', async ({ request }) => {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = token ? decodeToken(token) : null
    if (!user || user.isGuest) return new HttpResponse(null, { status: 401 })

    const { locale } = (await request.json()) as { locale: Locale }
    if (locale !== 'en' && locale !== 'vi') {
      return HttpResponse.json({ message: 'Invalid locale' }, { status: 400 })
    }

    userLocales.set(user.id, locale)
    return new HttpResponse(null, { status: 204 })
  }),
]
