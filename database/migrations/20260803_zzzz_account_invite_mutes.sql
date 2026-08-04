-- Account-scoped challenge invite mutes.
-- Existing handle-only rows are preserved and backfilled when the profile
-- handle still resolves. New writes use the immutable profile id.

ALTER TABLE public.invite_mutes
  ADD COLUMN IF NOT EXISTS muted_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

UPDATE public.invite_mutes AS mute
SET muted_user_id = profile.id
FROM public.profiles AS profile
WHERE mute.muted_user_id IS NULL
  AND LOWER(profile.handle) = LOWER(mute.muted_handle);

CREATE UNIQUE INDEX IF NOT EXISTS invite_mutes_user_target_idx
  ON public.invite_mutes (user_id, muted_user_id);

CREATE INDEX IF NOT EXISTS invite_mutes_active_idx
  ON public.invite_mutes (user_id, until_timestamp);

ALTER TABLE public.invite_mutes
  DROP CONSTRAINT IF EXISTS invite_mutes_target_required;
ALTER TABLE public.invite_mutes
  ADD CONSTRAINT invite_mutes_target_required
  CHECK (muted_user_id IS NOT NULL) NOT VALID;

ALTER TABLE public.invite_mutes
  DROP CONSTRAINT IF EXISTS invite_mutes_no_self_mute;
ALTER TABLE public.invite_mutes
  ADD CONSTRAINT invite_mutes_no_self_mute
  CHECK (muted_user_id IS NULL OR muted_user_id <> user_id) NOT VALID;

ALTER TABLE public.invite_mutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_mutes REPLICA IDENTITY FULL;

DROP POLICY IF EXISTS "Public invite_mutes read" ON public.invite_mutes;
DROP POLICY IF EXISTS "Users manage invite_mutes" ON public.invite_mutes;
DROP POLICY IF EXISTS "Users read own invite mutes" ON public.invite_mutes;
DROP POLICY IF EXISTS "Users insert own invite mutes" ON public.invite_mutes;
DROP POLICY IF EXISTS "Users update own invite mutes" ON public.invite_mutes;
DROP POLICY IF EXISTS "Users delete own invite mutes" ON public.invite_mutes;

CREATE POLICY "Users read own invite mutes"
ON public.invite_mutes FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own invite mutes"
ON public.invite_mutes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND muted_user_id <> auth.uid());

CREATE POLICY "Users update own invite mutes"
ON public.invite_mutes FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND muted_user_id <> auth.uid());

CREATE POLICY "Users delete own invite mutes"
ON public.invite_mutes FOR DELETE TO authenticated
USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.invite_mutes TO authenticated;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'invite_mutes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.invite_mutes;
  END IF;
END;
$$;
