-- IMPORTANT: Data Types Alignment
-- parties.id = UUID (generated)
-- auth.users.id = UUID
-- profiles.id = UUID (references auth.users.id)
-- 
-- Therefore:
-- party_members.party_id = UUID (references parties.id)
-- party_members.user_id = UUID (references auth.users.id)

-- Create party_members table to track which users have joined which parties
-- This enables the join party feature and member management

CREATE TABLE IF NOT EXISTS party_members (
    -- Primary key
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Foreign key references
    party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Member status and metadata
    status VARCHAR(20) DEFAULT 'joined' CHECK (status IN ('joined', 'left', 'kicked', 'pending', 'expired')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE NULL,
    
    -- Optional member-specific data
    pickup_notes TEXT NULL, -- Special pickup instructions from this member
    contact_shared BOOLEAN DEFAULT FALSE, -- Whether member agreed to share contact info
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_party_members_party_id ON party_members(party_id);
CREATE INDEX IF NOT EXISTS idx_party_members_user_id ON party_members(user_id);
CREATE INDEX IF NOT EXISTS idx_party_members_status ON party_members(status);
CREATE INDEX IF NOT EXISTS idx_party_members_joined_at ON party_members(joined_at);

-- Ensure a user can only be in a party once (prevent duplicate joins)
CREATE UNIQUE INDEX IF NOT EXISTS idx_party_members_unique_active 
ON party_members(party_id, user_id) 
WHERE status = 'joined';

-- RLS (Row Level Security) policies
ALTER TABLE party_members ENABLE ROW LEVEL SECURITY;

-- Helper to determine if the current user can view members of a given party without triggering recursive RLS checks
DROP FUNCTION IF EXISTS public.can_user_view_party_members(UUID);
CREATE OR REPLACE FUNCTION public.can_user_view_party_members(p_party_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    IF current_user_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Hosts can always view their party members
    IF EXISTS (
        SELECT 1
        FROM public.parties
        WHERE id = p_party_id
          AND host_id = current_user_id
    ) THEN
        RETURN TRUE;
    END IF;

    -- Members of the party can view fellow members
    IF EXISTS (
        SELECT 1
        FROM public.party_members AS pm
        WHERE pm.party_id = p_party_id
          AND pm.user_id = current_user_id
          AND pm.status = 'joined'
    ) THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.can_user_view_party_members(UUID) TO authenticated;

DROP POLICY IF EXISTS "Users can view party members they're involved with" ON party_members;
CREATE POLICY "Users can view party members they're involved with" ON party_members
    FOR SELECT 
    USING (
        user_id = auth.uid() OR  -- User can see their own memberships
        public.can_user_view_party_members(party_members.party_id)
    );

-- Policy: Users can insert themselves into parties (join)
CREATE POLICY "Users can join parties" ON party_members
    FOR INSERT 
    WITH CHECK (
        user_id = auth.uid() AND  -- Can only join as themselves
        status = 'joined' AND     -- Can only insert with 'joined' status
        EXISTS (
            SELECT 1 FROM parties 
            WHERE id = party_id 
            AND is_active = true 
            AND expires_at > NOW()  -- Party must be active and not expired
        )
    );

-- Policy: Users can update their own memberships (leave party)
CREATE POLICY "Users can update their own memberships" ON party_members
    FOR UPDATE 
    USING (user_id = auth.uid())
    WITH CHECK (
        user_id = auth.uid() AND
        (status IN ('left', 'joined'))  -- Can only change to left or back to joined
    );

-- Policy: Party hosts can manage all members (kick, etc.)
CREATE POLICY "Hosts can manage party members" ON party_members
    FOR UPDATE 
    USING (
        party_id IN (
            SELECT id FROM parties WHERE host_id = auth.uid()
        )
    )
    WITH CHECK (
        party_id IN (
            SELECT id FROM parties WHERE host_id = auth.uid()
        ) AND
        status IN ('kicked', 'joined', 'expired')  -- Hosts can manage member lifecycle
    );

-- Policy: Users can delete their own memberships, hosts can delete any member
CREATE POLICY "Users and hosts can delete memberships" ON party_members
    FOR DELETE 
    USING (
        user_id = auth.uid() OR  -- Users can delete their own memberships
        party_id IN (
            SELECT id FROM parties WHERE host_id = auth.uid()  -- Hosts can delete any member
        )
    );

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_party_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_party_members_updated_at
    BEFORE UPDATE ON party_members
    FOR EACH ROW
    EXECUTE FUNCTION update_party_members_updated_at();

-- Create a function to get current member count for a party
CREATE OR REPLACE FUNCTION get_party_member_count(p_party_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER 
        FROM party_members 
        WHERE party_id = p_party_id 
        AND status = 'joined'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if a user can join a party
CREATE OR REPLACE FUNCTION can_user_join_party(p_party_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    party_record parties%ROWTYPE;
    current_members INTEGER;
BEGIN
    -- Get party details
    SELECT * INTO party_record FROM parties WHERE id = p_party_id;
    
    -- Check if party exists and is active
    IF NOT FOUND OR NOT party_record.is_active OR party_record.expires_at <= NOW() THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user is the host (hosts can't join their own party)
    IF party_record.host_id = p_user_id THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user is already a member
    IF EXISTS (
        SELECT 1 FROM party_members 
        WHERE party_id = p_party_id 
        AND user_id = p_user_id 
        AND status = 'joined'
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Check if party is full
    current_members := get_party_member_count(p_party_id);
    IF current_members >= party_record.party_size THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON party_members TO authenticated;
GRANT EXECUTE ON FUNCTION get_party_member_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_user_join_party(UUID, UUID) TO authenticated;

-- Host-only helper to kick a member
DROP FUNCTION IF EXISTS public.kick_party_member(UUID, UUID);
CREATE OR REPLACE FUNCTION public.kick_party_member(p_party_id UUID, p_member_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    host_uuid UUID;
BEGIN
    SELECT host_id INTO host_uuid FROM public.parties WHERE id = p_party_id;
    IF host_uuid IS NULL THEN
        RAISE EXCEPTION 'Party not found';
    END IF;

    IF host_uuid <> auth.uid() THEN
        RAISE EXCEPTION 'Only the host can remove members';
    END IF;

    UPDATE public.party_members
    SET status = 'kicked',
            left_at = NOW(),
            updated_at = NOW()
    WHERE party_id = p_party_id
        AND user_id = p_member_user_id
        AND status = 'joined';

    RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.kick_party_member(UUID, UUID) TO authenticated;
