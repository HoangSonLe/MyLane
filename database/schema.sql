-- ====================================================================
-- GameBoard (Memory Arena) — Streamlined Production PostgreSQL Schema
-- Clean core schema covering all essential business features
-- without unnecessary audit or replay log overhead.
-- ====================================================================

-- Enable Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------------------
-- 1. Profiles Table (Tài khoản & Hồ sơ người chơi)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  overall_elo INTEGER DEFAULT 1000,
  is_guest BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  joined_label TEXT DEFAULT 'Joined recently',
  status TEXT CHECK (status IN ('online', 'offline', 'in_game', 'in-game', 'in_room')) DEFAULT 'offline',
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 2. User Settings Table (Cài đặt ứng dụng cá nhân)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  notifications_enabled BOOLEAN DEFAULT true,
  sounds_enabled BOOLEAN DEFAULT true,
  haptics_enabled BOOLEAN DEFAULT true,
  preferred_language TEXT DEFAULT 'vi',
  theme TEXT DEFAULT 'light',
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'super_hard')) DEFAULT 'medium',
  has_seen_onboarding BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 3. Category ELO Ratings Table (Điểm Elo theo 5 thể loại game)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.category_elo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('number', 'alphabet', 'grid', 'sequence', 'color')),
  elo INTEGER DEFAULT 1000,
  last_delta INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category)
);

-- --------------------------------------------------------------------
-- 4. Category Bests Table (Kỷ lục cá nhân theo từng loại game)
-- --------------------------------------------------------------------
-- solo_ranked_*/versus_ranked_* are tracked separately (docs/gameplay/README.md
-- "best score ... per category + mode"); ranked_score/ranked_level are kept
-- as GENERATED (GREATEST of both modes) so every existing reader (Leaderboard
-- sort, Lobby/Profile "Ranked Score") keeps working unchanged.
CREATE TABLE IF NOT EXISTS public.category_bests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('number', 'alphabet', 'grid', 'sequence', 'color')),
  practice_score INTEGER DEFAULT 0,
  practice_level INTEGER DEFAULT 1,
  solo_ranked_score INTEGER DEFAULT 0 NOT NULL,
  solo_ranked_level INTEGER DEFAULT 1 NOT NULL,
  versus_ranked_score INTEGER DEFAULT 0 NOT NULL,
  versus_ranked_level INTEGER DEFAULT 1 NOT NULL,
  ranked_score INTEGER GENERATED ALWAYS AS (GREATEST(solo_ranked_score, versus_ranked_score)) STORED,
  ranked_level INTEGER GENERATED ALWAYS AS (GREATEST(solo_ranked_level, versus_ranked_level)) STORED,
  highest_level INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category)
);

-- Reconcile a deployment created before the solo/versus ranked-best split:
-- CREATE TABLE IF NOT EXISTS above does not touch an already-existing
-- category_bests table. The old single ranked_score/ranked_level pair
-- already blends both modes' history with no way to retroactively separate
-- it, so it is migrated into solo_ranked_score/level (the more common
-- source) rather than discarded; versus_ranked_* starts fresh from its
-- default and fills in from the next Versus Ranked win.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'category_bests' AND column_name = 'ranked_score'
      AND is_generated = 'NEVER'
  ) THEN
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

-- --------------------------------------------------------------------
-- 5. Match History Table (Lịch sử đấu chi tiết từng ván)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.match_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID,
  idempotency_key UUID,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('number', 'alphabet', 'grid', 'sequence', 'color')),
  category_label TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('solo_practice', 'solo_ranked', 'solo_endless', 'versus_ranked', 'versus_unranked')),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'super_hard')) DEFAULT 'medium',
  outcome TEXT CHECK (outcome IN ('win', 'loss', 'draw')) NOT NULL,
  score INTEGER NOT NULL,
  level_reached INTEGER NOT NULL,
  rounds_cleared INTEGER DEFAULT 0,
  bonus_seconds INTEGER DEFAULT 0,
  perfect BOOLEAN DEFAULT false,
  completed_all_levels BOOLEAN DEFAULT false,
  opponent_name TEXT,
  player_round_score INTEGER CHECK (player_round_score IS NULL OR player_round_score >= 0),
  opponent_round_score INTEGER CHECK (opponent_round_score IS NULL OR opponent_round_score >= 0),
  elo_change INTEGER DEFAULT 0,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS match_history_user_match_idx
  ON public.match_history (user_id, match_id)
  WHERE match_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS match_history_user_idempotency_idx
  ON public.match_history (user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- Reconcile a deployment created before Endless Mode results started
-- persisting to match_history: CREATE TABLE IF NOT EXISTS above does not
-- touch an already-existing table's CHECK constraint, so re-add it here to
-- widen the allowed set on every apply of this file.
ALTER TABLE public.match_history
  DROP CONSTRAINT IF EXISTS match_history_mode_check;
ALTER TABLE public.match_history
  ADD CONSTRAINT match_history_mode_check
    CHECK (mode IN ('solo_practice', 'solo_ranked', 'solo_endless', 'versus_ranked', 'versus_unranked'));

-- --------------------------------------------------------------------
-- 6. Friendships Table (Danh sách & Trạng thái bạn bè)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  addressee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id),
  CONSTRAINT no_self_friend CHECK (requester_id <> addressee_id)
);

