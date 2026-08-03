# Database deployment

For a new Supabase project:

1. Apply `schema.sql`.
2. Apply every file in `migrations/` in filename order.

For an existing project, apply only migrations that have not already been recorded by the deployment environment. The frontend changes dated 2026-08-03 require `migrations/20260803_atomic_versus_flows.sql` before release.

That migration adds the atomic Quick Match, room ready/start/leave, invite expiry/accept, round result, forfeit, and category-Elo lifecycle functions. It also replaces permissive write policies on Versus tables with read-only participant policies; frontend writes must go through the granted RPC functions.

Do not run the base schema alone in production and assume the RPC contract is installed. `schema.sql` defines current table shapes, while migrations contain the versioned functions and policy transition required by deployed databases.

`tests/bootstrap_supabase.sql` and `tests/atomic_versus_flows.smoke.sql` provide a local PostgreSQL smoke test for the schema and atomic two-player lifecycle. The bootstrap file only emulates the small `auth.uid()`/role/publication surface needed outside Supabase.
