-- IMPORTANT: Data Types Alignment
-- parties.id = BIGINT (auto-increment)
-- auth.users.id = UUID
-- profiles.id = UUID (references auth.users.id)
-- 
-- Therefore:
-- party_members.party_id = BIGINT (references parties.id)
-- party_members.user_id = UUID (references auth.users.id)

-- Create party_members table to track which users have joined which parties
-- This enables the join party feature and member management

CREATE TABLE IF NOT EXISTS party_members (
    -- Primary key
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Foreign key references
    party_id BIGINT NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Member status and metadata
    status VARCHAR(20) DEFAULT 'joined' CHECK (status IN ('joined', 'left', 'kicked', 'pending')),
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

-- Policy: Users can view party members for parties they're part of or host
CREATE POLICY "Users can view party members they're involved with" ON party_members
    FOR SELECT 
    USING (
        user_id = auth.uid() OR  -- User can see their own memberships
        party_id IN (
            SELECT id FROM parties WHERE host_id = auth.uid()  -- Host can see all members
        ) OR
        party_id IN (
            SELECT party_id FROM party_members WHERE user_id = auth.uid() AND status = 'joined'  -- Members can see other members
        )
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
            AND expiry_timestamp > NOW()  -- Party must be active and not expired
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
        status IN ('kicked', 'joined')  -- Hosts can kick or reinstate members
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
CREATE OR REPLACE FUNCTION get_party_member_count(party_bigint BIGINT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER 
        FROM party_members 
        WHERE party_id = party_bigint 
        AND status = 'joined'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if a user can join a party
CREATE OR REPLACE FUNCTION can_user_join_party(party_bigint BIGINT, user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    party_record parties%ROWTYPE;
    current_members INTEGER;
BEGIN
    -- Get party details
    SELECT * INTO party_record FROM parties WHERE id = party_bigint;
    
    -- Check if party exists and is active
    IF NOT FOUND OR NOT party_record.is_active OR party_record.expiry_timestamp <= NOW() THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user is the host (hosts can't join their own party)
    IF party_record.host_id = user_uuid THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user is already a member
    IF EXISTS (
        SELECT 1 FROM party_members 
        WHERE party_id = party_bigint 
        AND user_id = user_uuid 
        AND status = 'joined'
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Check if party is full
    current_members := get_party_member_count(party_bigint);
    IF current_members >= party_record.party_size THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON party_members TO authenticated;
GRANT EXECUTE ON FUNCTION get_party_member_count(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION can_user_join_party(BIGINT, UUID) TO authenticated;
