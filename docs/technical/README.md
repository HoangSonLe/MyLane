# Technical Documentation

## Purpose

This directory contains architecture and implementation decisions for Memory Arena's backend and platform.

**Primary source:** [`MEMORY_ARENA_GAME_DESIGN.md`](../../MEMORY_ARENA_GAME_DESIGN.md) §16–18 (repo root). This document restructures that section into the dedicated technical-docs location `AGENTS.md`/`CLAUDE.md` expect.

Per [`AGENTS.md`](../../AGENTS.md): never change this architecture, replace a library, or migrate database technology without permission.

---

## Goals

Zero-cost start · mobile-first web game · fast to build · easy to scale later · reuse existing React + .NET experience.

---

## AI Workflow Docs

- [AI Development Workflow](ai-workflow.md)
- [AI Prompts](ai-prompts.md)
- [AI Coding Rules](ai-coding-rules.md)
- [v0 Screen Prompts](v0-screen-prompts.md) — per-screen, content-only prompts for v0
- [Screen Display Data Models](screen-display-data-models.md) — screen-level view models for rendering UI

---

## Stack (Version 1)

| Layer | Technology |
|---|---|
| Frontend framework | React 19 + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI components | shadcn/ui |
| Client state | Zustand |
| Server state | TanStack Query |
| Forms | React Hook Form + Zod |
| Animation | Motion (Framer Motion) |
| Icons | Lucide React |
| PWA | vite-plugin-pwa |
| Backend framework | ASP.NET Core 9 Web API |
| Realtime | SignalR |
| ORM | Entity Framework Core |
| Validation | FluentValidation |
| Authentication | Google OAuth + JWT |
| Logging | Serilog |
| Database | PostgreSQL |
| Cache | Redis |
| Object storage (avatars) | Cloudflare R2 |
| Source control | GitHub |
| CI/CD | GitHub Actions |
| Container | Docker / Docker Compose |

**Explicitly not used in Version 1** (and why):

- Next.js — no SSR/SEO need, this is an SPA game.
- Redux — Zustand is simpler and sufficient.
- NestJS / Fastify — team already has ASP.NET Core experience.
- Firebase / MongoDB — data is relational, PostgreSQL fits better.
- Unity / Godot / Phaser — this is UI + logic heavy, React is sufficient; not a real-time rendering engine game.

---

## Architecture (Version 1)

```
                React + Vite (PWA)
                        │
        TanStack Query │ SignalR
                        │
               ASP.NET Core API
                 ├──────────────┐
                 │              │
            PostgreSQL        Redis
```

## Local Development

```
Docker Compose
├── Frontend
├── ASP.NET Core API
├── PostgreSQL
└── Redis
```

Single command to bring up the full environment: `docker compose up`.

## Hosting (free tier, Version 1)

- **Frontend**: Vercel or Cloudflare Pages
- **Database**: Neon PostgreSQL (free) or Supabase PostgreSQL (free)
- **Redis**: Upstash Redis (free)
- **Backend**: local Docker during development; Railway or Render (free tier) for online demo

---

## Version 1 Feature Scope

- **Auth**: Google login, Guest login
- **Gameplay**: Numbers, Alphabet, Grid (see [`docs/gameplay/`](../gameplay/README.md))
- **Modes**: Solo Practice, Solo Ranked, Versus Ranked/Unranked (basic), Endless (post-Level 10)
- **User**: Profile, Best Score, Elo, Match History
- **Ranking**: Global Leaderboard, Friends Leaderboard
- **Mobile**: Responsive, PWA, Fullscreen
- **UX**: Animation, Loading, Error states, basic haptic feedback

---

## Implementation-Critical Rules

- Versus matches **must** use a single server-generated `seed` so both players receive an identical puzzle.
- Viewing/Answering countdown timers must be server-controlled — the client only displays them; never trust client-side timing for scoring/anti-cheat.
- Basic anti-cheat: rate-limit input speed, detect abnormal/bot-like input patterns.
- Guest progress/config is stored in `localStorage`; synced to the server on login.
- Reconnect window during Versus: **60 seconds**. Timing out while disconnected counts as a loss.
- All tunable numbers (level count, timers, mode coefficients, K-factor, etc.) live in server-side config, not hard-coded in core logic.

---

## Scaling Roadmap

No framework changes at any stage below — only infrastructure and service topology change.

**~100 concurrent players** — move off free hosting tiers, deploy to a single Ubuntu VPS:

```
Ubuntu VPS
Docker Compose
├── React
├── ASP.NET Core
├── PostgreSQL
├── Redis
└── Nginx
```

**~1,000 players** — add HTTPS, Cloudflare CDN, database backups, monitoring:

```
Cloudflare → Nginx → ASP.NET Core → PostgreSQL / Redis
```

**~10,000 players** — split into services behind an API Gateway:

```
React → API Gateway → User API (login/profile/friends/history/leaderboard, PostgreSQL)
                     → Game API (match/room/realtime/countdown, SignalR Hub, Redis)
```

**~100,000 players** — only if SignalR becomes the bottleneck, split out a dedicated game server:

```
React → Load Balancer → ASP.NET Core API (login/user/profile/history/ranking, PostgreSQL)
                       → Go Game Server (matchmaking/room/WebSocket/tournament, Redis Pub/Sub)
```

**Later, if needed**: RabbitMQ/Kafka/BackgroundService, Sentry/Grafana/Prometheus, MinIO, Kubernetes — none required for Version 1.

---

## Recommended Build Order

1. 3 core games running in Solo Practice (Numbers → Alphabet → Grid).
2. Mobile UX basics + haptics.
3. Onboarding + short tutorial.
4. Account system (Guest + Google login).
5. Save Best Score + highest level.
6. Scoring formula + Solo Ranked.
7. Endless Mode (post-Level 10).
8. Basic Versus (room code + shared seed + server timer).
9. Simple Elo + Global Leaderboard.
10. Friends (add + invite to match).
11. PWA + mobile polish.
12. Bug fixing, demo prep.

Source: [`MEMORY_ARENA_GAME_DESIGN.md`](../../MEMORY_ARENA_GAME_DESIGN.md) §§11, 12, 16–18.
