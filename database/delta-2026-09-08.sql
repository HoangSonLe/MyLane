-- ============================================================================
-- Delta 2026-09-08 — chỉ 3 thay đổi so với schema.sql đã apply trước đó.
-- Tùy chọn: chạy lại toàn bộ database/schema.sql cũng cho kết quả y hệt
-- (file đó idempotent). Script này idempotent, chạy lại nhiều lần an toàn.
-- ============================================================================

-- 1. Endless unlock flag (docs/gameplay/README.md § Endless Mode:
--    "Unlocks after a player completes Level 10") + backfill từ lịch sử.
ALTER TABLE public.category_bests
  ADD COLUMN IF NOT EXISTS completed_level_10 BOOLEAN DEFAULT false NOT NULL;

UPDATE public.category_bests cb
SET completed_level_10 = true
WHERE cb.completed_level_10 = false
  AND EXISTS (
    SELECT 1 FROM public.match_history h
    WHERE h.user_id = cb.user_id
      AND h.category = cb.category
      AND h.completed_all_levels = true
  );

-- 2 + 3. finalize_versus_room: tie-break "faster correct player wins"
--    (bằng điểm → ai nộp round 5 sớm hơn thắng, 0-0 vẫn hòa) và cập nhật
--    profiles.overall_elo = trung bình category_elo của hai người chơi.
--    CREATE OR REPLACE giữ nguyên owner/GRANT/REVOKE hiện có của hàm.
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
    ELSIF v_room.host_score > 0 THEN
      -- docs/gameplay/README.md "Versus Ranked ... Faster correct player
      -- wins": equal correct-round counts are decided by who finished round
      -- 5 first, on the server clock (versus_round_results.submitted_at).
      -- 0-0 (nobody answered anything correctly) stays a draw.
      SELECT rr.user_id INTO v_winner_id
      FROM public.versus_round_results rr
      WHERE rr.match_id = v_room.match_id
        AND rr.round_number = 5
        AND rr.user_id IN (v_room.host_id, v_room.guest_id)
      ORDER BY rr.submitted_at ASC, rr.user_id ASC
      LIMIT 1;
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

    -- docs/gameplay/README.md § Elo System: "per-category Elo ... plus a
    -- weighted-average overall Elo". The doc never defines the weights, so
    -- this mirrors the frontend's calculateOverallElo(): a plain average of
    -- the categories the player has an Elo row for. Previously nothing ever
    -- wrote profiles.overall_elo, leaving it frozen at 1000.
    UPDATE public.profiles p
    SET overall_elo = agg.avg_elo, updated_at = NOW()
    FROM (
      SELECT ce.user_id, ROUND(AVG(ce.elo))::INTEGER AS avg_elo
      FROM public.category_elo ce
      WHERE ce.user_id IN (v_room.host_id, v_room.guest_id)
      GROUP BY ce.user_id
    ) agg
    WHERE p.id = agg.user_id;
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
