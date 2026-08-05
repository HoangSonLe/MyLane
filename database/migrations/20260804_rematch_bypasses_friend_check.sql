-- Result screen's "Rematch" button needs to re-challenge the opponent from
-- the match that just finished — but create_match_invite only allows
-- inviting accepted friends (INVITEE_NOT_FRIEND), and a Quick Match/Quick
-- Join opponent is very often a stranger. See docs/technical/known-gaps.md
-- #12 "Result của Versus ghi nút Tái đấu, nhưng App.tsx hiện đưa người chơi
-- về Quick Match".
--
-- Add an optional p_rematch_room_code parameter: when the caller isn't a
-- friend of the invitee, the friend-check is bypassed ONLY if that room code
-- points to a `finished` versus_rooms row whose host/guest pair is exactly
-- (caller, invitee). This does not open the door to inviting arbitrary
-- strangers — it only recognizes "the opponent from a real match I was just
-- in", which the caller cannot forge (the room's participant columns are
-- server-owned).
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
