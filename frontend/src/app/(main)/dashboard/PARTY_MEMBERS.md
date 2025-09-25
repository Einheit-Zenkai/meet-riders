# Party Members Feature

This document outlines the implementation of the party joining/leaving functionality in the Meet Riders dashboard.

## Database Schema

### Party Members Table
- **`id`**: Primary key (UUID)
- **`party_id`**: Foreign key to parties table
- **`user_id`**: Foreign key to auth.users
- **`status`**: Member status (joined, left, kicked, pending)
- **`joined_at`**: Timestamp when user joined
- **`left_at`**: Timestamp when user left (nullable)
- **`pickup_notes`**: Optional pickup instructions from member
- **`contact_shared`**: Whether member agreed to share contact info
- **`created_at`/`updated_at`**: Standard timestamps

### Database Functions
- **`get_party_member_count(party_uuid)`**: Returns current active member count
- **`can_user_join_party(party_uuid, user_uuid)`**: Validates if user can join party

### Row Level Security (RLS)
- Members can view other members of parties they're part of
- Only hosts can manage (kick/reinstate) members
- Users can only join as themselves
- Comprehensive policies for all CRUD operations

## Frontend Implementation

### New Types
- **`PartyMember`**: Interface for party member data with profile information
- **`Party`**: Extended with `current_member_count` and `user_is_member` fields

### Service Layer
- **`PartyMemberService`**: Handles all party member operations
  - `joinParty(partyId, pickupNotes?)`: Join a party
  - `leaveParty(partyId)`: Leave a party
  - `getPartyMembers(partyId)`: Get all party members
  - `getPartyMemberCount(partyId)`: Get member count
  - `isUserMember(partyId)`: Check if user is member

### UI Components

#### DashboardPartyCard Updates
- **Member Count Display**: Shows "current/max" (e.g., "3/5") including host
- **Clickable Member Count**: Opens member list dialog
- **Smart Join/Leave Button**:
  - Shows "Join Party" for non-members
  - Shows "Leave Party" for current members
  - Shows "Full" when party is at capacity
  - Shows "Expired" for expired parties
- **Real-time State**: Buttons disabled during API calls

#### PartyMembersDialog (New)
- **Host Display**: Shows host with crown icon and special styling
- **Member List**: Shows all joined members with avatars and join times
- **Points Display**: Shows member points if available
- **Loading States**: Skeleton loading for better UX
- **Empty State**: Friendly message when no members yet

### Data Flow

1. **Dashboard Load**: 
   - Fetch parties with member counts and user membership status
   - Display accurate member counts in party cards

2. **Join Party**:
   - Validate eligibility using `can_user_join_party` function
   - Insert new member record with "joined" status
   - Refresh dashboard data to reflect changes

3. **Leave Party**:
   - Update member status to "left" with timestamp
   - Refresh dashboard data to reflect changes

4. **View Members**:
   - Click member count to open dialog
   - Fetch and display host + all active members
   - Show member details and join times

### Security Features
- **Server-side Validation**: All join/leave operations validated by database functions
- **Duplicate Prevention**: Unique constraints prevent multiple active memberships
- **Authorization**: RLS policies ensure users can only perform authorized actions
- **Host Protection**: Hosts cannot join their own parties

### Error Handling
- **User-friendly Messages**: Clear error messages for all failure scenarios
- **Graceful Degradation**: UI handles missing data and API failures
- **Loading States**: Visual feedback during API operations
- **Confirmation Dialogs**: Prevent accidental leave operations

## Usage Examples

### Joining a Party
```typescript
const result = await partyMemberService.joinParty(partyId, "I'll be at the main entrance");
if (result.success) {
  // Party joined successfully
  onPartyUpdate(); // Refresh data
}
```

### Viewing Party Members
```typescript
const result = await partyMemberService.getPartyMembers(partyId);
if (result.success) {
  console.log(`Party has ${result.members.length} members`);
}
```

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live member updates
2. **Chat Integration**: Party-specific messaging
3. **Member Notifications**: Notify when someone joins/leaves
4. **Advanced Member Management**: Host tools for member management
5. **Member Profiles**: Detailed member information and ratings
6. **Pickup Coordination**: Location sharing and coordination tools

## Database Setup

Run the SQL script at `/backend/sql/create_party_members_table.sql` to set up the database schema and functions.

```sql
-- Example: Check if user can join party
SELECT can_user_join_party('party-uuid-here', 'user-uuid-here');

-- Example: Get member count
SELECT get_party_member_count('party-uuid-here');
```
