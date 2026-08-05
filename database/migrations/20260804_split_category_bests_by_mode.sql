-- docs/gameplay/README.md requires Best Score tracked per category + mode,
-- but `category_bests.ranked_score`/`ranked_level` were a single pair written
-- by BOTH Solo Ranked and Versus Ranked (see gameSupabaseService.submitResult)
-- — the two modes silently overwrote each other's record. Tracked as an open
-- gap in docs/technical/known-gaps.md #12.
--
-- Split into solo_ranked_*/versus_ranked_* pairs. The existing ranked_score/
-- ranked_level already blend both modes' history with no way to retroactively
-- separate it, so it is migrated into solo_ranked_score/level (the more
-- common source) rather than discarded; versus_ranked_* starts fresh from
-- each row's default and will fill in from the next Versus Ranked win.
--
-- ranked_score/ranked_level are kept as GENERATED columns (GREATEST of both
-- modes) so every existing read site (Leaderboard sort, Lobby/Profile "Ranked
-- Score" display) keeps working unchanged without a UI redesign.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'category_bests' AND column_name = 'solo_ranked_score'
  ) THEN
    ALTER TABLE public.category_bests ADD COLUMN solo_ranked_score INTEGER DEFAULT 0 NOT NULL;
    ALTER TABLE public.category_bests ADD COLUMN solo_ranked_level INTEGER DEFAULT 1 NOT NULL;
    ALTER TABLE public.category_bests ADD COLUMN versus_ranked_score INTEGER DEFAULT 0 NOT NULL;
    ALTER TABLE public.category_bests ADD COLUMN versus_ranked_level INTEGER DEFAULT 1 NOT NULL;

    UPDATE public.category_bests
    SET solo_ranked_score = ranked_score,
        solo_ranked_level = ranked_level;

    ALTER TABLE public.category_bests DROP COLUMN ranked_score;
    ALTER TABLE public.category_bests DROP COLUMN ranked_level;

    ALTER TABLE public.category_bests
      ADD COLUMN ranked_score INTEGER GENERATED ALWAYS AS (GREATEST(solo_ranked_score, versus_ranked_score)) STORED;
    ALTER TABLE public.category_bests
      ADD COLUMN ranked_level INTEGER GENERATED ALWAYS AS (GREATEST(solo_ranked_level, versus_ranked_level)) STORED;
  END IF;
END $$;