-- --------------------------------------------------------------------
-- 7. Versus Rooms Table (Quản lý phòng đấu 1v1)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.versus_rooms (
  code TEXT PRIMARY KEY,
  match_id UUID DEFAULT gen_random_uuid() NOT NULL,
  room_name TEXT NOT NULL,
  host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  guest_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('number', 'alphabet', 'grid', 'sequence', 'color')),
  mode TEXT NOT NULL CHECK (mode IN ('versus_ranked', 'versus_unranked')),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'super_hard')) DEFAULT 'medium',
  privacy TEXT CHECK (privacy IN ('public', 'private')) DEFAULT 'public',
  max_players INTEGER DEFAULT 2,
  player_count INTEGER DEFAULT 1,
  status TEXT CHECK (status IN ('waiting', 'in_progress', 'finished')) DEFAULT 'waiting',
  seed TEXT,
  entry_source TEXT CHECK (entry_source IN ('quick_match', 'quick_join', 'custom', 'challenge')) DEFAULT 'custom' NOT NULL,
  host_ready BOOLEAN DEFAULT false NOT NULL,
  guest_ready BOOLEAN DEFAULT false NOT NULL,
  start_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  host_score INTEGER DEFAULT 0 NOT NULL,
  guest_score INTEGER DEFAULT 0 NOT NULL,
  host_rounds_completed INTEGER DEFAULT 0 NOT NULL,
  guest_rounds_completed INTEGER DEFAULT 0 NOT NULL,
  winner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  finish_reason TEXT CHECK (finish_reason IS NULL OR finish_reason IN ('completed', 'forfeit', 'disconnect')),
  host_elo_delta INTEGER DEFAULT 0 NOT NULL,
  guest_elo_delta INTEGER DEFAULT 0 NOT NULL,
  results_applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '10 minutes')
);

CREATE UNIQUE INDEX IF NOT EXISTS versus_rooms_match_id_idx
  ON public.versus_rooms (match_id);

CREATE INDEX IF NOT EXISTS versus_rooms_waiting_expiry_idx
  ON public.versus_rooms (expires_at)
  WHERE status = 'waiting';

-- --------------------------------------------------------------------
-- 8. Match Invites Table (Lời mời thách đấu thời gian thực)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.match_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT REFERENCES public.versus_rooms(code) ON DELETE SET NULL,
  inviter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  invitee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'super_hard')) DEFAULT 'medium',
  mode TEXT DEFAULT 'versus_ranked',
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'expired')) DEFAULT 'pending',
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 seconds') NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS match_invites_pending_idx
  ON public.match_invites (invitee_id, status, expires_at);

-- --------------------------------------------------------------------
-- 9. Invite Mutes Table (Tạm thời bỏ qua lời mời từ người chơi khác)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invite_mutes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  muted_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  muted_handle TEXT NOT NULL,
  until_timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, muted_handle),
  UNIQUE(user_id, muted_user_id),
  CHECK (muted_user_id <> user_id)
);

CREATE INDEX IF NOT EXISTS invite_mutes_active_idx
  ON public.invite_mutes (user_id, until_timestamp);

ALTER TABLE public.invite_mutes REPLICA IDENTITY FULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.invite_mutes TO authenticated;

-- --------------------------------------------------------------------
-- 10. Matchmaking Queue Table (Hàng chờ tìm trận Elo đồng thời)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.matchmaking_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('number', 'alphabet', 'grid', 'sequence', 'color')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'super_hard')) DEFAULT 'medium',
  user_elo INTEGER DEFAULT 1000,
  min_elo INTEGER DEFAULT 900,
  max_elo INTEGER DEFAULT 1100,
  status TEXT CHECK (status IN ('searching', 'matched', 'cancelled')) DEFAULT 'searching',
  room_code TEXT,
  matched_with_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  attempt_id UUID DEFAULT gen_random_uuid() NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '60 seconds') NOT NULL,
  matched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS matchmaking_queue_search_idx
  ON public.matchmaking_queue (category, difficulty, status, expires_at, created_at);

