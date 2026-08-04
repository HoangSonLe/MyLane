import { http, HttpResponse } from 'msw'
import { decodeToken, encodeToken, makeEmailUser, makeGuestUser, makeOAuthUser } from './fake-users'

const registeredEmails = new Set<string>()

/**
 * Fake backend for Auth, reachable at the same /api/auth/* paths the real
 * ASP.NET Core API will use later (docs/technical/README.md). Requests still
 * go out over the network — MSW intercepts them via a Service Worker, so
 * they're visible in the DevTools Network tab like a real call.
 */
export const authHandlers = [
  http.post('/api/auth/guest', () => {
    const user = makeGuestUser()
    return HttpResponse.json({ user, token: encodeToken(user) })
  }),

  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = (await request.json()) as { email: string; password: string }
    if (email === 'error@test.com' || password === 'wrong') {
      return HttpResponse.json(
        { message: 'Invalid email or password. Please try again.' },
        { status: 401 },
      )
    }
    const user = makeEmailUser(email)
    return HttpResponse.json({ user, token: encodeToken(user) })
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const { email, password } = (await request.json()) as { email?: string; password?: string }
    const normalizedEmail = email?.trim().toLowerCase()

    if (!normalizedEmail || !password) {
      return HttpResponse.json(
        { message: 'Email and password are required.' },
        { status: 400 },
      )
    }
    if (registeredEmails.has(normalizedEmail)) {
      return HttpResponse.json(
        { message: 'An account with this email already exists.' },
        { status: 409 },
      )
    }

    registeredEmails.add(normalizedEmail)
    const user = makeEmailUser(normalizedEmail)
    return HttpResponse.json({ user, token: encodeToken(user) }, { status: 201 })
  }),

  http.post('/api/auth/oauth/:provider', ({ params }) => {
    const provider = params.provider as 'google' | 'discord'
    const user = makeOAuthUser(provider)
    return HttpResponse.json({ user, token: encodeToken(user) })
  }),

  http.get('/api/auth/session', ({ request }) => {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = token ? decodeToken(token) : null
    if (!user) return new HttpResponse(null, { status: 401 })
    return HttpResponse.json({ user })
  }),

  http.post('/api/auth/logout', () => new HttpResponse(null, { status: 204 })),
]
