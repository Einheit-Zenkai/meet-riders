CREATE TABLE IF NOT EXISTS public.parties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  host_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  party_size integer NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 10 CHECK (duration_minutes BETWEEN 5 AND 180),
  expires_at timestamptz NOT NULL,
  meetup_point text NOT NULL,
  drop_off text NOT NULL,
  is_friends_only boolean NOT NULL DEFAULT FALSE,
  is_gender_only boolean NOT NULL DEFAULT FALSE,
  ride_options text[] NOT NULL DEFAULT '{}'::text[],
  host_comments text,
  host_university text,
  display_university boolean DEFAULT FALSE,
  is_active boolean NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS ix_parties_host_id ON public.parties(host_id);
CREATE INDEX IF NOT EXISTS ix_parties_expires_at ON public.parties(expires_at);

-- Prevent hosts from creating multiple overlapping parties
DROP FUNCTION IF EXISTS public.block_multiple_active_parties();
CREATE OR REPLACE FUNCTION public.block_multiple_active_parties()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.parties existing
    WHERE existing.host_id = NEW.host_id
      AND existing.is_active = TRUE
      AND existing.expires_at > NOW()
      AND existing.id <> NEW.id
  ) THEN
    RAISE EXCEPTION 'Host already has an active party that has not expired yet.'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_block_multiple_active_parties ON public.parties;
CREATE TRIGGER trigger_block_multiple_active_parties
BEFORE INSERT ON public.parties
FOR EACH ROW
EXECUTE FUNCTION public.block_multiple_active_parties();