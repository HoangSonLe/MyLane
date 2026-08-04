\set ON_ERROR_STOP on

INSERT INTO auth.users (id) VALUES
  ('00000000-0000-0000-0000-000000000011'),
  ('00000000-0000-0000-0000-000000000012');

INSERT INTO public.profiles (id, name, handle, overall_elo) VALUES
  ('00000000-0000-0000-0000-000000000011', 'TTL Alpha', 'ttl_alpha', 1000),
  ('00000000-0000-0000-0000-000000000012', 'TTL Beta', 'ttl_beta', 1000);

CREATE TEMP TABLE ttl_test_rooms (
  label TEXT PRIMARY KEY,
  code TEXT NOT NULL
);

SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000011';
INSERT INTO ttl_test_rooms (label, code)
SELECT 'two-player', public.create_versus_room(
  'number', 'versus_ranked', 'medium', 'TTL two-player room', false, 'custom'
);

DO $$
DECLARE
  v_expires_at TIMESTAMPTZ;
BEGIN
  SELECT expires_at INTO v_expires_at
  FROM public.versus_rooms
  WHERE code = (SELECT code FROM ttl_test_rooms WHERE label = 'two-player');

  IF v_expires_at < clock_timestamp() + INTERVAL '9 minutes'
      OR v_expires_at > clock_timestamp() + INTERVAL '11 minutes' THEN
    RAISE EXCEPTION 'New waiting room did not receive a ten-minute expiry';
  END IF;
END;
$$;

UPDATE public.versus_rooms
SET expires_at = clock_timestamp() + INTERVAL '1 minute'
WHERE code = (SELECT code FROM ttl_test_rooms WHERE label = 'two-player');

SELECT public.heartbeat_versus_room(
  (SELECT code FROM ttl_test_rooms WHERE label = 'two-player')
);

DO $$
BEGIN
  IF (SELECT expires_at FROM public.versus_rooms
      WHERE code = (SELECT code FROM ttl_test_rooms WHERE label = 'two-player'))
      < clock_timestamp() + INTERVAL '9 minutes' THEN
    RAISE EXCEPTION 'Participant heartbeat did not refresh waiting-room expiry';
  END IF;
END;
$$;

SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000012';
SELECT public.join_versus_room(
  (SELECT code FROM ttl_test_rooms WHERE label = 'two-player')
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.versus_rooms
    WHERE code = (SELECT code FROM ttl_test_rooms WHERE label = 'two-player')
      AND guest_id = '00000000-0000-0000-0000-000000000012'::UUID
      AND expires_at > clock_timestamp() + INTERVAL '9 minutes'
  ) THEN
    RAISE EXCEPTION 'Atomic join did not refresh waiting-room expiry';
  END IF;
END;
$$;

UPDATE public.versus_rooms
SET expires_at = clock_timestamp() - INTERVAL '1 second'
WHERE code = (SELECT code FROM ttl_test_rooms WHERE label = 'two-player');

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.versus_rooms TO authenticated;
GRANT SELECT ON ttl_test_rooms TO authenticated;
SET ROLE authenticated;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.versus_rooms
    WHERE code = (SELECT code FROM ttl_test_rooms WHERE label = 'two-player')
  ) THEN
    RAISE EXCEPTION 'RLS exposed an expired waiting room';
  END IF;
END;
$$;
RESET ROLE;

DO $$
BEGIN
  BEGIN
    PERFORM public.heartbeat_versus_room(
      (SELECT code FROM ttl_test_rooms WHERE label = 'two-player')
    );
    RAISE EXCEPTION 'Expected ROOM_EXPIRED from heartbeat';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%ROOM_EXPIRED%' THEN
      RAISE;
    END IF;
  END;
END;
$$;

SET ROLE authenticated;
SELECT public.expire_stale_waiting_rooms();
RESET ROLE;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.versus_rooms
    WHERE code = (SELECT code FROM ttl_test_rooms WHERE label = 'two-player')
  ) THEN
    RAISE EXCEPTION 'Cleanup did not delete an expired two-player waiting room';
  END IF;
END;
$$;

SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000011';
INSERT INTO ttl_test_rooms (label, code)
SELECT 'expired-join', public.create_versus_room(
  'grid', 'versus_unranked', 'hard', 'TTL expired join room', true, 'custom'
);

UPDATE public.versus_rooms
SET expires_at = clock_timestamp() - INTERVAL '1 second'
WHERE code = (SELECT code FROM ttl_test_rooms WHERE label = 'expired-join');

SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000012';
DO $$
DECLARE
  v_code TEXT := (SELECT code FROM ttl_test_rooms WHERE label = 'expired-join');
  v_joined_code TEXT;
BEGIN
  v_joined_code := public.join_versus_room(v_code);
  IF v_joined_code IS NOT NULL THEN
    RAISE EXCEPTION 'Expired room returned a successful join code';
  END IF;
  IF EXISTS (SELECT 1 FROM public.versus_rooms WHERE code = v_code) THEN
    RAISE EXCEPTION 'Expired join did not delete the stale room';
  END IF;
END;
$$;

SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000011';
INSERT INTO ttl_test_rooms (label, code)
SELECT 'started', public.create_versus_room(
  'color', 'versus_ranked', 'medium', 'TTL started room', false, 'custom'
);

SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000012';
SELECT public.join_versus_room(
  (SELECT code FROM ttl_test_rooms WHERE label = 'started')
);
SELECT public.set_versus_room_ready(
  (SELECT code FROM ttl_test_rooms WHERE label = 'started'), true
);

SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000011';
SELECT public.set_versus_room_ready(
  (SELECT code FROM ttl_test_rooms WHERE label = 'started'), true
);
SELECT public.start_versus_room(
  (SELECT code FROM ttl_test_rooms WHERE label = 'started')
);

SELECT public.expire_stale_waiting_rooms();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.versus_rooms
    WHERE code = (SELECT code FROM ttl_test_rooms WHERE label = 'started')
      AND status = 'in_progress'
      AND expires_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Started room was not exempted from waiting-room expiry';
  END IF;
END;
$$;

SELECT 'waiting-room-ttl-smoke-ok' AS result;
