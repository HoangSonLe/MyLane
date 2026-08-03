-- Atomic matchmaking and versus-room lifecycle primitives.
-- This migration is intentionally additive so it can be applied to an
-- existing Supabase project without recreating the base tables.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------
-- Matchmaking attempts
-- ---------------------------------------------------------------------
ALTER TABLE public.matchmaking_queue
  ADD COLUMN IF NOT EXISTS attempt_id UUID,
  ADD COLUMN IF NOT EXISTS difficulty TEXT,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS matched_at TIMESTAMPTZ;

UPDATE public.matchmaking_queue
SET
  attempt_id = COALESCE(attempt_id, gen_random_uuid()),
  difficulty = COALESCE(difficulty, 'medium'),
  expires_at = COALESCE(expires_at, updated_at + INTERVAL '60 seconds');

ALTER TABLE public.matchmaking_queue
  ALTER COLUMN attempt_id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN attempt_id SET NOT NULL,
  ALTER COLUMN difficulty SET DEFAULT 'medium',
  ALTER COLUMN difficulty SET NOT NULL,
  ALTER COLUMN expires_at SET DEFAULT (NOW() + INTERVAL '60 seconds'),
  ALTER COLUMN expires_at SET NOT NULL;

ALTER TABLE public.matchmaking_queue
  DROP CONSTRAINT IF EXISTS matchmaking_queue_difficulty_check;

ALTER TABLE public.matchmaking_queue
  ADD CONSTRAINT matchmaking_queue_difficulty_check
  CHECK (difficulty IN ('easy', 'medium', 'hard', 'super_hard'));

CREATE INDEX IF NOT EXISTS matchmaking_queue_search_idx
  ON public.matchmaking_queue (category, difficulty, status, expires_at, created_at);

CREATE UNIQUE INDEX IF NOT EXISTS matchmaking_queue_attempt_idx
  ON public.matchmaking_queue (user_id, attempt_id);

-- ---------------------------------------------------------------------
-- Versus room lifecycle
-- ---------------------------------------------------------------------
ALTER TABLE public.versus_rooms
  ADD COLUMN IF NOT EXISTS match_id UUID,
  ADD COLUMN IF NOT EXISTS entry_source TEXT,
  ADD COLUMN IF NOT EXISTS host_ready BOOLEAN,
  ADD COLUMN IF NOT EXISTS guest_ready BOOLEAN,
  ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS finished_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS host_score INTEGER,
  ADD COLUMN IF NOT EXISTS guest_score INTEGER,
  ADD COLUMN IF NOT EXISTS host_rounds_completed INTEGER,
  ADD COLUMN IF NOT EXISTS guest_rounds_completed INTEGER,
  ADD COLUMN IF NOT EXISTS winner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS finish_reason TEXT,
  ADD COLUMN IF NOT EXISTS host_elo_delta INTEGER,
  ADD COLUMN IF NOT EXISTS guest_elo_delta INTEGER,
  ADD COLUMN IF NOT EXISTS results_applied_at TIMESTAMPTZ;

UPDATE public.versus_rooms
SET
  match_id = COALESCE(match_id, gen_random_uuid()),
  entry_source = COALESCE(entry_source, 'custom'),
  host_ready = COALESCE(host_ready, true),
  guest_ready = COALESCE(guest_ready, false),
  host_score = COALESCE(host_score, 0),
  guest_score = COALESCE(guest_score, 0),
  host_rounds_completed = COALESCE(host_rounds_completed, 0),
  guest_rounds_completed = COALESCE(guest_rounds_completed, 0),
  host_elo_delta = COALESCE(host_elo_delta, 0),
  guest_elo_delta = COALESCE(guest_elo_delta, 0);

ALTER TABLE public.versus_rooms
  ALTER COLUMN match_id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN match_id SET NOT NULL,
  ALTER COLUMN entry_source SET DEFAULT 'custom',
  ALTER COLUMN entry_source SET NOT NULL,
  ALTER COLUMN host_ready SET DEFAULT false,
  ALTER COLUMN host_ready SET NOT NULL,
  ALTER COLUMN guest_ready SET DEFAULT false,
  ALTER COLUMN guest_ready SET NOT NULL,
  ALTER COLUMN host_score SET DEFAULT 0,
  ALTER COLUMN host_score SET NOT NULL,
  ALTER COLUMN guest_score SET DEFAULT 0,
  ALTER COLUMN guest_score SET NOT NULL,
  ALTER COLUMN host_rounds_completed SET DEFAULT 0,
  ALTER COLUMN host_rounds_completed SET NOT NULL,
  ALTER COLUMN guest_rounds_completed SET DEFAULT 0,
  ALTER COLUMN guest_rounds_completed SET NOT NULL,
  ALTER COLUMN host_elo_delta SET DEFAULT 0,
  ALTER COLUMN host_elo_delta SET NOT NULL,
  ALTER COLUMN guest_elo_delta SET DEFAULT 0,
  ALTER COLUMN guest_elo_delta SET NOT NULL;

ALTER TABLE public.versus_rooms
  DROP CONSTRAINT IF EXISTS versus_rooms_entry_source_check;

ALTER TABLE public.versus_rooms
  ADD CONSTRAINT versus_rooms_entry_source_check
  CHECK (entry_source IN ('quick_match', 'quick_join', 'custom', 'challenge'));

