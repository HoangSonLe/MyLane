-- Server-authoritative expiry for Versus rooms that remain in `waiting`.
-- Reads, Realtime subscriptions, and the 800 ms room poll do not extend the
-- deadline. Only an authenticated participant heartbeat or a successful room
-- state mutation refreshes the ten-minute TTL.

ALTER TABLE public.versus_rooms
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Existing waiting rooms receive a deployment grace period. Rooms that have
-- already started or finished are outside the waiting-room TTL lifecycle.
UPDATE public.versus_rooms
SET expires_at = clock_timestamp() + INTERVAL '10 minutes'
WHERE status = 'waiting'
  AND expires_at IS NULL;

UPDATE public.versus_rooms
SET expires_at = NULL
WHERE status <> 'waiting'
  AND expires_at IS NOT NULL;

ALTER TABLE public.versus_rooms
  ALTER COLUMN expires_at SET DEFAULT (NOW() + INTERVAL '10 minutes');

CREATE INDEX IF NOT EXISTS versus_rooms_waiting_expiry_idx
  ON public.versus_rooms (expires_at)
  WHERE status = 'waiting';

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

DROP TRIGGER IF EXISTS maintain_waiting_room_expiry_trigger
  ON public.versus_rooms;
CREATE TRIGGER maintain_waiting_room_expiry_trigger
BEFORE INSERT OR UPDATE OF updated_at, status
ON public.versus_rooms
FOR EACH ROW
EXECUTE FUNCTION public.maintain_waiting_room_expiry();

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

-- Preserve the existing RPC signature while making an expired join delete the
-- stale room atomically. Returning NULL commits the DELETE; raising here would
-- roll the cleanup back with the transaction.
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

DROP POLICY IF EXISTS "Authenticated users read versus rooms"
  ON public.versus_rooms;
CREATE POLICY "Authenticated users read versus rooms"
ON public.versus_rooms FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (status <> 'waiting' OR expires_at > NOW())
);

REVOKE ALL ON FUNCTION public.maintain_waiting_room_expiry() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.expire_stale_waiting_rooms() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.heartbeat_versus_room(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.join_versus_room(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.leave_versus_room(TEXT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.expire_stale_waiting_rooms() TO authenticated;
GRANT EXECUTE ON FUNCTION public.heartbeat_versus_room(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_versus_room(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.leave_versus_room(TEXT) TO authenticated;

