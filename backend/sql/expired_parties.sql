-- Expired parties archive + restore
-- Keeps expired rides for 10 minutes and lets the host restore them with original details

-- 1) Table to store recently expired parties
CREATE TABLE IF NOT EXISTS public.expired_parties (
  id BIGSERIAL PRIMARY KEY,
  party_id BIGINT NOT NULL REFERENCES public.parties(id) ON DELETE CASCADE,
  host_id UUID NOT NULL,
  meetup_point TEXT NOT NULL,
  drop_off TEXT NOT NULL,
  ride_options TEXT[] DEFAULT '{}',
  party_size INTEGER,
  expired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_expired_parties_party_id ON public.expired_parties(party_id);
CREATE INDEX IF NOT EXISTS ix_expired_parties_expired_at ON public.expired_parties(expired_at);

-- 2) RLS
ALTER TABLE public.expired_parties ENABLE ROW LEVEL SECURITY;

-- Allow anyone authenticated to see expired items (read-only)
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

-- Allow only the host to delete their expired row (used by restore)
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

-- No generic INSERT/UPDATE policies; only functions below insert/delete with SECURITY DEFINER

-- 3) Function to move newly expired parties into expired_parties
CREATE OR REPLACE FUNCTION public.close_expired_parties_and_move()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  moved_ids BIGINT[];
BEGIN
  -- Insert any party that just expired and hasn't been moved yet
  WITH to_move AS (
    SELECT p.id AS party_id, p.host_id, p.meetup_point, p.drop_off, p.ride_options, p.party_size
    FROM public.parties p
    WHERE p.expiry_timestamp <= NOW()
      AND p.is_active = TRUE
      AND NOT EXISTS (
        SELECT 1 FROM public.expired_parties e WHERE e.party_id = p.id
      )
  ), ins AS (
    INSERT INTO public.expired_parties (party_id, host_id, meetup_point, drop_off, ride_options, party_size, expired_at)
    SELECT party_id, host_id, meetup_point, drop_off, ride_options, party_size, NOW()
    FROM to_move
    ON CONFLICT (party_id) DO NOTHING
    RETURNING party_id
  )
  SELECT array_agg(party_id) INTO moved_ids FROM ins;

  -- Mark those parties inactive (idempotent)
  IF moved_ids IS NOT NULL THEN
    UPDATE public.parties SET is_active = FALSE
    WHERE id = ANY(moved_ids);
  END IF;
END $$;

GRANT EXECUTE ON FUNCTION public.close_expired_parties_and_move() TO authenticated;

-- 4) Function to restore an expired party (host only)
-- Ensure previous conflicting versions are removed to avoid return-type mismatch
DROP FUNCTION IF EXISTS public.restore_expired_party(BIGINT);
CREATE OR REPLACE FUNCTION public.restore_expired_party(p_expired_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rec RECORD;
BEGIN
  SELECT * INTO rec FROM public.expired_parties WHERE id = p_expired_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Expired party not found';
  END IF;

  IF rec.host_id <> auth.uid() THEN
    RAISE EXCEPTION 'Only the host can restore this party';
  END IF;

  -- Reactivate the original party with a fresh 10-minute expiry
  UPDATE public.parties
  SET is_active = TRUE,
      expiry_timestamp = NOW() + INTERVAL '10 minutes'
  WHERE id = rec.party_id AND host_id = auth.uid();

  -- Remove from expired bucket
  DELETE FROM public.expired_parties WHERE id = p_expired_id;
  RETURN TRUE;
END $$;

GRANT EXECUTE ON FUNCTION public.restore_expired_party(BIGINT) TO authenticated;

-- 5) Optional cleanup: remove rows older than 10 minutes (you can schedule this, but selection also filters by window)
-- Example: call periodically via Supabase cron/scheduler if desired
CREATE OR REPLACE FUNCTION public.cleanup_old_expired_parties()
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM public.expired_parties WHERE expired_at < NOW() - INTERVAL '10 minutes';
$$;

GRANT EXECUTE ON FUNCTION public.cleanup_old_expired_parties() TO authenticated;
