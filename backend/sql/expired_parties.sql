-- Expired parties archive + restore (UUID aware)

-- 1) Table to store recently expired parties
CREATE TABLE IF NOT EXISTS public.expired_parties (
  id BIGSERIAL PRIMARY KEY,
  party_id uuid NOT NULL REFERENCES public.parties(id) ON DELETE CASCADE,
  host_id uuid NOT NULL,
  meetup_point text NOT NULL,
  drop_off text NOT NULL,
  ride_options text[] DEFAULT '{}'::text[],
  party_size integer,
  duration_minutes integer,
  expires_at timestamptz,
  expired_at timestamptz NOT NULL DEFAULT NOW(),
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_expired_parties_party_id ON public.expired_parties(party_id);
CREATE INDEX IF NOT EXISTS ix_expired_parties_expired_at ON public.expired_parties(expired_at);

-- 2) RLS
ALTER TABLE public.expired_parties ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'expired_parties' AND policyname = 'expired_select_all'
  ) THEN
    CREATE POLICY expired_select_all ON public.expired_parties
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'expired_parties' AND policyname = 'expired_delete_host_only'
  ) THEN
    CREATE POLICY expired_delete_host_only ON public.expired_parties
      FOR DELETE
      TO authenticated
      USING (host_id = auth.uid());
  END IF;
END $$;

-- 3) Function to move expired parties (batchable)
CREATE OR REPLACE FUNCTION public.close_expired_parties_and_move(batch_size integer DEFAULT 100)
RETURNS TABLE (closed_party_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_record RECORD;
BEGIN
  FOR expired_record IN
    SELECT p.*
    FROM public.parties p
    WHERE p.is_active = TRUE
      AND p.expires_at <= NOW()
    ORDER BY p.expires_at
    LIMIT batch_size
  LOOP
    INSERT INTO public.expired_parties (
      party_id,
      host_id,
      meetup_point,
      drop_off,
      ride_options,
      party_size,
      duration_minutes,
      expires_at,
      expired_at
    ) VALUES (
      expired_record.id,
      expired_record.host_id,
      expired_record.meetup_point,
      expired_record.drop_off,
      expired_record.ride_options,
      expired_record.party_size,
      expired_record.duration_minutes,
      expired_record.expires_at,
      NOW()
    )
    ON CONFLICT (party_id) DO UPDATE
      SET expired_at = EXCLUDED.expired_at,
          duration_minutes = EXCLUDED.duration_minutes,
          expires_at = EXCLUDED.expires_at,
          meetup_point = EXCLUDED.meetup_point,
          drop_off = EXCLUDED.drop_off,
          ride_options = EXCLUDED.ride_options,
          party_size = EXCLUDED.party_size;

    UPDATE public.party_members
    SET status = 'expired',
        left_at = COALESCE(left_at, NOW()),
        updated_at = NOW()
    WHERE party_id = expired_record.id
      AND status = 'joined';

    UPDATE public.parties
    SET is_active = FALSE,
        updated_at = NOW()
    WHERE id = expired_record.id;

    closed_party_id := expired_record.id;
    RETURN NEXT;
  END LOOP;

  RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION public.close_expired_parties_and_move(integer) TO authenticated;

DROP FUNCTION IF EXISTS public.restore_expired_party(uuid);
DROP FUNCTION IF EXISTS public.restore_expired_party(bigint);
CREATE OR REPLACE FUNCTION public.restore_expired_party(p_expired_id bigint)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rec RECORD;
  new_expiry timestamptz;
BEGIN
  SELECT * INTO rec FROM public.expired_parties WHERE id = p_expired_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Expired party not found';
  END IF;

  IF rec.host_id <> auth.uid() THEN
    RAISE EXCEPTION 'Only the host can restore this party';
  END IF;

  new_expiry := NOW() + make_interval(mins => COALESCE(rec.duration_minutes, 10));

  UPDATE public.parties
  SET is_active = TRUE,
      duration_minutes = COALESCE(rec.duration_minutes, duration_minutes),
      expires_at = new_expiry,
      updated_at = NOW(),
      meetup_point = rec.meetup_point,
      drop_off = rec.drop_off,
      ride_options = rec.ride_options,
      party_size = rec.party_size
  WHERE id = rec.party_id AND host_id = auth.uid();

  DELETE FROM public.expired_parties WHERE id = p_expired_id;
  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.restore_expired_party(bigint) TO authenticated;

-- 5) Optional cleanup for archive table
CREATE OR REPLACE FUNCTION public.cleanup_old_expired_parties(retention_minutes integer DEFAULT 10)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.expired_parties
  WHERE expired_at < NOW() - make_interval(mins => retention_minutes);
END;
$$;

GRANT EXECUTE ON FUNCTION public.cleanup_old_expired_parties(integer) TO authenticated;

