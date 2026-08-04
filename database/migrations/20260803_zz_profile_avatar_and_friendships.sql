-- Profile editing, Supabase Storage avatars, and participant-scoped friendships.

-- Replace the permissive prototype friendship policy. Only either participant
-- can read or mutate a relationship, and only the requester can create it.
DROP POLICY IF EXISTS "Public friendships read" ON public.friendships;
DROP POLICY IF EXISTS "Users manage friendships" ON public.friendships;
DROP POLICY IF EXISTS "Participants read friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users send friend requests" ON public.friendships;
DROP POLICY IF EXISTS "Participants update friendships" ON public.friendships;
DROP POLICY IF EXISTS "Participants delete friendships" ON public.friendships;

CREATE POLICY "Participants read friendships" ON public.friendships
  FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users send friend requests" ON public.friendships
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id AND requester_id <> addressee_id);

CREATE POLICY "Participants update friendships" ON public.friendships
  FOR UPDATE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id)
  WITH CHECK (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Participants delete friendships" ON public.friendships
  FOR DELETE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Supabase projects provide storage.buckets/storage.objects. The guard keeps
-- the repository's plain-Postgres smoke bootstrap usable outside Supabase.
DO $$
BEGIN
  IF to_regclass('storage.buckets') IS NULL OR to_regclass('storage.objects') IS NULL THEN
    RAISE NOTICE 'Supabase Storage schema not present; skipping avatars bucket setup';
    RETURN;
  END IF;

  EXECUTE $storage_bucket$
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'avatars',
      'avatars',
      true,
      2097152,
      ARRAY['image/jpeg', 'image/png', 'image/webp']
    )
    ON CONFLICT (id) DO UPDATE SET
      public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types
  $storage_bucket$;

  EXECUTE 'DROP POLICY IF EXISTS "Public avatar reads" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Users upload own avatar" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Users update own avatar" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Users delete own avatar" ON storage.objects';

  EXECUTE $policy$
    CREATE POLICY "Public avatar reads" ON storage.objects
      FOR SELECT USING (bucket_id = 'avatars')
  $policy$;
  EXECUTE $policy$
    CREATE POLICY "Users upload own avatar" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
      )
  $policy$;
  EXECUTE $policy$
    CREATE POLICY "Users update own avatar" ON storage.objects
      FOR UPDATE TO authenticated
      USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
      )
      WITH CHECK (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
      )
  $policy$;
  EXECUTE $policy$
    CREATE POLICY "Users delete own avatar" ON storage.objects
      FOR DELETE TO authenticated
      USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
      )
  $policy$;
END;
$$;