CREATE UNIQUE INDEX IF NOT EXISTS matchmaking_queue_attempt_idx
  ON public.matchmaking_queue (user_id, attempt_id);

-- --------------------------------------------------------------------
-- 11. Versus Round Results (server-owned, idempotent round submissions)
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- Enable Row Level Security (RLS) across all 11 core tables (access_logs is
-- enabled separately below, next to its own policies)
-- --------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_elo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_bests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.versus_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_mutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.versus_round_results ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- Base RLS policies. All cross-user Versus mutations are performed by the
-- SECURITY DEFINER functions defined further below in this file.
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users manage own profile" ON public.profiles;
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Public settings read" ON public.user_settings;
DROP POLICY IF EXISTS "Users update own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users manage own settings" ON public.user_settings;
CREATE POLICY "Public settings read" ON public.user_settings FOR SELECT USING (true);
CREATE POLICY "Users manage own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public category_elo read" ON public.category_elo;
DROP POLICY IF EXISTS "Users manage category_elo" ON public.category_elo;
DROP POLICY IF EXISTS "Authenticated users read category Elo" ON public.category_elo;
CREATE POLICY "Authenticated users read category Elo" ON public.category_elo FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Public category_bests read" ON public.category_bests;
DROP POLICY IF EXISTS "Users manage category_bests" ON public.category_bests;
CREATE POLICY "Public category_bests read" ON public.category_bests FOR SELECT USING (true);
CREATE POLICY "Users manage category_bests" ON public.category_bests FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public match_history read" ON public.match_history;
DROP POLICY IF EXISTS "Users insert match_history" ON public.match_history;
DROP POLICY IF EXISTS "Users manage match_history" ON public.match_history;
CREATE POLICY "Public match_history read" ON public.match_history FOR SELECT USING (true);
CREATE POLICY "Users manage match_history" ON public.match_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

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

DROP POLICY IF EXISTS "Public versus_rooms read" ON public.versus_rooms;
DROP POLICY IF EXISTS "Users manage versus_rooms" ON public.versus_rooms;
DROP POLICY IF EXISTS "Authenticated users read versus rooms" ON public.versus_rooms;
CREATE POLICY "Authenticated users read versus rooms" ON public.versus_rooms FOR SELECT USING (
  auth.uid() IS NOT NULL
  AND (status <> 'waiting' OR expires_at > NOW())
);

DROP POLICY IF EXISTS "Public match_invites read" ON public.match_invites;
DROP POLICY IF EXISTS "Users manage match_invites" ON public.match_invites;
DROP POLICY IF EXISTS "Invite participants read" ON public.match_invites;
CREATE POLICY "Invite participants read" ON public.match_invites FOR SELECT USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

DROP POLICY IF EXISTS "Public invite_mutes read" ON public.invite_mutes;
DROP POLICY IF EXISTS "Users manage invite_mutes" ON public.invite_mutes;
DROP POLICY IF EXISTS "Users read own invite mutes" ON public.invite_mutes;
DROP POLICY IF EXISTS "Users insert own invite mutes" ON public.invite_mutes;
DROP POLICY IF EXISTS "Users update own invite mutes" ON public.invite_mutes;
DROP POLICY IF EXISTS "Users delete own invite mutes" ON public.invite_mutes;
CREATE POLICY "Users read own invite mutes" ON public.invite_mutes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own invite mutes" ON public.invite_mutes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND muted_user_id <> auth.uid());
CREATE POLICY "Users update own invite mutes" ON public.invite_mutes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id AND muted_user_id <> auth.uid());
CREATE POLICY "Users delete own invite mutes" ON public.invite_mutes FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public matchmaking_queue read" ON public.matchmaking_queue;
DROP POLICY IF EXISTS "Users manage matchmaking_queue" ON public.matchmaking_queue;
DROP POLICY IF EXISTS "Users read own matchmaking row" ON public.matchmaking_queue;
CREATE POLICY "Users read own matchmaking row" ON public.matchmaking_queue FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Participants read versus round results" ON public.versus_round_results;
CREATE POLICY "Participants read versus round results" ON public.versus_round_results FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.versus_rooms r
    WHERE r.match_id = versus_round_results.match_id
      AND (r.host_id = auth.uid() OR r.guest_id = auth.uid())
  )
);

