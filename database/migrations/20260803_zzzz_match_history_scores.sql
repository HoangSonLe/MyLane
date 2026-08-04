-- Keep calculated game points (`score`) separate from the two Versus
-- correct-round tallies shown in Profile match history.

ALTER TABLE public.match_history
  ADD COLUMN IF NOT EXISTS player_round_score INTEGER,
  ADD COLUMN IF NOT EXISTS opponent_round_score INTEGER;

ALTER TABLE public.match_history
  DROP CONSTRAINT IF EXISTS match_history_player_round_score_check,
  DROP CONSTRAINT IF EXISTS match_history_opponent_round_score_check;

ALTER TABLE public.match_history
  ADD CONSTRAINT match_history_player_round_score_check
    CHECK (player_round_score IS NULL OR player_round_score >= 0),
  ADD CONSTRAINT match_history_opponent_round_score_check
    CHECK (opponent_round_score IS NULL OR opponent_round_score >= 0);

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

UPDATE public.match_history AS history
SET
  player_round_score = CASE
    WHEN history.user_id = room.host_id THEN room.host_score
    ELSE room.guest_score
  END,
  opponent_round_score = CASE
    WHEN history.user_id = room.host_id THEN room.guest_score
    ELSE room.host_score
  END
FROM public.versus_rooms AS room
WHERE history.match_id = room.match_id
  AND (history.user_id = room.host_id OR history.user_id = room.guest_id);

REVOKE ALL ON FUNCTION public.sync_match_history_versus_scores() FROM PUBLIC;
