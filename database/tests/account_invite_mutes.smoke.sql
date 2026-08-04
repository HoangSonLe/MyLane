\set ON_ERROR_STOP on

INSERT INTO auth.users (id) VALUES
  ('00000000-0000-0000-0000-000000000011'),
  ('00000000-0000-0000-0000-000000000012');

INSERT INTO public.profiles (id, name, handle, overall_elo) VALUES
  ('00000000-0000-0000-0000-000000000011', 'Mute Owner', 'mute-owner', 1000),
  ('00000000-0000-0000-0000-000000000012', 'Muted Player', 'muted-player', 1000);

SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000011';
SET ROLE authenticated;

INSERT INTO public.invite_mutes (
  user_id,
  muted_user_id,
  muted_handle,
  until_timestamp
) VALUES (
  '00000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000012',
  'muted-player',
  NOW() + INTERVAL '15 minutes'
)
ON CONFLICT (user_id, muted_user_id)
DO UPDATE SET until_timestamp = EXCLUDED.until_timestamp;

DO $$
BEGIN
  IF (
    SELECT COUNT(*)
    FROM public.invite_mutes
    WHERE user_id = auth.uid()
      AND until_timestamp > NOW()
  ) <> 1 THEN
    RAISE EXCEPTION 'Account invite mute was not persisted';
  END IF;
END;
$$;

RESET ROLE;
SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000012';
SET ROLE authenticated;

DO $$
BEGIN
  IF (SELECT COUNT(*) FROM public.invite_mutes) <> 0 THEN
    RAISE EXCEPTION 'Invite mute RLS leaked another account row';
  END IF;
END;
$$;

RESET ROLE;
SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000011';
SET ROLE authenticated;

UPDATE public.invite_mutes
SET until_timestamp = NOW()
WHERE user_id = auth.uid()
  AND muted_user_id = '00000000-0000-0000-0000-000000000012';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.invite_mutes
    WHERE user_id = auth.uid()
      AND until_timestamp > NOW()
  ) THEN
    RAISE EXCEPTION 'Account invite mute did not expire';
  END IF;
END;
$$;

RESET ROLE;
SELECT 'account-invite-mutes-smoke-ok' AS result;