CREATE UNIQUE INDEX IF NOT EXISTS versus_rooms_match_id_idx
  ON public.versus_rooms (match_id);

ALTER TABLE public.versus_rooms
  DROP CONSTRAINT IF EXISTS versus_rooms_finish_reason_check;

ALTER TABLE public.versus_rooms
  ADD CONSTRAINT versus_rooms_finish_reason_check
  CHECK (finish_reason IS NULL OR finish_reason IN ('completed', 'forfeit', 'disconnect'));

CREATE TABLE IF NOT EXISTS public.versus_round_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL,
  room_code TEXT REFERENCES public.versus_rooms(code) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  round_number INTEGER NOT NULL CHECK (round_number BETWEEN 1 AND 5),
  correct BOOLEAN NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (match_id, user_id, round_number)
);

CREATE INDEX IF NOT EXISTS versus_round_results_room_idx
  ON public.versus_round_results (room_code, round_number);

ALTER TABLE public.versus_round_results ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- Invite expiry and result idempotency
-- ---------------------------------------------------------------------
ALTER TABLE public.match_invites
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

UPDATE public.match_invites
SET expires_at = COALESCE(expires_at, created_at + INTERVAL '30 seconds');

ALTER TABLE public.match_invites
  ALTER COLUMN expires_at SET DEFAULT (NOW() + INTERVAL '30 seconds'),
  ALTER COLUMN expires_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS match_invites_pending_idx
  ON public.match_invites (invitee_id, status, expires_at);

ALTER TABLE public.match_history
  ADD COLUMN IF NOT EXISTS match_id UUID,
  ADD COLUMN IF NOT EXISTS idempotency_key UUID;

CREATE UNIQUE INDEX IF NOT EXISTS match_history_user_match_idx
  ON public.match_history (user_id, match_id)
  WHERE match_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS match_history_user_idempotency_idx
  ON public.match_history (user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- ---------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_versus_room_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
BEGIN
  FOR i IN 1..25 LOOP
    v_code := LPAD(FLOOR(RANDOM() * 1000000)::INTEGER::TEXT, 6, '0');
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.versus_rooms WHERE code = v_code
    );
  END LOOP;

  IF EXISTS (SELECT 1 FROM public.versus_rooms WHERE code = v_code) THEN
    RAISE EXCEPTION 'ROOM_CODE_EXHAUSTED' USING ERRCODE = 'P0001';
  END IF;

  RETURN v_code;
END;
$$;