-- --------------------------------------------------------------------
-- Functions & RPCs — atomic matchmaking, versus-room lifecycle, and
-- challenge-invite flows. Frontend writes to versus_rooms, match_invites,
-- matchmaking_queue, and cross-user category_elo/match_history all go
-- through these SECURITY DEFINER functions; the restrictive policies above
-- only allow direct reads.
-- --------------------------------------------------------------------
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
-- Atomic room membership and ready/start lifecycle. join/leave additionally
-- enforce the server-clock waiting-room TTL: an expired room is deleted
-- atomically instead of being joined/left.
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

  IF v_room.status = 'waiting'
      AND (v_room.expires_at IS NULL OR v_room.expires_at <= clock_timestamp()) THEN
    DELETE FROM public.versus_rooms WHERE code = v_room.code;
    RETURN NULL;
  END IF;

  IF v_room.host_id = v_user_id OR v_room.guest_id = v_user_id THEN
    RETURN v_room.code;
  END IF;

  IF v_room.status <> 'waiting'
      OR v_room.guest_id IS NOT NULL
      OR v_room.player_count >= v_room.max_players THEN
    RAISE EXCEPTION 'ROOM_FULL' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.versus_rooms
  SET
    guest_id = v_user_id,
    guest_ready = CASE WHEN entry_source = 'quick_match' THEN true ELSE false END,
    player_count = 2,
    updated_at = clock_timestamp()
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

  IF v_room.status = 'waiting'
      AND (v_room.expires_at IS NULL OR v_room.expires_at <= clock_timestamp()) THEN
    DELETE FROM public.versus_rooms WHERE code = v_room.code;
    RETURN QUERY SELECT v_room.code, false, true;
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
      updated_at = clock_timestamp()
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
      updated_at = clock_timestamp()
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

CREATE OR REPLACE FUNCTION public.heartbeat_versus_room(p_code TEXT)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_expires_at TIMESTAMPTZ;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501';
  END IF;

  UPDATE public.versus_rooms
  SET updated_at = clock_timestamp()
  WHERE code = UPPER(TRIM(p_code))
    AND status = 'waiting'
    AND expires_at > clock_timestamp()
    AND (host_id = v_user_id OR guest_id = v_user_id)
  RETURNING expires_at INTO v_expires_at;

  IF NOT FOUND THEN
    IF EXISTS (
      SELECT 1
      FROM public.versus_rooms
      WHERE code = UPPER(TRIM(p_code))
        AND status = 'waiting'
        AND (expires_at IS NULL OR expires_at <= clock_timestamp())
        AND (host_id = v_user_id OR guest_id = v_user_id)
    ) THEN
      RAISE EXCEPTION 'ROOM_EXPIRED' USING ERRCODE = 'P0001';
    END IF;

    RAISE EXCEPTION 'ROOM_NOT_HEARTBEATABLE' USING ERRCODE = 'P0001';
  END IF;

  RETURN v_expires_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.expire_stale_waiting_rooms()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM public.versus_rooms
  WHERE status = 'waiting'
    AND (expires_at IS NULL OR expires_at <= clock_timestamp());

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Keeps versus_rooms.expires_at authoritative: entering `waiting` (re)starts
-- the ten-minute TTL, leaving it clears the deadline, and a mutation that
-- arrives after the deadline has already passed is rejected outright so a
-- stale room can never be silently kept alive by an unrelated write.
CREATE OR REPLACE FUNCTION public.maintain_waiting_room_expiry()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
      AND OLD.status = 'waiting'
      AND (OLD.expires_at IS NULL OR OLD.expires_at <= clock_timestamp()) THEN
    RAISE EXCEPTION 'ROOM_EXPIRED' USING ERRCODE = 'P0001';
  END IF;

  IF NEW.status = 'waiting' THEN
    NEW.expires_at := clock_timestamp() + INTERVAL '10 minutes';
  ELSE
    NEW.expires_at := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS maintain_waiting_room_expiry_trigger ON public.versus_rooms;
CREATE TRIGGER maintain_waiting_room_expiry_trigger
BEFORE INSERT OR UPDATE OF updated_at, status
ON public.versus_rooms
FOR EACH ROW
EXECUTE FUNCTION public.maintain_waiting_room_expiry();

