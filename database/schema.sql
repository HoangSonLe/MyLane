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
  theme TEXT DEFAULT 'dark',
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'super_hard')) DEFAULT 'medium',
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
CREATE TABLE IF NOT EXISTS public.category_bests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('number', 'alphabet', 'grid', 'sequence', 'color')),
  practice_score INTEGER DEFAULT 0,
  practice_level INTEGER DEFAULT 1,
  ranked_score INTEGER DEFAULT 0,
  ranked_level INTEGER DEFAULT 1,
  highest_level INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category)
);

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
  mode TEXT NOT NULL CHECK (mode IN ('solo_practice', 'solo_ranked', 'versus_ranked', 'versus_unranked')),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'super_hard')) DEFAULT 'medium',
  outcome TEXT CHECK (outcome IN ('win', 'loss', 'draw')) NOT NULL,
  score INTEGER NOT NULL,
  level_reached INTEGER NOT NULL,
  rounds_cleared INTEGER DEFAULT 0,
  bonus_seconds INTEGER DEFAULT 0,
  perfect BOOLEAN DEFAULT false,
  completed_all_levels BOOLEAN DEFAULT false,
  opponent_name TEXT,
  elo_change INTEGER DEFAULT 0,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 8. Match Invites Table (Lời mời thách đấu thời gian thực)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.match_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT REFERENCES public.versus_rooms(code) ON DELETE CASCADE NOT NULL,
  inviter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  invitee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'super_hard')) DEFAULT 'medium',
  mode TEXT DEFAULT 'versus_ranked',
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'expired')) DEFAULT 'pending',
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 seconds') NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 9. Invite Mutes Table (Tạm thời bỏ qua lời mời từ người chơi khác)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invite_mutes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  muted_handle TEXT NOT NULL,
  until_timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, muted_handle)
);

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

-- Reconcile existing deployments. CREATE TABLE IF NOT EXISTS does not update
-- defaults or add columns to tables that were created by an older schema.
ALTER TABLE public.profiles ALTER COLUMN overall_elo SET DEFAULT 1000;
ALTER TABLE public.category_elo ALTER COLUMN elo SET DEFAULT 1000;
ALTER TABLE public.matchmaking_queue ALTER COLUMN user_elo SET DEFAULT 1000;
ALTER TABLE public.matchmaking_queue ALTER COLUMN min_elo SET DEFAULT 900;
ALTER TABLE public.matchmaking_queue ALTER COLUMN max_elo SET DEFAULT 1100;
ALTER TABLE public.versus_rooms ADD COLUMN IF NOT EXISTS seed TEXT;

-- Atomic matchmaking/room functions and restrictive policies are versioned in
-- database/migrations/20260803_atomic_versus_flows.sql. Apply migrations after
-- this base schema for both new and existing deployments.

-- --------------------------------------------------------------------
-- Enable Row Level Security (RLS) across all 10 core tables
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
-- SECURITY DEFINER functions in database/migrations/20260803_atomic_versus_flows.sql.
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
CREATE POLICY "Public friendships read" ON public.friendships FOR SELECT USING (true);
CREATE POLICY "Users manage friendships" ON public.friendships FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public versus_rooms read" ON public.versus_rooms;
DROP POLICY IF EXISTS "Users manage versus_rooms" ON public.versus_rooms;
DROP POLICY IF EXISTS "Authenticated users read versus rooms" ON public.versus_rooms;
CREATE POLICY "Authenticated users read versus rooms" ON public.versus_rooms FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Public match_invites read" ON public.match_invites;
DROP POLICY IF EXISTS "Users manage match_invites" ON public.match_invites;
DROP POLICY IF EXISTS "Invite participants read" ON public.match_invites;
CREATE POLICY "Invite participants read" ON public.match_invites FOR SELECT USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

DROP POLICY IF EXISTS "Public invite_mutes read" ON public.invite_mutes;
DROP POLICY IF EXISTS "Users manage invite_mutes" ON public.invite_mutes;
CREATE POLICY "Public invite_mutes read" ON public.invite_mutes FOR SELECT USING (true);
CREATE POLICY "Users manage invite_mutes" ON public.invite_mutes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

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
-- Enable Supabase Realtime Publication for Match Invites, Versus Rooms & Queue
-- --------------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_invites;
ALTER PUBLICATION supabase_realtime ADD TABLE public.versus_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matchmaking_queue;
