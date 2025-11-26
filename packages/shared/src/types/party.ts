import type { Profile } from "./profile";

export interface PartyRow {
  id: string;
  created_at: string;
  updated_at: string | null;
  host_id: string;
  party_size: number;
  duration_minutes: number;
  expires_at: string | null;
  meetup_point: string;
  drop_off: string;
  is_friends_only: boolean;
  is_gender_only: boolean;
  ride_options: string[] | null;
  host_university: string | null;
  display_university: boolean;
  is_active: boolean;
  host_comments?: string | null;
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
  host_comments?: string | null;
  host_profile?: Profile;
  current_member_count?: number;
  user_is_member?: boolean;
}

export const fromPartyRow = (
  row: PartyRow,
  extras?: Partial<Pick<Party, "host_profile" | "current_member_count" | "user_is_member">>
): Party => {
  const updatedAtSource = row.updated_at ?? row.created_at;
  const expiresAtSource = row.expires_at ?? row.created_at;

  return {
    id: row.id,
    created_at: new Date(row.created_at),
    updated_at: new Date(updatedAtSource),
    host_id: row.host_id,
    party_size: row.party_size,
    duration_minutes: row.duration_minutes,
    expires_at: new Date(expiresAtSource),
    meetup_point: row.meetup_point,
    drop_off: row.drop_off,
    is_friends_only: row.is_friends_only,
    is_gender_only: row.is_gender_only,
    ride_options: Array.isArray(row.ride_options) ? row.ride_options : [],
    host_university: row.host_university,
    display_university: Boolean(row.display_university),
    is_active: Boolean(row.is_active),
    host_comments: row.host_comments ?? undefined,
    host_profile: extras?.host_profile,
    current_member_count: extras?.current_member_count,
    user_is_member: extras?.user_is_member,
  };
};
