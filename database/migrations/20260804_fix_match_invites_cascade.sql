-- ============================================================
-- Migration: Fix match_invites cascade delete breaking Realtime
-- Date: 2026-08-04
-- Root cause:
--   match_invites.room_code has ON DELETE CASCADE → when
--   respond_to_match_invite DELETEs the versus_room after
--   setting status='declined', PostgreSQL CASCADE-deletes the
--   match_invites row BEFORE Supabase Realtime can fire the
--   UPDATE event. The inviter never sees the decline.
--
-- Fix: Change FK to ON DELETE SET NULL so the invite row
--      survives room deletion, allowing Realtime + polling
--      to deliver the declined/expired status to the inviter.
-- ============================================================

-- Step 1: Drop the existing FK constraint
ALTER TABLE public.match_invites
  DROP CONSTRAINT IF EXISTS match_invites_room_code_fkey;

-- Step 2: Allow NULL (room may be gone when invite is declined/expired)
ALTER TABLE public.match_invites
  ALTER COLUMN room_code DROP NOT NULL;

-- Step 3: Re-add FK with SET NULL instead of CASCADE
ALTER TABLE public.match_invites
  ADD CONSTRAINT match_invites_room_code_fkey
    FOREIGN KEY (room_code)
    REFERENCES public.versus_rooms(code)
    ON DELETE SET NULL;
