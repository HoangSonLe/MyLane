-- Endless Mode (SOLO_ENDLESS) results now also persist to match_history
-- (see gameSupabaseService.submitResult's `shouldPersist`, which now covers
-- Solo Practice/Endless in addition to Ranked). The mode CHECK constraint
-- predates Endless Mode and only allowed
-- ('solo_practice', 'solo_ranked', 'versus_ranked', 'versus_unranked') —
-- every real-account Endless completion currently fails this constraint and
-- throws instead of saving. Add 'solo_endless' to the allowed set.

ALTER TABLE public.match_history
  DROP CONSTRAINT IF EXISTS match_history_mode_check;

ALTER TABLE public.match_history
  ADD CONSTRAINT match_history_mode_check
    CHECK (mode IN ('solo_practice', 'solo_ranked', 'solo_endless', 'versus_ranked', 'versus_unranked'));
