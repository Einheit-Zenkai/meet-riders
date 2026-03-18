-- Ride completion + history tracking
-- Run this after parties.sql and party_members.sql

-- 1) Extend existing tables with completion metadata
ALTER TABLE public.parties
  ADD COLUMN IF NOT EXISTS ended_at timestamptz,
  ADD COLUMN IF NOT EXISTS ended_by uuid,
  ADD COLUMN IF NOT EXISTS end_reason text,
  ADD COLUMN IF NOT EXISTS ride_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS host_reached_stop_at timestamptz;

ALTER TABLE public.party_members
  ADD COLUMN IF NOT EXISTS reached_stop_at timestamptz;

-- 2) History tables
CREATE TABLE IF NOT EXISTS public.ride_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id uuid NOT NULL UNIQUE REFERENCES public.parties(id) ON DELETE CASCADE,
  host_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meetup_point text NOT NULL,
  drop_off text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT NOW(),
  ended_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  end_reason text,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_ride_history_host_id ON public.ride_history(host_id);
CREATE INDEX IF NOT EXISTS ix_ride_history_completed_at ON public.ride_history(completed_at DESC);

CREATE TABLE IF NOT EXISTS public.ride_history_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_history_id uuid NOT NULL REFERENCES public.ride_history(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('host', 'member')),
  reached_stop_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (ride_history_id, user_id)
);

CREATE INDEX IF NOT EXISTS ix_ride_history_participants_user_id ON public.ride_history_participants(user_id);
CREATE INDEX IF NOT EXISTS ix_ride_history_participants_ride_id ON public.ride_history_participants(ride_history_id);

ALTER TABLE public.ride_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_history_participants ENABLE ROW LEVEL SECURITY;

-- Authenticated users can only see history rows where they participated.
DROP POLICY IF EXISTS "Users can view their ride history" ON public.ride_history;
CREATE POLICY "Users can view their ride history" ON public.ride_history
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.ride_history_participants rhp
      WHERE rhp.ride_history_id = ride_history.id
        AND rhp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view history participants" ON public.ride_history_participants;
CREATE POLICY "Users can view history participants" ON public.ride_history_participants
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.ride_history rh
      WHERE rh.id = ride_history_participants.ride_history_id
        AND EXISTS (
          SELECT 1
          FROM public.ride_history_participants mine
          WHERE mine.ride_history_id = rh.id
            AND mine.user_id = auth.uid()
        )
    )
  );

