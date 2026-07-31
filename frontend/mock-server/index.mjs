import express from 'express'
import { decodeToken, encodeToken, makeEmailUser, makeGuestUser, makeOAuthUser } from './fake-users.mjs'

/**
 * Standalone fake Auth backend — a real Node process, real port, real
 * network hop. Same /api/auth/* contract as src/mocks/handlers.ts (the
 * in-browser MSW version); swap between them with VITE_MOCK_MODE.
 * Stands in for the ASP.NET Core API from docs/technical/README.md
 * until that's built.
 */
const PORT = process.env.MOCK_SERVER_PORT ?? 4310

const app = express()
app.use(express.json())

// Minimal hand-rolled CORS — the Vite dev server runs on a different
// origin/port, so the browser needs these headers to allow the request.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

app.post('/api/auth/guest', (req, res) => {
  const user = makeGuestUser()
  res.json({ user, token: encodeToken(user) })
})

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body ?? {}
  if (email === 'error@test.com' || password === 'wrong') {
    return res.status(401).json({ message: 'Invalid email or password. Please try again.' })
  }
  const user = makeEmailUser(email ?? '')
  res.json({ user, token: encodeToken(user) })
})

app.post('/api/auth/oauth/:provider', (req, res) => {
  const user = makeOAuthUser(req.params.provider)
  res.json({ user, token: encodeToken(user) })
})

app.get('/api/auth/session', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const user = token ? decodeToken(token) : null
  if (!user) return res.sendStatus(401)
  res.json({ user })
})

app.post('/api/auth/logout', (req, res) => {
  res.sendStatus(204)
})

app.listen(PORT, () => {
  console.log(`[mock-server] fake Auth API listening on http://localhost:${PORT}`)
})
