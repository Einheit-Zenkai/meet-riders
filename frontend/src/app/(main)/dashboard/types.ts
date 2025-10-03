// Dashboard-specific type definitions

export interface FilterState {
  destinationQuery: string;
  timeWindowMins: string;
  sameDepartment: boolean;
  sameYear: boolean;
}

export interface UserProfile {
  id: string;
  nickname?: string;
  full_name?: string;
  university?: string;
  show_university?: boolean;
}

export interface DashboardState {
  welcomeName: string | null;
  isLoading: boolean;
  viewerUniversity: string | null;
}

export interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type?: 'info' | 'warning' | 'success' | 'error';
}

export interface Party {
  id: string;
  created_at: Date;
  updated_at: Date;
  host_id: string;
  party_size: number;
  duration_minutes: number;
  expires_at: Date;
  meetup_point: string;
  drop_off: string;
  is_friends_only: boolean;
  is_gender_only: boolean;
  ride_options: string[];
  host_university: string | null;
  display_university: boolean;
  is_active: boolean;
  // Host comments for joined users
  host_comments?: string;
  // Host profile information (joined from profiles table)
  host_profile?: Profile;
  // Members of the party
  members?: PartyMember[];
  current_member_count?: number;
  user_is_member?: boolean;
}

export interface PartyMember {
    id: string;
  party_id: string;
    user_id: string;
  status: 'joined' | 'left' | 'kicked' | 'pending' | 'expired';
    joined_at: Date;
    left_at?: Date;
    pickup_notes?: string;
    contact_shared: boolean;
    created_at: Date;
    updated_at: Date;
    // Profile information (joined from profiles table)
    profile?: Profile;
}

export interface Profile {
    id: string; // same as host_id in Party
    full_name: string | null;
    major: string | null;
    bio: string | null;
    updated_at: Date | null;
    gender: string | null;
    ideal_departure_time: string | null;
    ideal_location: string | null;
    nickname: string | null;
    punctuality: string | null;
    birth_date: Date | null;
    location: string | null;
    avatar_url: string | null;
    points: number | null;
    university: string | null;
    created_at: Date | null;
    show_university: boolean | null;
  phone_number?: string | null;
  show_phone?: boolean | null;
    isGenderOnly: boolean | null;
    rideOptions: string | null;
    expiresIn: string | null;
}

// SOI (Show of Interest) types
export interface SoiParty {
  id: number;
  created_at: Date;
  host_id: string;
  party_size: number;
  meetup_point: string;
  drop_off: string;
  ride_options: string[];
  start_time: Date;
  expiry_timestamp: Date | null;
  host_university: string | null;
  display_university: boolean;
  is_active: boolean | null;
  host_profile?: Profile;
  current_member_count?: number;
  user_is_member?: boolean;
}

export interface SoiMember {
  id: string;
  soi_id: number;
  user_id: string;
  status: 'joined' | 'left' | 'kicked' | 'pending';
  joined_at: Date;
  left_at?: Date;
  contact_shared: boolean;
  created_at?: Date;
  updated_at?: Date;
  profile?: Profile;
}