-- 3) Internal finalization helper (idempotent)
DROP FUNCTION IF EXISTS public.finalize_party_and_record_history(uuid, uuid, text, boolean);
CREATE OR REPLACE FUNCTION public.finalize_party_and_record_history(
  p_party_id uuid,
  p_ended_by uuid,
  p_end_reason text,
  p_completed boolean
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_history_id uuid;
  v_party RECORD;
BEGIN
  SELECT * INTO v_party
  FROM public.parties
  WHERE id = p_party_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Party not found';
  END IF;

  -- If already finalized and history exists, return existing history id.
  SELECT id INTO v_history_id
  FROM public.ride_history
  WHERE party_id = p_party_id;

  IF v_history_id IS NOT NULL THEN
    RETURN v_history_id;
  END IF;

  UPDATE public.parties
  SET is_active = FALSE,
      ended_at = COALESCE(ended_at, NOW()),
      ended_by = COALESCE(p_ended_by, ended_by),
      end_reason = COALESCE(p_end_reason, end_reason),
      ride_completed = p_completed,
      updated_at = NOW()
  WHERE id = p_party_id;

  INSERT INTO public.ride_history (
    party_id,
    host_id,
    meetup_point,
    drop_off,
    completed_at,
    ended_by,
    end_reason
  )
  VALUES (
    v_party.id,
    v_party.host_id,
    v_party.meetup_point,
    v_party.drop_off,
    NOW(),
    p_ended_by,
    p_end_reason
  )
  ON CONFLICT (party_id) DO UPDATE
    SET ended_by = COALESCE(EXCLUDED.ended_by, ride_history.ended_by),
        end_reason = COALESCE(EXCLUDED.end_reason, ride_history.end_reason),
        completed_at = COALESCE(ride_history.completed_at, EXCLUDED.completed_at)
  RETURNING id INTO v_history_id;

  -- Always include host in participants snapshot
  INSERT INTO public.ride_history_participants (
    ride_history_id,
    user_id,
    role,
    reached_stop_at
  )
  VALUES (
    v_history_id,
    v_party.host_id,
    'host',
    v_party.host_reached_stop_at
  )
  ON CONFLICT (ride_history_id, user_id) DO NOTHING;

  -- Include joined members snapshot
  INSERT INTO public.ride_history_participants (
    ride_history_id,
    user_id,
    role,
    reached_stop_at
  )
  SELECT
    v_history_id,
    pm.user_id,
    CASE WHEN pm.user_id = v_party.host_id THEN 'host' ELSE 'member' END,
    pm.reached_stop_at
  FROM public.party_members pm
  WHERE pm.party_id = p_party_id
    AND pm.status = 'joined'
  ON CONFLICT (ride_history_id, user_id) DO NOTHING;

  RETURN v_history_id;
END;
$$;

-- 4) Mark current user as having reached their stop; auto-complete ride when everyone is done.
DROP FUNCTION IF EXISTS public.mark_current_user_reached_stop(uuid);
CREATE OR REPLACE FUNCTION public.mark_current_user_reached_stop(p_party_id uuid)
RETURNS TABLE (
  ride_completed boolean,
  reached_count integer,
  total_count integer,
  history_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid;
  v_party RECORD;
  v_member_updated integer;
  v_reached integer;
  v_total integer;
  v_history_id uuid;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_party
  FROM public.parties
  WHERE id = p_party_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Party not found';
  END IF;

  IF v_party.is_active IS NOT TRUE THEN
    SELECT id INTO v_history_id FROM public.ride_history WHERE party_id = p_party_id;
    RETURN QUERY SELECT TRUE, 0::integer, 0::integer, v_history_id;
    RETURN;
  END IF;

  IF v_uid = v_party.host_id THEN
    UPDATE public.parties
    SET host_reached_stop_at = COALESCE(host_reached_stop_at, NOW()),
        updated_at = NOW()
    WHERE id = p_party_id;
  ELSE
    UPDATE public.party_members
    SET reached_stop_at = COALESCE(reached_stop_at, NOW()),
        updated_at = NOW()
    WHERE party_id = p_party_id
      AND user_id = v_uid
      AND status = 'joined';

    GET DIAGNOSTICS v_member_updated = ROW_COUNT;
    IF v_member_updated = 0 THEN
      RAISE EXCEPTION 'You are not an active participant in this party';
    END IF;
  END IF;

  SELECT
    (CASE WHEN p.host_reached_stop_at IS NOT NULL THEN 1 ELSE 0 END)
      + COALESCE(COUNT(*) FILTER (WHERE pm.user_id <> p.host_id AND pm.reached_stop_at IS NOT NULL), 0),
    1 + COALESCE(COUNT(*) FILTER (WHERE pm.user_id <> p.host_id), 0)
  INTO v_reached, v_total
  FROM public.parties p
  LEFT JOIN public.party_members pm
    ON pm.party_id = p.id
   AND pm.status = 'joined'
  WHERE p.id = p_party_id
  GROUP BY p.id, p.host_reached_stop_at;

  IF v_total > 0 AND v_reached >= v_total THEN
    v_history_id := public.finalize_party_and_record_history(
      p_party_id,
      v_uid,
      'all_stops_reached',
      TRUE
    );
    RETURN QUERY SELECT TRUE, v_reached, v_total, v_history_id;
    RETURN;
  END IF;

  RETURN QUERY SELECT FALSE, v_reached, v_total, NULL::uuid;
END;
$$;

-- 5) Host-only explicit end action that also records history.
DROP FUNCTION IF EXISTS public.end_party_with_reason(uuid, text);
CREATE OR REPLACE FUNCTION public.end_party_with_reason(
  p_party_id uuid,
  p_reason text DEFAULT 'host_connected'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_party RECORD;
  v_uid uuid;
  v_reason text;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_party
  FROM public.parties
  WHERE id = p_party_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Party not found';
  END IF;

  IF v_party.host_id <> v_uid THEN
    RAISE EXCEPTION 'Only the host can end this party';
  END IF;

  v_reason := COALESCE(NULLIF(TRIM(p_reason), ''), 'host_connected');

  -- Mark host as reached by default when host explicitly ends.
  UPDATE public.parties
  SET host_reached_stop_at = COALESCE(host_reached_stop_at, NOW()),
      updated_at = NOW()
  WHERE id = p_party_id;

  RETURN public.finalize_party_and_record_history(
    p_party_id,
    v_uid,
    v_reason,
    TRUE
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_current_user_reached_stop(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.end_party_with_reason(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_party_and_record_history(uuid, uuid, text, boolean) TO authenticated;
GRANT SELECT ON public.ride_history TO authenticated;
GRANT SELECT ON public.ride_history_participants TO authenticated;
