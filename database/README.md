# Database deployment

For a new Supabase project: apply `schema.sql`. That is the only file needed —
it defines every table, index, RLS policy, trigger, and RPC function
(matchmaking, Versus room lifecycle, challenge invites, waiting-room TTL,
match-history score sync) in one idempotent script safe to re-run.

Notable behavior baked into `schema.sql`:

- Creates the public `avatars` Storage bucket (guarded so it's skipped when
  the Supabase `storage` schema isn't present, e.g. the local Postgres smoke
  bootstrap) with owner-folder object policies.
- New `user_settings` rows default to locale `vi` and theme `light`; existing
  preferences are never reset.
- Cross-user writes to `versus_rooms`, `matchmaking_queue`, `match_invites`,
  and `category_elo` are only possible through the granted `SECURITY DEFINER`
  RPC functions — direct table policies are read-only for those tables.
- `versus_rooms.expires_at` enforces a server-clock 10-minute TTL on rooms
  still `waiting`; `heartbeat_versus_room` and `expire_stale_waiting_rooms`
  maintain and sweep it.
- `category_bests` tracks Solo Ranked and Versus Ranked bests separately
  (`solo_ranked_*` / `versus_ranked_*`); `ranked_score`/`ranked_level` stay as
  generated `GREATEST()` columns so existing readers (Leaderboard, Profile)
  keep working unchanged.

`tests/bootstrap_supabase.sql`, `tests/atomic_versus_flows.smoke.sql`,
`tests/waiting_room_ttl.smoke.sql`, and `tests/account_invite_mutes.smoke.sql`
provide local PostgreSQL smoke coverage after applying `schema.sql`. The
bootstrap file only emulates the small `auth.uid()`/role/publication surface
needed outside Supabase.
