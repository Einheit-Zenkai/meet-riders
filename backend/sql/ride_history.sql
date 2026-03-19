-- Ride completion + history tracking
-- Run this after parties.sql and party_members.sql

-- 1) Extend existing tables with completion metadata
ALTER TABLE public.parties
  ADD COLUMN IF NOT EXISTS ended_at timestamptz,
  ADD COLUMN IF NOT EXISTS ended_by uuid,
  ADD COLUMN IF NOT EXISTS end_reason text,
  ADD COLUMN IF NOT EXISTS ride_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS host_reached_stop_at timestamptz,
  ADD COLUMN IF NOT EXISTS route_baseline_km double precision,
  ADD COLUMN IF NOT EXISTS route_optimized_km double precision,
  ADD COLUMN IF NOT EXISTS route_distance_saved_km double precision,
  ADD COLUMN IF NOT EXISTS route_baseline_minutes double precision,
  ADD COLUMN IF NOT EXISTS route_optimized_minutes double precision,
  ADD COLUMN IF NOT EXISTS route_time_saved_minutes double precision;

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

-- 6) User-controlled ride history deletion (self only).
DROP FUNCTION IF EXISTS public.delete_my_ride_history(uuid);
CREATE OR REPLACE FUNCTION public.delete_my_ride_history(
  p_ride_history_id uuid DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid;
  v_deleted integer := 0;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_ride_history_id IS NULL THEN
    DELETE FROM public.ride_history_participants rhp
    WHERE rhp.user_id = v_uid;
  ELSE
    DELETE FROM public.ride_history_participants rhp
    WHERE rhp.user_id = v_uid
      AND rhp.ride_history_id = p_ride_history_id;
  END IF;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  -- Cleanup history rows that no longer have any participants.
  DELETE FROM public.ride_history rh
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.ride_history_participants rhp
    WHERE rhp.ride_history_id = rh.id
  );

  RETURN COALESCE(v_deleted, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_my_ride_history(uuid) TO authenticated;

-- 7) Persisted route stops + shortest route optimization for live parties.
CREATE TABLE IF NOT EXISTS public.party_route_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id uuid NOT NULL REFERENCES public.parties(id) ON DELETE CASCADE,
  user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  stop_label text NOT NULL,
  stop_coords jsonb NULL,
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('member_live', 'host_destination', 'manual')),
  stop_order integer NOT NULL DEFAULT 1,
  created_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_party_route_stops_party_id ON public.party_route_stops(party_id);
CREATE INDEX IF NOT EXISTS ix_party_route_stops_party_order ON public.party_route_stops(party_id, stop_order);
CREATE INDEX IF NOT EXISTS ix_party_route_stops_user_id ON public.party_route_stops(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS ux_party_route_stops_party_user
ON public.party_route_stops(party_id, user_id)
WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_party_route_stops_destination
ON public.party_route_stops(party_id, source)
WHERE source = 'host_destination';

ALTER TABLE public.party_route_stops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view route stops for their party" ON public.party_route_stops;
CREATE POLICY "Users can view route stops for their party" ON public.party_route_stops
  FOR SELECT TO authenticated
  USING (public.can_user_view_party_members(party_route_stops.party_id));

DROP POLICY IF EXISTS "Hosts can manage route stops" ON public.party_route_stops;
CREATE POLICY "Hosts can manage route stops" ON public.party_route_stops
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.parties p
      WHERE p.id = party_route_stops.party_id
        AND p.host_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.parties p
      WHERE p.id = party_route_stops.party_id
        AND p.host_id = auth.uid()
    )
  );

DROP TRIGGER IF EXISTS trigger_update_party_route_stops_updated_at ON public.party_route_stops;
DROP FUNCTION IF EXISTS public.update_party_route_stops_updated_at();
CREATE OR REPLACE FUNCTION public.update_party_route_stops_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_party_route_stops_updated_at
  BEFORE UPDATE ON public.party_route_stops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_party_route_stops_updated_at();

DROP FUNCTION IF EXISTS public.calculate_party_route_distance(uuid, jsonb);
CREATE OR REPLACE FUNCTION public.calculate_party_route_distance(
  p_party_id uuid,
  p_start_coords jsonb
)
RETURNS double precision
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_prev_lat double precision;
  v_prev_lng double precision;
  v_curr_lat double precision;
  v_curr_lng double precision;
  v_total double precision := 0;
  v_row RECORD;
