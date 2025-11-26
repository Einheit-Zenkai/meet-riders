export interface Profile {
  id: string;
  username?: string | null;
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
}
