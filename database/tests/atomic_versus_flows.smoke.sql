\set ON_ERROR_STOP on

INSERT INTO auth.users (id) VALUES
  ('00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000002');

INSERT INTO public.profiles (id, name, handle, overall_elo) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Alpha', 'alpha', 1000),
  ('00000000-0000-0000-0000-000000000002', 'Beta', 'beta', 1000);

INSERT INTO public.friendships (requester_id, addressee_id, status) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'accepted');

INSERT INTO public.category_elo (user_id, category, elo) VALUES
  ('00000000-0000-0000-0000-000000000001', 'number', 1100),
  ('00000000-0000-0000-0000-000000000002', 'number', 1120);

SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
SELECT public.enter_matchmaking_queue('number', 'medium', 9999, 300, '10000000-0000-0000-0000-000000000001');

SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
SELECT public.enter_matchmaking_queue('number', 'medium', 1, 300, '20000000-0000-0000-0000-000000000002');

SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
SELECT * FROM public.poll_matchmaking('10000000-0000-0000-0000-000000000001');

DO $$
DECLARE
  v_room public.versus_rooms%ROWTYPE;
BEGIN
  SELECT * INTO v_room FROM public.versus_rooms WHERE entry_source = 'quick_match';
  IF NOT FOUND OR v_room.host_id <> '00000000-0000-0000-0000-000000000001'::UUID
      OR v_room.guest_id <> '00000000-0000-0000-0000-000000000002'::UUID THEN
    RAISE EXCEPTION 'Quick Match did not create exactly one expected room';
  END IF;
  IF v_room.difficulty <> 'medium' OR v_room.host_ready IS NOT TRUE OR v_room.guest_ready IS NOT TRUE THEN
    RAISE EXCEPTION 'Quick Match room settings are incorrect';
  END IF;
  IF (SELECT user_elo FROM public.matchmaking_queue WHERE user_id = v_room.host_id) <> 1100 THEN
    RAISE EXCEPTION 'Queue trusted client Elo instead of category Elo';
  END IF;
END;
$$;

SELECT public.start_versus_room((SELECT code FROM public.versus_rooms WHERE entry_source = 'quick_match'));
UPDATE public.versus_rooms
SET start_at = NOW(), started_at = NOW()
WHERE entry_source = 'quick_match';

SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
SELECT * FROM public.submit_versus_round((SELECT code FROM public.versus_rooms WHERE entry_source = 'quick_match'), 1, true);
SELECT * FROM public.submit_versus_round((SELECT code FROM public.versus_rooms WHERE entry_source = 'quick_match'), 2, true);
SELECT * FROM public.submit_versus_round((SELECT code FROM public.versus_rooms WHERE entry_source = 'quick_match'), 3, true);
SELECT * FROM public.submit_versus_round((SELECT code FROM public.versus_rooms WHERE entry_source = 'quick_match'), 4, false);
SELECT * FROM public.submit_versus_round((SELECT code FROM public.versus_rooms WHERE entry_source = 'quick_match'), 5, true);

SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
SELECT * FROM public.submit_versus_round((SELECT code FROM public.versus_rooms WHERE entry_source = 'quick_match'), 1, true);
SELECT * FROM public.submit_versus_round((SELECT code FROM public.versus_rooms WHERE entry_source = 'quick_match'), 2, false);
SELECT * FROM public.submit_versus_round((SELECT code FROM public.versus_rooms WHERE entry_source = 'quick_match'), 3, true);
SELECT * FROM public.submit_versus_round((SELECT code FROM public.versus_rooms WHERE entry_source = 'quick_match'), 4, false);
SELECT * FROM public.submit_versus_round((SELECT code FROM public.versus_rooms WHERE entry_source = 'quick_match'), 5, true);

DO $$
DECLARE
  v_room public.versus_rooms%ROWTYPE;
BEGIN
  SELECT * INTO v_room FROM public.versus_rooms WHERE entry_source = 'quick_match';
  IF v_room.status <> 'finished' OR v_room.host_score <> 4 OR v_room.guest_score <> 3 THEN
    RAISE EXCEPTION 'Round result finalization failed';
  END IF;
  IF v_room.winner_id <> v_room.host_id OR v_room.results_applied_at IS NULL THEN
    RAISE EXCEPTION 'Winner/result idempotency state failed';
  END IF;
  IF (SELECT COUNT(*) FROM public.match_history WHERE match_id = v_room.match_id) <> 2 THEN
    RAISE EXCEPTION 'Expected exactly two match history rows';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM public.match_history
    WHERE match_id = v_room.match_id
      AND user_id = v_room.host_id
      AND player_round_score = 4
      AND opponent_round_score = 3
  ) OR NOT EXISTS (
    SELECT 1
    FROM public.match_history
    WHERE match_id = v_room.match_id
      AND user_id = v_room.guest_id
      AND player_round_score = 3
      AND opponent_round_score = 4
  ) THEN
    RAISE EXCEPTION 'Versus history did not preserve both head-to-head scores';
  END IF;
END;
$$;

SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
SELECT * FROM public.create_match_invite(
  '00000000-0000-0000-0000-000000000002', 'number', 'hard', 'versus_ranked'
);

SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
SELECT * FROM public.respond_to_match_invite(
  (SELECT id FROM public.match_invites WHERE status = 'pending'), true
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.match_invites i
    JOIN public.versus_rooms r ON r.code = i.room_code
    WHERE i.status = 'accepted'
      AND r.entry_source = 'challenge'
      AND r.guest_id = '00000000-0000-0000-0000-000000000002'::UUID
  ) THEN
    RAISE EXCEPTION 'Atomic invite accept/join failed';
  END IF;
END;
$$;

SELECT 'atomic-versus-smoke-ok' AS result;
