# Fake Auth backend — two ways

There's no real backend yet (Version 1 plans ASP.NET Core, see
`docs/technical/README.md`). Until then, `authService`
(`src/services/auth/auth.service.ts`) calls `/api/auth/*` over real HTTP
via Axios, answered by one of two interchangeable fake backends:

| Mode | What answers the request | Where |
|---|---|---|
| `msw` (default) | A Service Worker intercepts the request in-browser | `src/mocks/handlers.ts` |
| `server` | A real Node/Express process on its own port | `mock-server/index.mjs` |

Both implement the same contract (`/auth/guest`, `/auth/login`, `/auth/register`,
`/auth/oauth/:provider`, `/auth/session`, `/auth/logout`) and the same
mock-token format, so switching modes doesn't change app behavior.

## Using MSW (default)

Nothing to start — `npm run dev` is enough. `src/main.tsx` boots the
worker automatically in dev when `VITE_MOCK_MODE` is not `server`.

## Using the standalone server

1. Start the fake server: `npm run mock-server` (listens on `:4310`).
2. Point the frontend at it — create `.env.development.local`
   (gitignored) in `frontend/`:
   ```
   VITE_MOCK_MODE=server
   VITE_API_BASE_URL=http://localhost:4310/api
   ```
3. Restart `npm run dev` so Vite picks up the env change.

## Swapping in the real backend later

Set `VITE_API_BASE_URL` to the real API's URL and delete the dev-mode
MSW bootstrap in `src/main.tsx` — `authService` itself doesn't change.
