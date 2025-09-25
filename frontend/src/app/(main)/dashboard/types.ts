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
    id: number;
    created_at: Date;
    host_id: string;
    party_size: number;
    meetup_point: string;
    drop_off: string;
    is_friends_only: boolean;
    is_gender_only: boolean;
    ride_options: string[];
    expires_in: string;
    expiry_timestamp: Date;
    host_university: string | null;
    display_university: string | null;
    is_active: boolean | null;
}