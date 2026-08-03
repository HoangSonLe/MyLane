import { http, HttpResponse } from 'msw'
import { decodeToken } from './fake-users'
import { MOCK_LAST_PLAYED } from '@/services/home/home.mock'

/**
 * Fake backend for Home (docs/ui/screen-interface-spec.md § Home). Guests
 * get no last-played data — matches docs/product/README.md: guest progress
 * has no server-side save.
 */
export const homeHandlers = [
  http.get('/api/home', ({ request }) => {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = token ? decodeToken(token) : null
    const lastPlayed = user && !user.isGuest ? MOCK_LAST_PLAYED : null
    return HttpResponse.json({ lastPlayed })
  }),
]