-- Entering the queue is separate from polling so two clients do not keep
-- locking their own rows before attempting a deterministic pair claim.
CREATE OR REPLACE FUNCTION public.enter_matchmaking_queue(
  p_category TEXT,
  p_difficulty TEXT,
  p_user_elo INTEGER,
  p_elo_delta INTEGER,
  p_attempt_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_queue_id UUID;
  v_min_elo INTEGER;
  v_max_elo INTEGER;
  v_user_elo INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501';
  END IF;

  IF p_category NOT IN ('number', 'alphabet', 'grid', 'sequence', 'color') THEN
    RAISE EXCEPTION 'INVALID_CATEGORY' USING ERRCODE = '22023';
  END IF;

  IF p_difficulty NOT IN ('easy', 'medium', 'hard', 'super_hard') THEN
    RAISE EXCEPTION 'INVALID_DIFFICULTY' USING ERRCODE = '22023';
  END IF;

  SELECT elo INTO v_user_elo
  FROM public.category_elo
  WHERE user_id = v_user_id AND category = p_category;
  v_user_elo := COALESCE(v_user_elo, 1000);
  v_min_elo := GREATEST(100, v_user_elo - 100);
  v_max_elo := v_user_elo + 100;

  INSERT INTO public.matchmaking_queue (
    user_id,
    category,
    difficulty,
    user_elo,
    min_elo,
    max_elo,
    status,
    room_code,
    matched_with_id,
    attempt_id,
    created_at,
    updated_at,
    expires_at,
    matched_at
  )
  VALUES (
    v_user_id,
    p_category,
    p_difficulty,
    v_user_elo,
    v_min_elo,
    v_max_elo,
    'searching',
    NULL,
    NULL,
    p_attempt_id,
    NOW(),
    NOW(),
    NOW() + INTERVAL '60 seconds',
    NULL
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    category = EXCLUDED.category,
    difficulty = EXCLUDED.difficulty,
    user_elo = EXCLUDED.user_elo,
    min_elo = EXCLUDED.min_elo,
    max_elo = EXCLUDED.max_elo,
    status = 'searching',
    room_code = NULL,
    matched_with_id = NULL,
    attempt_id = EXCLUDED.attempt_id,
    created_at = NOW(),
    updated_at = NOW(),
    expires_at = NOW() + INTERVAL '60 seconds',
    matched_at = NULL
  RETURNING id INTO v_queue_id;

  RETURN v_queue_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_matchmaking_window(
  p_attempt_id UUID,
  p_user_elo INTEGER,
  p_elo_delta INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_category TEXT;
  v_user_elo INTEGER;
  v_delta INTEGER;
BEGIN
  SELECT category INTO v_category
  FROM public.matchmaking_queue
  WHERE user_id = auth.uid()
    AND attempt_id = p_attempt_id
    AND status = 'searching';

  IF v_category IS NULL THEN
    RETURN;
  END IF;

  SELECT elo INTO v_user_elo
  FROM public.category_elo
  WHERE user_id = auth.uid() AND category = v_category;
  v_user_elo := COALESCE(v_user_elo, 1000);

  SELECT LEAST(
    300,
    100 + FLOOR(EXTRACT(EPOCH FROM (NOW() - created_at)) / 10)::INTEGER * 50
  ) INTO v_delta
  FROM public.matchmaking_queue
  WHERE user_id = auth.uid() AND attempt_id = p_attempt_id;

  UPDATE public.matchmaking_queue
  SET
    user_elo = v_user_elo,
    min_elo = GREATEST(100, v_user_elo - v_delta),
    max_elo = v_user_elo + v_delta,
    updated_at = NOW()
  WHERE user_id = auth.uid()
    AND attempt_id = p_attempt_id
    AND status = 'searching';
END;
$$;

CREATE OR REPLACE FUNCTION public.create_versus_room(
  p_category TEXT,
  p_mode TEXT,
  p_difficulty TEXT,
  p_room_name TEXT,
  p_is_private BOOLEAN DEFAULT false,
  p_entry_source TEXT DEFAULT 'custom'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_room_code TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501';
  END IF;

  IF p_category NOT IN ('number', 'alphabet', 'grid', 'sequence', 'color') THEN
    RAISE EXCEPTION 'INVALID_CATEGORY' USING ERRCODE = '22023';
  END IF;

  IF p_mode NOT IN ('versus_ranked', 'versus_unranked') THEN
    RAISE EXCEPTION 'INVALID_MODE' USING ERRCODE = '22023';
  END IF;

  IF p_difficulty NOT IN ('easy', 'medium', 'hard', 'super_hard') THEN
    RAISE EXCEPTION 'INVALID_DIFFICULTY' USING ERRCODE = '22023';
  END IF;

  IF p_entry_source NOT IN ('quick_join', 'custom', 'challenge') THEN
    RAISE EXCEPTION 'INVALID_ENTRY_SOURCE' USING ERRCODE = '22023';
  END IF;

  v_room_code := public.generate_versus_room_code();

  INSERT INTO public.versus_rooms (
    code,
    room_name,
    host_id,
    category,
    mode,
    difficulty,
    privacy,
    player_count,
    max_players,
    status,
    seed,
    entry_source,
    host_ready,
    guest_ready,
    created_at,
    updated_at
  ) VALUES (
    v_room_code,
    COALESCE(NULLIF(TRIM(p_room_name), ''), v_room_code),
    v_user_id,
    p_category,
    p_mode,
    p_difficulty,
    CASE WHEN p_is_private THEN 'private' ELSE 'public' END,
    1,
    2,
    'waiting',
    UPPER(SUBSTRING(MD5(gen_random_uuid()::TEXT), 1, 16)),
    p_entry_source,
    false,
    false,
    NOW(),
    NOW()
  );

  RETURN v_room_code;
END;
$$;

CREATE OR REPLACE FUNCTION public.poll_matchmaking(
  p_attempt_id UUID
)
RETURNS TABLE (
  match_status TEXT,
  queue_id UUID,
  room_code TEXT,
  match_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_me public.matchmaking_queue%ROWTYPE;
  v_opponent public.matchmaking_queue%ROWTYPE;
  v_room_code TEXT;
  v_match_id UUID;
  v_seed TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501';
  END IF;

  -- Lock the current row first. Pair claims only move from a lower user UUID
  -- to a higher UUID, so lock acquisition is acyclic and cannot double-match.
  SELECT * INTO v_me
  FROM public.matchmaking_queue
  WHERE user_id = v_user_id
    AND attempt_id = p_attempt_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 'missing'::TEXT, NULL::UUID, NULL::TEXT, NULL::UUID;
    RETURN;
  END IF;

  IF v_me.status = 'matched' AND v_me.room_code IS NOT NULL THEN
    SELECT r.match_id INTO v_match_id
    FROM public.versus_rooms r
    WHERE r.code = v_me.room_code;

    IF v_match_id IS NULL THEN
      UPDATE public.matchmaking_queue
      SET status = 'searching', room_code = NULL, matched_with_id = NULL, matched_at = NULL
      WHERE id = v_me.id;
    ELSE
      RETURN QUERY SELECT 'matched'::TEXT, v_me.id, v_me.room_code, v_match_id;
      RETURN;
    END IF;
  END IF;

  IF v_me.expires_at <= NOW() THEN
    RETURN QUERY SELECT 'expired'::TEXT, v_me.id, NULL::TEXT, NULL::UUID;
    RETURN;
  END IF;

  SELECT q.* INTO v_opponent
  FROM public.matchmaking_queue q
  WHERE q.user_id::TEXT > v_user_id::TEXT
    AND q.status = 'searching'
    AND q.expires_at > NOW()
    AND q.category = v_me.category
    AND q.difficulty = v_me.difficulty
    AND q.user_elo BETWEEN v_me.min_elo AND v_me.max_elo
    AND v_me.user_elo BETWEEN q.min_elo AND q.max_elo
  ORDER BY
    CASE WHEN EXISTS (
      SELECT 1
      FROM public.friendships f
      WHERE f.status = 'accepted'
        AND (
          (f.requester_id = v_user_id AND f.addressee_id = q.user_id)
          OR (f.requester_id = q.user_id AND f.addressee_id = v_user_id)
        )
    ) THEN 0 ELSE 1 END,
    q.created_at ASC
  FOR UPDATE OF q SKIP LOCKED
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 'searching'::TEXT, v_me.id, NULL::TEXT, NULL::UUID;
    RETURN;
  END IF;

  v_room_code := public.generate_versus_room_code();
  v_match_id := gen_random_uuid();
  v_seed := UPPER(SUBSTRING(MD5(gen_random_uuid()::TEXT), 1, 16));

  INSERT INTO public.versus_rooms (
    code,
    match_id,
    room_name,
    host_id,
    guest_id,
    category,
    mode,
    difficulty,
    privacy,
    player_count,
    max_players,
    status,
    seed,
    entry_source,
    host_ready,
    guest_ready,
    created_at,
    updated_at
  ) VALUES (
    v_room_code,
    v_match_id,
    'Ranked 1v1 Elo Match',
    v_user_id,
    v_opponent.user_id,
    v_me.category,
    'versus_ranked',
    v_me.difficulty,
    'private',
    2,
    2,
    'waiting',
    v_seed,
    'quick_match',
    true,
    true,
    NOW(),
    NOW()
  );

  UPDATE public.matchmaking_queue
  SET
    status = 'matched',
    room_code = v_room_code,
    matched_with_id = v_opponent.user_id,
    matched_at = NOW(),
    updated_at = NOW()
  WHERE id = v_me.id
    AND status = 'searching';

  UPDATE public.matchmaking_queue
  SET
    status = 'matched',
    room_code = v_room_code,
    matched_with_id = v_user_id,
    matched_at = NOW(),
    updated_at = NOW()
  WHERE id = v_opponent.id
    AND status = 'searching';

  RETURN QUERY SELECT 'matched'::TEXT, v_me.id, v_room_code, v_match_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.leave_matchmaking_queue(
  p_attempt_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.matchmaking_queue
  WHERE user_id = auth.uid()
    AND (p_attempt_id IS NULL OR attempt_id = p_attempt_id);
END;
$$;

-- ---------------------------------------------------------------------
-- Atomic room membership and ready/start lifecycle
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.join_versus_room(p_code TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_room public.versus_rooms%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_room
  FROM public.versus_rooms
  WHERE code = UPPER(TRIM(p_code))
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ROOM_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  IF v_room.host_id = v_user_id OR v_room.guest_id = v_user_id THEN
    RETURN v_room.code;
  END IF;

  IF v_room.status <> 'waiting' OR v_room.guest_id IS NOT NULL OR v_room.player_count >= v_room.max_players THEN
    RAISE EXCEPTION 'ROOM_FULL' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.versus_rooms
  SET
    guest_id = v_user_id,
    guest_ready = CASE WHEN entry_source = 'quick_match' THEN true ELSE false END,
    player_count = 2,
    updated_at = NOW()
  WHERE code = v_room.code;

  RETURN v_room.code;
END;
$$;

CREATE OR REPLACE FUNCTION public.leave_versus_room(p_code TEXT)
RETURNS TABLE (room_code TEXT, host_transferred BOOLEAN, room_deleted BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_room public.versus_rooms%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_room
  FROM public.versus_rooms
  WHERE code = UPPER(TRIM(p_code))
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::TEXT, false, true;
    RETURN;
  END IF;

  IF v_room.status = 'in_progress' THEN
    RAISE EXCEPTION 'MATCH_IN_PROGRESS' USING ERRCODE = 'P0001';
  END IF;

  IF v_room.host_id = v_user_id AND v_room.guest_id IS NOT NULL THEN
    UPDATE public.versus_rooms
    SET
      host_id = v_room.guest_id,
      guest_id = NULL,
      host_ready = v_room.guest_ready,
      guest_ready = false,
      player_count = 1,
      updated_at = NOW()
    WHERE code = v_room.code;

    RETURN QUERY SELECT v_room.code, true, false;
    RETURN;
  END IF;

  IF v_room.host_id = v_user_id THEN
    DELETE FROM public.versus_rooms WHERE code = v_room.code;
    RETURN QUERY SELECT v_room.code, false, true;
    RETURN;
  END IF;

  IF v_room.guest_id = v_user_id THEN
    UPDATE public.versus_rooms
    SET
      guest_id = NULL,
      guest_ready = false,
      player_count = 1,
      updated_at = NOW()
    WHERE code = v_room.code;

    RETURN QUERY SELECT v_room.code, false, false;
    RETURN;
  END IF;

  RAISE EXCEPTION 'NOT_ROOM_PARTICIPANT' USING ERRCODE = '42501';
END;
$$;

CREATE OR REPLACE FUNCTION public.toggle_versus_room_privacy(
  p_code TEXT,
  p_is_private BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.versus_rooms
  SET
    privacy = CASE WHEN p_is_private THEN 'private' ELSE 'public' END,
    updated_at = NOW()
  WHERE code = UPPER(TRIM(p_code))
    AND host_id = auth.uid()
    AND status = 'waiting';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ROOM_PRIVACY_NOT_CHANGEABLE' USING ERRCODE = 'P0001';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_versus_room_ready(
  p_code TEXT,
  p_ready BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  UPDATE public.versus_rooms
  SET
    host_ready = CASE WHEN host_id = v_user_id THEN p_ready ELSE host_ready END,
    guest_ready = CASE WHEN guest_id = v_user_id THEN p_ready ELSE guest_ready END,
    updated_at = NOW()
  WHERE code = UPPER(TRIM(p_code))
    AND status = 'waiting'
    AND (host_id = v_user_id OR guest_id = v_user_id);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ROOM_NOT_READYABLE' USING ERRCODE = 'P0001';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.start_versus_room(p_code TEXT)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_start_at TIMESTAMPTZ := NOW() + INTERVAL '3 seconds';
BEGIN
  UPDATE public.versus_rooms
  SET
    status = 'in_progress',
    start_at = v_start_at,
    started_at = v_start_at,
    updated_at = NOW()
  WHERE code = UPPER(TRIM(p_code))
    AND status = 'waiting'
    AND player_count = 2
    AND host_ready = true
    AND guest_ready = true
    AND (
      host_id = v_user_id
      OR (entry_source = 'quick_match' AND guest_id = v_user_id)
    );

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ROOM_NOT_STARTABLE' USING ERRCODE = 'P0001';
  END IF;

  RETURN v_start_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_versus_elo_delta(
  p_rating INTEGER,
  p_opponent_rating INTEGER,
  p_score NUMERIC
)
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT ROUND(
    (CASE
      WHEN p_rating < 1200 THEN 40
      WHEN p_rating < 1600 THEN 32
      WHEN p_rating < 2000 THEN 24
      ELSE 16
    END) *
    (p_score - (1.0 / (1.0 + POWER(10.0, (p_opponent_rating - p_rating) / 400.0))))
  )::INTEGER;
$$;

CREATE OR REPLACE FUNCTION public.finalize_versus_room(
  p_code TEXT,
  p_finish_reason TEXT,
  p_forfeiter_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room public.versus_rooms%ROWTYPE;
  v_winner_id UUID;
  v_host_rating INTEGER := 1000;
  v_guest_rating INTEGER := 1000;
  v_host_delta INTEGER := 0;
  v_guest_delta INTEGER := 0;
  v_host_outcome TEXT;
  v_guest_outcome TEXT;
  v_host_result NUMERIC;
  v_guest_result NUMERIC;
  v_category_label TEXT;
BEGIN
  SELECT * INTO v_room
  FROM public.versus_rooms
  WHERE code = UPPER(TRIM(p_code))
  FOR UPDATE;

  IF NOT FOUND OR v_room.guest_id IS NULL THEN
    RAISE EXCEPTION 'ROOM_NOT_FINALIZABLE' USING ERRCODE = 'P0001';
  END IF;

  IF v_room.results_applied_at IS NOT NULL THEN
    RETURN;
  END IF;

  IF v_room.status <> 'in_progress' THEN
    RAISE EXCEPTION 'MATCH_NOT_ACTIVE' USING ERRCODE = 'P0001';
  END IF;

  IF p_finish_reason = 'completed' THEN
    IF v_room.host_rounds_completed < 5 OR v_room.guest_rounds_completed < 5 THEN
      RAISE EXCEPTION 'MATCH_NOT_COMPLETE' USING ERRCODE = 'P0001';
    END IF;
    IF v_room.host_score > v_room.guest_score THEN
      v_winner_id := v_room.host_id;
    ELSIF v_room.guest_score > v_room.host_score THEN
      v_winner_id := v_room.guest_id;
    ELSE
      v_winner_id := NULL;
    END IF;
  ELSIF p_finish_reason IN ('forfeit', 'disconnect') THEN
    IF p_forfeiter_id = v_room.host_id THEN
      v_winner_id := v_room.guest_id;
    ELSIF p_forfeiter_id = v_room.guest_id THEN
      v_winner_id := v_room.host_id;
    ELSE
      RAISE EXCEPTION 'INVALID_FORFEITER' USING ERRCODE = '42501';
    END IF;
  ELSE
    RAISE EXCEPTION 'INVALID_FINISH_REASON' USING ERRCODE = '22023';
  END IF;

  IF v_winner_id IS NULL THEN
    v_host_outcome := 'draw';
    v_guest_outcome := 'draw';
    v_host_result := 0.5;
    v_guest_result := 0.5;
  ELSIF v_winner_id = v_room.host_id THEN
    v_host_outcome := 'win';
    v_guest_outcome := 'loss';
    v_host_result := 1;
    v_guest_result := 0;
  ELSE
    v_host_outcome := 'loss';
    v_guest_outcome := 'win';
    v_host_result := 0;
    v_guest_result := 1;
  END IF;

  IF v_room.mode = 'versus_ranked' THEN
    INSERT INTO public.category_elo (user_id, category, elo, last_delta, updated_at)
    VALUES
      (v_room.host_id, v_room.category, 1000, 0, NOW()),
      (v_room.guest_id, v_room.category, 1000, 0, NOW())
    ON CONFLICT (user_id, category) DO NOTHING;

    SELECT elo INTO v_host_rating FROM public.category_elo
    WHERE user_id = v_room.host_id AND category = v_room.category
    FOR UPDATE;
    SELECT elo INTO v_guest_rating FROM public.category_elo
    WHERE user_id = v_room.guest_id AND category = v_room.category
    FOR UPDATE;

    v_host_delta := public.calculate_versus_elo_delta(v_host_rating, v_guest_rating, v_host_result);
    v_guest_delta := public.calculate_versus_elo_delta(v_guest_rating, v_host_rating, v_guest_result);
    v_host_delta := GREATEST(100, v_host_rating + v_host_delta) - v_host_rating;
    v_guest_delta := GREATEST(100, v_guest_rating + v_guest_delta) - v_guest_rating;

    UPDATE public.category_elo
    SET elo = GREATEST(100, v_host_rating + v_host_delta), last_delta = v_host_delta, updated_at = NOW()
    WHERE user_id = v_room.host_id AND category = v_room.category;

    UPDATE public.category_elo
    SET elo = GREATEST(100, v_guest_rating + v_guest_delta), last_delta = v_guest_delta, updated_at = NOW()
    WHERE user_id = v_room.guest_id AND category = v_room.category;
  END IF;

  UPDATE public.versus_rooms
  SET
    status = 'finished',
    winner_id = v_winner_id,
    finish_reason = p_finish_reason,
    host_elo_delta = v_host_delta,
    guest_elo_delta = v_guest_delta,
    finished_at = NOW(),
    results_applied_at = NOW(),
    updated_at = NOW()
  WHERE code = v_room.code;

  IF v_room.mode = 'versus_ranked' THEN
    v_category_label := CASE v_room.category
      WHEN 'number' THEN 'Number'
      WHEN 'alphabet' THEN 'Alphabet'
      WHEN 'grid' THEN 'Grid'
      WHEN 'sequence' THEN 'Sequence'
      WHEN 'color' THEN 'Color'
      ELSE v_room.category
    END;

    INSERT INTO public.match_history (
      user_id, match_id, idempotency_key, category, category_label, mode,
      difficulty, outcome, score, level_reached, rounds_cleared,
      opponent_name, elo_change, played_at
    )
    SELECT
      v_room.host_id, v_room.match_id, v_room.match_id, v_room.category,
      v_category_label, v_room.mode, v_room.difficulty, v_host_outcome,
      v_room.host_score, GREATEST(1, v_room.host_rounds_completed),
      v_room.host_score, guest_profile.name, v_host_delta, NOW()
    FROM public.profiles guest_profile
    WHERE guest_profile.id = v_room.guest_id
      AND NOT EXISTS (
        SELECT 1 FROM public.match_history h
        WHERE h.user_id = v_room.host_id AND h.match_id = v_room.match_id
      );

    INSERT INTO public.match_history (
      user_id, match_id, idempotency_key, category, category_label, mode,
      difficulty, outcome, score, level_reached, rounds_cleared,
      opponent_name, elo_change, played_at
    )
    SELECT
      v_room.guest_id, v_room.match_id, v_room.match_id, v_room.category,
      v_category_label, v_room.mode, v_room.difficulty, v_guest_outcome,
      v_room.guest_score, GREATEST(1, v_room.guest_rounds_completed),
      v_room.guest_score, host_profile.name, v_guest_delta, NOW()
    FROM public.profiles host_profile
    WHERE host_profile.id = v_room.host_id
      AND NOT EXISTS (
        SELECT 1 FROM public.match_history h
        WHERE h.user_id = v_room.guest_id AND h.match_id = v_room.match_id
      );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_versus_round(
  p_code TEXT,
  p_round_number INTEGER,
  p_correct BOOLEAN
)
RETURNS TABLE (
  match_status TEXT,
  host_score INTEGER,
  guest_score INTEGER,
  host_rounds_completed INTEGER,
  guest_rounds_completed INTEGER,
  winner_id UUID,
  current_user_outcome TEXT,
  elo_change INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_room public.versus_rooms%ROWTYPE;
  v_is_host BOOLEAN;
  v_already_submitted BOOLEAN;
  v_outcome TEXT;
  v_elo_change INTEGER;
BEGIN
  SELECT * INTO v_room
  FROM public.versus_rooms
  WHERE code = UPPER(TRIM(p_code))
  FOR UPDATE;

  IF NOT FOUND OR v_user_id IS NULL OR (v_room.host_id <> v_user_id AND v_room.guest_id <> v_user_id) THEN
    RAISE EXCEPTION 'NOT_ROOM_PARTICIPANT' USING ERRCODE = '42501';
  END IF;

  IF v_room.status = 'finished' THEN
    v_already_submitted := true;
  ELSIF v_room.status <> 'in_progress' OR v_room.started_at > NOW() THEN
    RAISE EXCEPTION 'MATCH_NOT_ACTIVE' USING ERRCODE = 'P0001';
  ELSE
    v_is_host := v_room.host_id = v_user_id;
    SELECT EXISTS (
      SELECT 1 FROM public.versus_round_results rr
      WHERE rr.match_id = v_room.match_id
        AND rr.user_id = v_user_id
        AND rr.round_number = p_round_number
    ) INTO v_already_submitted;

    IF NOT v_already_submitted THEN
      IF p_round_number <> (CASE WHEN v_is_host THEN v_room.host_rounds_completed + 1 ELSE v_room.guest_rounds_completed + 1 END) THEN
        RAISE EXCEPTION 'ROUND_OUT_OF_SEQUENCE' USING ERRCODE = '22023';
      END IF;

      INSERT INTO public.versus_round_results (match_id, room_code, user_id, round_number, correct)
      VALUES (v_room.match_id, v_room.code, v_user_id, p_round_number, p_correct);

      UPDATE public.versus_rooms AS r
      SET
        host_score = r.host_score + CASE WHEN v_is_host AND p_correct THEN 1 ELSE 0 END,
        guest_score = r.guest_score + CASE WHEN NOT v_is_host AND p_correct THEN 1 ELSE 0 END,
        host_rounds_completed = r.host_rounds_completed + CASE WHEN v_is_host THEN 1 ELSE 0 END,
        guest_rounds_completed = r.guest_rounds_completed + CASE WHEN NOT v_is_host THEN 1 ELSE 0 END,
        updated_at = NOW()
      WHERE code = v_room.code;

      SELECT * INTO v_room FROM public.versus_rooms WHERE code = v_room.code;
      IF v_room.host_rounds_completed >= 5 AND v_room.guest_rounds_completed >= 5 THEN
        PERFORM public.finalize_versus_room(v_room.code, 'completed', NULL);
      END IF;
    END IF;
  END IF;

  SELECT * INTO v_room FROM public.versus_rooms WHERE code = v_room.code;
  IF v_room.status = 'finished' THEN
    v_outcome := CASE
      WHEN v_room.winner_id IS NULL THEN 'draw'
      WHEN v_room.winner_id = v_user_id THEN 'win'
      ELSE 'loss'
    END;
    v_elo_change := CASE WHEN v_room.host_id = v_user_id THEN v_room.host_elo_delta ELSE v_room.guest_elo_delta END;
  END IF;

  RETURN QUERY SELECT
    v_room.status, v_room.host_score, v_room.guest_score,
    v_room.host_rounds_completed, v_room.guest_rounds_completed,
    v_room.winner_id, v_outcome, COALESCE(v_elo_change, 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.forfeit_versus_match(p_code TEXT)
RETURNS TABLE (current_user_outcome TEXT, elo_change INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_room public.versus_rooms%ROWTYPE;
BEGIN
  SELECT * INTO v_room
  FROM public.versus_rooms
  WHERE code = UPPER(TRIM(p_code))
  FOR UPDATE;

  IF NOT FOUND OR (v_room.host_id <> v_user_id AND v_room.guest_id <> v_user_id) THEN
    RAISE EXCEPTION 'NOT_ROOM_PARTICIPANT' USING ERRCODE = '42501';
  END IF;

  IF v_room.status <> 'finished' THEN
    PERFORM public.finalize_versus_room(v_room.code, 'forfeit', v_user_id);
  END IF;

  SELECT * INTO v_room FROM public.versus_rooms WHERE code = v_room.code;
  RETURN QUERY SELECT
    CASE WHEN v_room.winner_id = v_user_id THEN 'win'::TEXT ELSE 'loss'::TEXT END,
    CASE WHEN v_room.host_id = v_user_id THEN v_room.host_elo_delta ELSE v_room.guest_elo_delta END;
END;
$$;

-- ---------------------------------------------------------------------
-- Atomic challenge invite lifecycle
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_match_invite(
  p_invitee_id UUID,
  p_category TEXT,
  p_difficulty TEXT,
  p_mode TEXT
)
RETURNS TABLE (invite_id UUID, room_code TEXT, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inviter_id UUID := auth.uid();
  v_room_code TEXT;
  v_invite_id UUID;
  v_expires_at TIMESTAMPTZ := NOW() + INTERVAL '30 seconds';
BEGIN
  IF v_inviter_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501';
  END IF;

  IF p_invitee_id = v_inviter_id THEN
    RAISE EXCEPTION 'CANNOT_INVITE_SELF' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.friendships f
    WHERE f.status = 'accepted'
      AND (
        (f.requester_id = v_inviter_id AND f.addressee_id = p_invitee_id)
        OR (f.requester_id = p_invitee_id AND f.addressee_id = v_inviter_id)
      )
  ) THEN
    RAISE EXCEPTION 'INVITEE_NOT_FRIEND' USING ERRCODE = '42501';
  END IF;

  v_room_code := public.create_versus_room(
    p_category,
    p_mode,
    p_difficulty,
    'Trận Thách Đấu 1v1',
    true,
    'challenge'
  );

  INSERT INTO public.match_invites (
    room_code,
    inviter_id,
    invitee_id,
    category,
    difficulty,
    mode,
    status,
    expires_at,
    created_at
  ) VALUES (
    v_room_code,
    v_inviter_id,
    p_invitee_id,
    p_category,
    p_difficulty,
    p_mode,
    'pending',
    v_expires_at,
    NOW()
  )
  RETURNING id INTO v_invite_id;

  RETURN QUERY SELECT v_invite_id, v_room_code, v_expires_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.respond_to_match_invite(
  p_invite_id UUID,
  p_accept BOOLEAN
)
RETURNS TABLE (room_code TEXT, invite_status TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_invite public.match_invites%ROWTYPE;
BEGIN
  SELECT * INTO v_invite
  FROM public.match_invites
  WHERE id = p_invite_id
  FOR UPDATE;

  IF NOT FOUND OR v_invite.invitee_id <> v_user_id THEN
    RAISE EXCEPTION 'INVITE_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  IF v_invite.status <> 'pending' OR v_invite.expires_at <= NOW() THEN
    UPDATE public.match_invites
    SET status = 'expired'
    WHERE id = v_invite.id AND status = 'pending';
    DELETE FROM public.versus_rooms
    WHERE code = v_invite.room_code AND status = 'waiting' AND guest_id IS NULL;
    RETURN QUERY SELECT NULL::TEXT, 'expired'::TEXT;
    RETURN;
  END IF;

  IF NOT p_accept THEN
    UPDATE public.match_invites SET status = 'declined' WHERE id = v_invite.id;
    DELETE FROM public.versus_rooms
    WHERE code = v_invite.room_code AND status = 'waiting' AND guest_id IS NULL;
    RETURN QUERY SELECT NULL::TEXT, 'declined'::TEXT;
    RETURN;
  END IF;

  PERFORM public.join_versus_room(v_invite.room_code);
  UPDATE public.match_invites SET status = 'accepted' WHERE id = v_invite.id;
  RETURN QUERY SELECT v_invite.room_code, 'accepted'::TEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_match_invite(p_invite_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room_code TEXT;
BEGIN
  UPDATE public.match_invites
  SET status = 'expired'
  WHERE id = p_invite_id
    AND inviter_id = auth.uid()
    AND status = 'pending'
  RETURNING room_code INTO v_room_code;

  IF v_room_code IS NOT NULL THEN
    DELETE FROM public.versus_rooms
    WHERE code = v_room_code AND status = 'waiting' AND guest_id IS NULL;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.expire_stale_match_invites()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  WITH expired AS (
    UPDATE public.match_invites
    SET status = 'expired'
    WHERE status = 'pending' AND expires_at <= NOW()
    RETURNING room_code
  ), deleted_rooms AS (
    DELETE FROM public.versus_rooms r
    USING expired e
    WHERE r.code = e.room_code AND r.status = 'waiting' AND r.guest_id IS NULL
  )
  SELECT COUNT(*) INTO v_count FROM expired;

  RETURN v_count;
END;
$$;

-- ---------------------------------------------------------------------
-- Restrictive policies. Cross-user mutations go through the functions
-- above, which validate auth.uid() and execute as the function owner.
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Public category_elo read" ON public.category_elo;
DROP POLICY IF EXISTS "Users manage category_elo" ON public.category_elo;
DROP POLICY IF EXISTS "Authenticated users read category Elo" ON public.category_elo;
CREATE POLICY "Authenticated users read category Elo"
ON public.category_elo FOR SELECT
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Public versus_rooms read" ON public.versus_rooms;
DROP POLICY IF EXISTS "Users manage versus_rooms" ON public.versus_rooms;
DROP POLICY IF EXISTS "Authenticated users read versus rooms" ON public.versus_rooms;
DROP POLICY IF EXISTS "Hosts create versus rooms" ON public.versus_rooms;
DROP POLICY IF EXISTS "Participants update versus rooms" ON public.versus_rooms;
DROP POLICY IF EXISTS "Hosts delete versus rooms" ON public.versus_rooms;

CREATE POLICY "Authenticated users read versus rooms"
ON public.versus_rooms FOR SELECT
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Public matchmaking_queue read" ON public.matchmaking_queue;
DROP POLICY IF EXISTS "Users manage matchmaking_queue" ON public.matchmaking_queue;
DROP POLICY IF EXISTS "Users read own matchmaking row" ON public.matchmaking_queue;
DROP POLICY IF EXISTS "Users manage own matchmaking row" ON public.matchmaking_queue;

CREATE POLICY "Users read own matchmaking row"
ON public.matchmaking_queue FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Participants read versus round results" ON public.versus_round_results;
CREATE POLICY "Participants read versus round results"
ON public.versus_round_results FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.versus_rooms r
    WHERE r.match_id = versus_round_results.match_id
      AND (r.host_id = auth.uid() OR r.guest_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Public match_invites read" ON public.match_invites;
DROP POLICY IF EXISTS "Users manage match_invites" ON public.match_invites;
DROP POLICY IF EXISTS "Invite participants read" ON public.match_invites;
DROP POLICY IF EXISTS "Inviters create invites" ON public.match_invites;
DROP POLICY IF EXISTS "Invite participants update" ON public.match_invites;

CREATE POLICY "Invite participants read"
ON public.match_invites FOR SELECT
USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

REVOKE ALL ON FUNCTION public.generate_versus_room_code() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_versus_room(TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enter_matchmaking_queue(TEXT, TEXT, INTEGER, INTEGER, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_matchmaking_window(UUID, INTEGER, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.poll_matchmaking(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.leave_matchmaking_queue(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.join_versus_room(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.leave_versus_room(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.toggle_versus_room_privacy(TEXT, BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_versus_room_ready(TEXT, BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.start_versus_room(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.calculate_versus_elo_delta(INTEGER, INTEGER, NUMERIC) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.finalize_versus_room(TEXT, TEXT, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_versus_round(TEXT, INTEGER, BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.forfeit_versus_match(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_match_invite(UUID, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.respond_to_match_invite(UUID, BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cancel_match_invite(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.expire_stale_match_invites() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_versus_room(TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.enter_matchmaking_queue(TEXT, TEXT, INTEGER, INTEGER, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_matchmaking_window(UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.poll_matchmaking(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.leave_matchmaking_queue(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_versus_room(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.leave_versus_room(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_versus_room_privacy(TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_versus_room_ready(TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.start_versus_room(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_versus_round(TEXT, INTEGER, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.forfeit_versus_match(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_match_invite(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_to_match_invite(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_match_invite(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.expire_stale_match_invites() TO authenticated;
