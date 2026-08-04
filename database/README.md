# Database deployment

For a new Supabase project:

1. Apply `schema.sql`.
2. Apply every file in `migrations/` in filename order.

`20260803_zz_profile_avatar_and_friendships.sql` creates the public `avatars` Storage bucket when the Supabase `storage` schema is available, installs owner-folder object policies, and tightens friendship row-level security to participants/requesters.

`20260803_zzz_default_vi_light.sql` changes only the defaults for new settings rows to Vietnamese and light theme; existing preferences are preserved.

`20260803_zzzz_match_history_scores.sql` stores the two authoritative Versus round scores separately from calculated game points and backfills existing Versus history from `versus_rooms`.

`20260803_zzzz_account_invite_mutes.sql` upgrades invite mutes to immutable profile IDs, restricts rows to their owning account with RLS, and publishes the table for Supabase Realtime account sync.

`20260804_waiting_room_ttl.sql` adds the server-clock 10-minute TTL for rooms that remain in `waiting`, participant heartbeat and cleanup RPCs, an expiry-aware read policy, and atomic expired-room handling for join/leave. Apply it together with the frontend release that calls `heartbeat_versus_room` and `expire_stale_waiting_rooms`.

For an existing project, apply only migrations that have not already been recorded by the deployment environment. The frontend changes dated 2026-08-03 require `migrations/20260803_atomic_versus_flows.sql` and `migrations/20260803_zzzz_account_invite_mutes.sql`; the waiting-room expiry release additionally requires `migrations/20260804_waiting_room_ttl.sql`.

That migration adds the atomic Quick Match, room ready/start/leave, invite expiry/accept, round result, forfeit, and category-Elo lifecycle functions. It also replaces permissive write policies on Versus tables with read-only participant policies; frontend writes must go through the granted RPC functions.

Do not run the base schema alone in production and assume the RPC contract is installed. `schema.sql` defines current table shapes, while migrations contain the versioned functions and policy transition required by deployed databases.

`tests/bootstrap_supabase.sql`, `tests/atomic_versus_flows.smoke.sql`, `tests/waiting_room_ttl.smoke.sql`, and `tests/account_invite_mutes.smoke.sql` provide local PostgreSQL smoke coverage for the schema, atomic two-player lifecycle, waiting-room expiry/heartbeat/cleanup, and account-isolated invite mutes. The bootstrap file only emulates the small `auth.uid()`/role/publication surface needed outside Supabase.
