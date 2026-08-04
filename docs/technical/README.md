# Technical Documentation

## Purpose

This directory contains architecture and implementation decisions for My Lane's backend and platform.

**Primary source:** [`MY_LANE_GAME_DESIGN.md`](../../MY_LANE_GAME_DESIGN.md) §16–18 (repo root). This document restructures that section into the dedicated technical-docs location `AGENTS.md`/`CLAUDE.md` expect.

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
- [Mock Auth API](mock-auth-api.md) — how login is faked (MSW + standalone mock server) until the ASP.NET Core API exists
- [Known Gaps](known-gaps.md) — logic that's still mock/local/prototype despite the UI looking real; track here before implementing

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
| HTTP client | Axios |
| Forms | React Hook Form + Zod |
| Animation | Motion (Framer Motion) |
| Icons | Lucide React |
| PWA | vite-plugin-pwa |
| Backend provider (Primary) | ASP.NET Core 9 Web API + SignalR |
| Backend provider (Cloud/BaaS) | Supabase (PostgreSQL + Auth + Realtime WebSockets + Storage) |
| Backend provider (Dev/Offline) | MSW (Mock Service Worker) + Node mock-server |
| ORM | Entity Framework Core / Supabase Client |
| Validation | FluentValidation |
| Authentication | Google OAuth + JWT / Supabase Auth |
| Logging | Serilog |
| Database | PostgreSQL |
| Cache | Redis |
| Object storage (avatars) | Supabase Storage (`avatars` public bucket, owner-write policies) |
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
- **User**: Profile editing, Supabase-hosted avatar, Best Score, Elo, Match History
- **Social**: Friend search plus QR/deep-link friend requests with profile preview
- **Ranking**: Global Leaderboard, Friends Leaderboard
- **Mobile**: Responsive, PWA, Fullscreen
- **UX**: Animation, Loading, Error states, basic haptic feedback

---

## Implementation-Critical Rules

- Versus matches **must** use a single server-generated `seed` so both players receive an identical puzzle.
- Viewing/Answering countdown timers must be server-controlled — the client only displays them; never trust client-side timing for scoring/anti-cheat.
- Basic anti-cheat: rate-limit input speed, detect abnormal/bot-like input patterns.
- Guest progress/config is stored in `localStorage`; synced to the server on login.
- First-run presentation defaults to locale `vi` and theme `light`. Existing local/server preferences remain authoritative and are never reset by this default.
- Avatar uploads are JPEG/PNG/WebP only, capped at 2 MB by Storage policy, and written under `<auth.uid()>/avatar.webp`; public reads are allowed while writes are restricted to the owner folder.
- Friend QR payloads are versioned app links (`?friend=<profile-id>&v=1`). Resolve the profile and current friendship server-side before enabling the send action; never encode mutable profile fields in the QR.
- Timed challenge-invite mutes are keyed by immutable profile ID and synchronized through the account's `invite_mutes` rows plus Supabase Realtime. The "end of session" option is intentionally client-session-only.
- Versus lifecycle deadlines are server-authoritative and independent: queue attempts expire after 60 seconds, pending invites after 30 seconds, and `waiting` rooms after 10 minutes without a participant heartbeat or successful room mutation. `versus_rooms.expires_at`, its trigger, RLS read filter, and cleanup RPC use the database clock; read polling/Realtime/Presence do not refresh it, and non-waiting rooms are exempt.
- Reconnect window during Versus: **60 seconds**. Timing out while disconnected counts as a loss.
- All tunable numbers (level count, timers, mode coefficients, K-factor, etc.) live in server-side config, not hard-coded in core logic.

---

## Scaling & Hybrid Microservice Architecture (C# + Go)

No framework changes at Version 1 — only infrastructure and service topology change as the platform scales.

### Phase 1 (Version 1 - MVP): Single Stack (C# ASP.NET Core 9)
- **C# ASP.NET Core 9 + SignalR**: Selected for initial fast time-to-market. SignalR provides built-in WebSocket fallback, room management, and session reconnect out of the box. Handles ~10,000 to 50,000 concurrent connections comfortably on standard VPS.

### Phase 2 (High Scale / Hybrid Integration): C# + Go Microservices
When scaling beyond 50,000–100,000 concurrent players or when high-throughput matchmaking requires minimal RAM overhead, **Golang services are added alongside C# without rewriting Version 1 core logic**:

```text
                           React 19 Frontend
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
   C# ASP.NET Core Backend                      Go Microservices (Incremental)
(Auth, Profile, Leaderboard, DB)               (Matchmaking, Dedicated 1v1 PvP, Tournament)
              │                                         │
              └────────────────────┬────────────────────┘
                                   ▼
                       gRPC / Redis Pub/Sub
```

- **C# ASP.NET Core**: Retained for complex business logic, CRUD, Auth, User Profiles, Leaderboard, and PostgreSQL operations.
- **Go Microservices (Added incrementally)**:
  - **Go Matchmaking Engine**: High-speed player queue matching with minimal latency.
  - **Go Game Server**: Lightweight WebSocket server handling 1v1 PvP state streams and server-controlled countdowns using Goroutines.
  - **Go Tournament Engine**: High-concurrency tournament ladder processing.
- **Inter-service Communication**: C# and Go services communicate via high-performance **gRPC** calls and **Redis Pub/Sub** message streams.

---

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

**~100,000 players** — split out dedicated Go game server:

```
React → Load Balancer → ASP.NET Core API (login/user/profile/history/ranking, PostgreSQL)
                       → Go Game Server (matchmaking/room/WebSocket/tournament via gRPC & Redis Pub/Sub)
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

Source: [`MY_LANE_GAME_DESIGN.md`](../../MY_LANE_GAME_DESIGN.md) §§11, 12, 16–18.
