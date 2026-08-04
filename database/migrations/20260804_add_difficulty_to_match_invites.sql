-- ============================================================
-- Migration: Fix match_invites missing columns + Realtime
-- Date: 2026-08-04
-- Issues fixed:
--   1. difficulty column missing → INSERT error in create_match_invite
--   2. mode column missing       → INSERT error in create_match_invite
--   3. match_invites NOT in supabase_realtime publication
--      → inviter never receives declined/accepted notification via Realtime
-- ============================================================

-- Add difficulty column (was in schema.sql but never migrated)
ALTER TABLE public.match_invites
  ADD COLUMN IF NOT EXISTS difficulty TEXT
    CHECK (difficulty IN ('easy', 'medium', 'hard', 'super_hard'))
    DEFAULT 'medium';

-- Add mode column (was in schema.sql but never migrated)
ALTER TABLE public.match_invites
  ADD COLUMN IF NOT EXISTS mode TEXT
    DEFAULT 'versus_ranked';

-- Backfill existing rows with default values
UPDATE public.match_invites
SET
  difficulty = COALESCE(difficulty, 'medium'),
  mode       = COALESCE(mode, 'versus_ranked')
WHERE difficulty IS NULL OR mode IS NULL;

-- Enable Realtime on match_invites so inviter receives
-- declined/accepted/expired events via postgres_changes subscription.
-- (schema.sql has this but no migration ever added it for existing DBs)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'match_invites'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.match_invites;
    END IF;
  END IF;
END $$;