-- Keeps match_history's two authoritative Versus round scores (shown in
-- Profile match history) in sync with the room they were generated from,
-- separate from the calculated game `score` column.
CREATE OR REPLACE FUNCTION public.sync_match_history_versus_scores()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room public.versus_rooms%ROWTYPE;
BEGIN
  IF NEW.match_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT * INTO v_room
  FROM public.versus_rooms
  WHERE match_id = NEW.match_id;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  IF NEW.user_id = v_room.host_id THEN
    NEW.player_round_score := v_room.host_score;
    NEW.opponent_round_score := v_room.guest_score;
  ELSIF NEW.user_id = v_room.guest_id THEN
    NEW.player_round_score := v_room.guest_score;
    NEW.opponent_round_score := v_room.host_score;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_match_history_versus_scores_trigger ON public.match_history;
CREATE TRIGGER sync_match_history_versus_scores_trigger
BEFORE INSERT OR UPDATE OF match_id, user_id, player_round_score, opponent_round_score
ON public.match_history
FOR EACH ROW
EXECUTE FUNCTION public.sync_match_history_versus_scores();

-- ---------------------------------------------------------------------
-- Atomic challenge invite lifecycle
-- ---------------------------------------------------------------------
-- p_rematch_room_code lets Result screen's "Rematch" re-challenge the
-- opponent from the match that just finished even when not friends: the
-- friend-check is bypassed only if that room code points to a `finished`
-- versus_rooms row whose host/guest pair is exactly (caller, invitee) — a
-- pairing the caller cannot forge since those columns are server-owned.
CREATE OR REPLACE FUNCTION public.create_match_invite(
  p_invitee_id UUID,
  p_category TEXT,
  p_difficulty TEXT,
  p_mode TEXT,
  p_rematch_room_code TEXT DEFAULT NULL
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
  v_is_friend BOOLEAN;
  v_is_valid_rematch BOOLEAN := false;
BEGIN
  IF v_inviter_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501';
  END IF;

  IF p_invitee_id = v_inviter_id THEN
    RAISE EXCEPTION 'CANNOT_INVITE_SELF' USING ERRCODE = '22023';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.friendships f
    WHERE f.status = 'accepted'
      AND (
        (f.requester_id = v_inviter_id AND f.addressee_id = p_invitee_id)
        OR (f.requester_id = p_invitee_id AND f.addressee_id = v_inviter_id)
      )
  ) INTO v_is_friend;

  IF NOT v_is_friend AND p_rematch_room_code IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM public.versus_rooms r
      WHERE r.code = UPPER(TRIM(p_rematch_room_code))
        AND r.status = 'finished'
        AND (
          (r.host_id = v_inviter_id AND r.guest_id = p_invitee_id)
          OR (r.guest_id = v_inviter_id AND r.host_id = p_invitee_id)
        )
    ) INTO v_is_valid_rematch;
  END IF;

  IF NOT v_is_friend AND NOT v_is_valid_rematch THEN
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
-- Function privileges. Cross-user mutations go through these functions,
-- which validate auth.uid() and execute as the function owner; direct table
-- access for those cases is blocked by the restrictive policies above.
-- ---------------------------------------------------------------------
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
REVOKE ALL ON FUNCTION public.heartbeat_versus_room(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.expire_stale_waiting_rooms() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.maintain_waiting_room_expiry() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_match_history_versus_scores() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_match_invite(UUID, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
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
GRANT EXECUTE ON FUNCTION public.heartbeat_versus_room(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.expire_stale_waiting_rooms() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_match_invite(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_to_match_invite(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_match_invite(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.expire_stale_match_invites() TO authenticated;

-- --------------------------------------------------------------------
-- Enable Supabase Realtime Publication for Match Invites, Invite Mutes, Versus Rooms & Queue
-- --------------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_invites;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invite_mutes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.versus_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matchmaking_queue;

-- --------------------------------------------------------------------
-- 12. Access Logs Table (Nhật ký truy cập người dùng, bao gồm geolocation)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_email TEXT,
  is_guest BOOLEAN DEFAULT false,
  user_agent TEXT,
  device_type TEXT DEFAULT 'Desktop',
  device_id TEXT,
  page_path TEXT DEFAULT '/',
  ip_address TEXT,
  location_name TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON public.access_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON public.access_logs(user_id);
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert access log entries" ON public.access_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can view access logs" ON public.access_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "Only admins can clear access logs" ON public.access_logs FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);

-- --------------------------------------------------------------------
-- Supabase Storage — public `avatars` bucket with owner-folder write
-- policies. Guarded so the plain-Postgres smoke bootstrap (which does not
-- provide storage.buckets/storage.objects) can still apply this file.
-- --------------------------------------------------------------------
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

