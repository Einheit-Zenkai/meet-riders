            -- Party join request metadata
            -- Requires the pgcrypto extension for gen_random_uuid (run: CREATE EXTENSION IF NOT EXISTS "pgcrypto";)

            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'party_request_status') THEN
                    CREATE TYPE party_request_status AS ENUM ('pending', 'accepted', 'declined', 'cancelled');
                END IF;
            END
            $$;

            CREATE TABLE IF NOT EXISTS party_requests (
                request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
                status party_request_status NOT NULL DEFAULT 'pending',
                created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
            );

            CREATE INDEX IF NOT EXISTS idx_party_requests_party_id ON party_requests(party_id);
            CREATE INDEX IF NOT EXISTS idx_party_requests_user_id ON party_requests(user_id);
            CREATE INDEX IF NOT EXISTS idx_party_requests_status ON party_requests(status);

            -- Keep updated_at fresh on mutations (expects standard trigger function)
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.triggers
                    WHERE event_object_table = 'party_requests' AND trigger_name = 'set_party_requests_updated_at'
                ) THEN
                    CREATE TRIGGER set_party_requests_updated_at
                        BEFORE UPDATE ON party_requests
                        FOR EACH ROW
                        EXECUTE FUNCTION set_updated_at();
                END IF;
            END
            $$;