BEGIN
  v_prev_lat := NULLIF((p_start_coords ->> 'lat'), '')::double precision;
  v_prev_lng := NULLIF((p_start_coords ->> 'lng'), '')::double precision;

  FOR v_row IN
    SELECT stop_coords
    FROM public.party_route_stops
    WHERE party_id = p_party_id
    ORDER BY stop_order ASC, created_at ASC
  LOOP
    IF v_row.stop_coords IS NULL THEN
      CONTINUE;
    END IF;

    v_curr_lat := NULLIF((v_row.stop_coords ->> 'lat'), '')::double precision;
    v_curr_lng := NULLIF((v_row.stop_coords ->> 'lng'), '')::double precision;
    IF v_curr_lat IS NULL OR v_curr_lng IS NULL THEN
      CONTINUE;
    END IF;

    IF v_prev_lat IS NOT NULL AND v_prev_lng IS NOT NULL THEN
      v_total := v_total + (
        6371 * acos(
          LEAST(1.0, GREATEST(-1.0,
            cos(radians(v_prev_lat)) * cos(radians(v_curr_lat)) * cos(radians(v_curr_lng) - radians(v_prev_lng)) +
            sin(radians(v_prev_lat)) * sin(radians(v_curr_lat))
          ))
        )
      );
    END IF;

    v_prev_lat := v_curr_lat;
    v_prev_lng := v_curr_lng;
  END LOOP;

  RETURN COALESCE(v_total, 0);
END;
$$;

DROP FUNCTION IF EXISTS public.get_party_route_savings(uuid);
CREATE OR REPLACE FUNCTION public.get_party_route_savings(
  p_party_id uuid
)
RETURNS TABLE (
  distance_saved_km double precision,
  time_saved_minutes double precision,
  baseline_km double precision,
  optimized_km double precision,
  baseline_minutes double precision,
  optimized_minutes double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.route_distance_saved_km,
    p.route_time_saved_minutes,
    p.route_baseline_km,
    p.route_optimized_km,
    p.route_baseline_minutes,
    p.route_optimized_minutes
  FROM public.parties p
  WHERE p.id = p_party_id
    AND public.can_user_view_party_members(p.id);
END;
$$;

DROP FUNCTION IF EXISTS public.refresh_party_route_stops_from_user_locations(uuid, boolean);
CREATE OR REPLACE FUNCTION public.refresh_party_route_stops_from_user_locations(
  p_party_id uuid,
  p_include_host_destination boolean DEFAULT TRUE
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid;
  v_party RECORD;
  v_has_user_locations boolean;
  v_next_order integer;
  v_added integer := 0;
  v_user_id uuid;
  v_label text;
  v_lat double precision;
  v_lng double precision;
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
    RAISE EXCEPTION 'Only the host can refresh route stops';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'user_locations'
  ) INTO v_has_user_locations;

  IF NOT v_has_user_locations THEN
    -- Keep destination stop up to date even if live location table is unavailable.
    IF p_include_host_destination THEN
      INSERT INTO public.party_route_stops (party_id, user_id, stop_label, stop_coords, source, stop_order, created_by)
      VALUES (
        p_party_id,
        NULL,
        COALESCE(NULLIF(TRIM(v_party.drop_off), ''), 'Destination'),
        v_party.dest_coords,
        'host_destination',
        9999,
        v_uid
      )
      ON CONFLICT (party_id, source) WHERE source = 'host_destination' DO UPDATE
        SET stop_label = EXCLUDED.stop_label,
            stop_coords = EXCLUDED.stop_coords,
            updated_at = NOW();
    END IF;
    RETURN 0;
  END IF;

  -- Remove stale member-live stops for users no longer in this party.
  DELETE FROM public.party_route_stops prs
  WHERE prs.party_id = p_party_id
    AND prs.source = 'member_live'
    AND prs.user_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM public.party_members pm
      WHERE pm.party_id = p_party_id
        AND pm.user_id = prs.user_id
        AND pm.status = 'joined'
    )
    AND prs.user_id <> v_party.host_id;

  FOR v_user_id IN
    SELECT v_party.host_id
    UNION
    SELECT pm.user_id
    FROM public.party_members pm
    WHERE pm.party_id = p_party_id
      AND pm.status = 'joined'
  LOOP
    SELECT
      COALESCE(NULLIF(TRIM(p.nickname), ''), NULLIF(TRIM(p.full_name), ''), 'Rider') AS label,
      ul.latitude,
      ul.longitude
    INTO v_label, v_lat, v_lng
    FROM public.user_locations ul
    LEFT JOIN public.profiles p ON p.id = ul.user_id
    WHERE ul.user_id = v_user_id
    ORDER BY ul.last_updated DESC
    LIMIT 1;

    IF v_lat IS NULL OR v_lng IS NULL THEN
      CONTINUE;
    END IF;

    SELECT COALESCE(MAX(stop_order), 0) + 1
    INTO v_next_order
    FROM public.party_route_stops
    WHERE party_id = p_party_id;

    INSERT INTO public.party_route_stops (
      party_id,
      user_id,
      stop_label,
      stop_coords,
      source,
      stop_order,
      created_by
    )
    VALUES (
      p_party_id,
      v_user_id,
      v_label,
      jsonb_build_object('lat', v_lat, 'lng', v_lng),
      'member_live',
      v_next_order,
      v_uid
    )
    ON CONFLICT (party_id, user_id) DO UPDATE
      SET stop_label = EXCLUDED.stop_label,
          stop_coords = EXCLUDED.stop_coords,
          source = EXCLUDED.source,
          updated_at = NOW();

    v_added := v_added + 1;
  END LOOP;

  IF p_include_host_destination THEN
    SELECT COALESCE(MAX(stop_order), 0) + 1
    INTO v_next_order
    FROM public.party_route_stops
    WHERE party_id = p_party_id;

    INSERT INTO public.party_route_stops (
      party_id,
      user_id,
      stop_label,
      stop_coords,
      source,
      stop_order,
      created_by
    )
    VALUES (
      p_party_id,
      NULL,
      COALESCE(NULLIF(TRIM(v_party.drop_off), ''), 'Destination'),
      v_party.dest_coords,
      'host_destination',
      v_next_order,
      v_uid
    )
    ON CONFLICT (party_id, source) WHERE source = 'host_destination' DO UPDATE
      SET stop_label = EXCLUDED.stop_label,
          stop_coords = EXCLUDED.stop_coords,
          updated_at = NOW();
  END IF;

  RETURN v_added;
END;
$$;

DROP FUNCTION IF EXISTS public.optimize_party_route(uuid);
CREATE OR REPLACE FUNCTION public.optimize_party_route(
  p_party_id uuid
)
RETURNS TABLE (
  stop_id uuid,
  stop_order integer,
  stop_label text,
  user_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid;
  v_party RECORD;
  v_cur_lat double precision;
  v_cur_lng double precision;
  v_next RECORD;
  v_order integer := 1;
  v_baseline_km double precision := 0;
  v_optimized_km double precision := 0;
  v_saved_km double precision := 0;
  v_avg_kmph double precision := 24;
  v_baseline_minutes double precision := 0;
  v_optimized_minutes double precision := 0;
  v_saved_minutes double precision := 0;
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
    RAISE EXCEPTION 'Only the host can optimize route stops';
  END IF;

  -- Keep source data up to date before optimization.
  PERFORM public.refresh_party_route_stops_from_user_locations(p_party_id, TRUE);

  -- Baseline route is the current persisted order before optimization.
  v_baseline_km := public.calculate_party_route_distance(p_party_id, v_party.start_coords);

  v_cur_lat := NULLIF((v_party.start_coords ->> 'lat'), '')::double precision;
  v_cur_lng := NULLIF((v_party.start_coords ->> 'lng'), '')::double precision;

  CREATE TEMP TABLE tmp_route_stops ON COMMIT DROP AS
  SELECT
    prs.id,
    prs.user_id,
    prs.stop_label,
    prs.stop_order,
    prs.stop_coords,
    CASE WHEN prs.stop_coords IS NOT NULL
         THEN NULLIF((prs.stop_coords ->> 'lat'), '')::double precision
         ELSE NULL END AS lat,
    CASE WHEN prs.stop_coords IS NOT NULL
         THEN NULLIF((prs.stop_coords ->> 'lng'), '')::double precision
         ELSE NULL END AS lng,
    FALSE::boolean AS assigned
  FROM public.party_route_stops prs
  WHERE prs.party_id = p_party_id;

  IF v_cur_lat IS NULL OR v_cur_lng IS NULL THEN
    -- No start coordinates: preserve deterministic order.
    UPDATE public.party_route_stops prs
    SET stop_order = src.new_order,
        updated_at = NOW()
    FROM (
      SELECT id, ROW_NUMBER() OVER (ORDER BY stop_order, created_at, id) AS new_order
      FROM public.party_route_stops
      WHERE party_id = p_party_id
    ) src
    WHERE prs.id = src.id;

    RETURN QUERY
    SELECT prs.id, prs.stop_order, prs.stop_label, prs.user_id
    FROM public.party_route_stops prs
    WHERE prs.party_id = p_party_id
    ORDER BY prs.stop_order ASC, prs.created_at ASC;

    UPDATE public.parties
    SET route_baseline_km = v_baseline_km,
      route_optimized_km = v_baseline_km,
      route_distance_saved_km = 0,
      route_baseline_minutes = CASE WHEN v_avg_kmph > 0 THEN (v_baseline_km / v_avg_kmph) * 60 ELSE 0 END,
      route_optimized_minutes = CASE WHEN v_avg_kmph > 0 THEN (v_baseline_km / v_avg_kmph) * 60 ELSE 0 END,
      route_time_saved_minutes = 0,
      updated_at = NOW()
    WHERE id = p_party_id;
    RETURN;
  END IF;

  LOOP
    SELECT t.id, t.lat, t.lng
    INTO v_next
    FROM tmp_route_stops t
    WHERE t.assigned = FALSE
      AND t.lat IS NOT NULL
      AND t.lng IS NOT NULL
    ORDER BY (
      6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(v_cur_lat)) * cos(radians(t.lat)) * cos(radians(t.lng) - radians(v_cur_lng)) +
          sin(radians(v_cur_lat)) * sin(radians(t.lat))
        ))
      )
    ) ASC
    LIMIT 1;

    EXIT WHEN NOT FOUND;

    UPDATE tmp_route_stops
    SET assigned = TRUE,
        stop_order = v_order
    WHERE id = v_next.id;

    v_cur_lat := v_next.lat;
    v_cur_lng := v_next.lng;
    v_order := v_order + 1;
  END LOOP;

  -- Append unresolved stops after optimized known-coordinate stops.
  UPDATE tmp_route_stops t
  SET stop_order = src.new_order
  FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY stop_order, id) + (v_order - 1) AS new_order
    FROM tmp_route_stops
    WHERE assigned = FALSE
  ) src
  WHERE t.id = src.id;

  UPDATE public.party_route_stops prs
  SET stop_order = t.stop_order,
      updated_at = NOW()
  FROM tmp_route_stops t
  WHERE prs.id = t.id;

    v_optimized_km := public.calculate_party_route_distance(p_party_id, v_party.start_coords);
    v_saved_km := COALESCE(v_baseline_km, 0) - COALESCE(v_optimized_km, 0);
    v_baseline_minutes := CASE WHEN v_avg_kmph > 0 THEN (COALESCE(v_baseline_km, 0) / v_avg_kmph) * 60 ELSE 0 END;
    v_optimized_minutes := CASE WHEN v_avg_kmph > 0 THEN (COALESCE(v_optimized_km, 0) / v_avg_kmph) * 60 ELSE 0 END;
    v_saved_minutes := v_baseline_minutes - v_optimized_minutes;

    UPDATE public.parties
    SET route_baseline_km = v_baseline_km,
      route_optimized_km = v_optimized_km,
      route_distance_saved_km = v_saved_km,
      route_baseline_minutes = v_baseline_minutes,
      route_optimized_minutes = v_optimized_minutes,
      route_time_saved_minutes = v_saved_minutes,
      updated_at = NOW()
    WHERE id = p_party_id;

  RETURN QUERY
  SELECT prs.id, prs.stop_order, prs.stop_label, prs.user_id
  FROM public.party_route_stops prs
  WHERE prs.party_id = p_party_id
  ORDER BY prs.stop_order ASC, prs.created_at ASC;
END;
$$;

DROP FUNCTION IF EXISTS public.save_party_route_order(uuid, uuid[]);
CREATE OR REPLACE FUNCTION public.save_party_route_order(
  p_party_id uuid,
  p_stop_ids uuid[]
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid;
  v_party RECORD;
  v_count integer;
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
    RAISE EXCEPTION 'Only the host can save route order';
  END IF;

  UPDATE public.party_route_stops prs
  SET stop_order = src.ord,
      updated_at = NOW()
  FROM (
    SELECT stop_id, ord
    FROM unnest(p_stop_ids) WITH ORDINALITY AS x(stop_id, ord)
  ) src
  WHERE prs.party_id = p_party_id
    AND prs.id = src.stop_id;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN COALESCE(v_count, 0);
END;
$$;

GRANT SELECT ON public.party_route_stops TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.party_route_stops TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_party_route_distance(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_party_route_savings(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_party_route_stops_from_user_locations(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.optimize_party_route(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_party_route_order(uuid, uuid[]) TO authenticated;

-- 8) Host-only cancel with full data wipe for the party.
DROP FUNCTION IF EXISTS public.cancel_party_and_clear_data(uuid);
CREATE OR REPLACE FUNCTION public.cancel_party_and_clear_data(
  p_party_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid;
  v_host_id uuid;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT host_id INTO v_host_id
  FROM public.parties
  WHERE id = p_party_id;

  IF v_host_id IS NULL THEN
    RAISE EXCEPTION 'Party not found';
  END IF;

  IF v_host_id <> v_uid THEN
    RAISE EXCEPTION 'Only the host can cancel this party';
  END IF;

  -- Deleting the party cascades to: party_members, ride_history(+participants), party_requests, party_route_stops.
  DELETE FROM public.parties
  WHERE id = p_party_id
    AND host_id = v_uid;

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_party_and_clear_data(uuid) TO authenticated;
