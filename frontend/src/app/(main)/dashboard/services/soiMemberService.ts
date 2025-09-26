import { createClient } from "@/utils/supabase/client";
import type { SoiMember } from "../types";

export class SoiMemberService {
  private supabase = createClient();

  async join(soiId: number): Promise<{ success: boolean; error?: string; member?: SoiMember }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return { success: false, error: "Not authenticated" };

      const { data: member, error } = await this.supabase
        .from('soi_members')
        .insert({ soi_id: soiId, user_id: user.id, status: 'joined' })
        .select(`*, profile:user_id ( id, full_name, nickname, avatar_url, gender, points, university, show_university )`)
        .single();

      if (error) return { success: false, error: error.message };

      const transformed: SoiMember = {
        ...member,
        joined_at: new Date(member.joined_at),
        left_at: member.left_at ? new Date(member.left_at) : undefined,
        created_at: member.created_at ? new Date(member.created_at) : undefined,
        updated_at: member.updated_at ? new Date(member.updated_at) : undefined,
      };
      return { success: true, member: transformed };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Join failed' };
    }
  }

  async leave(soiId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return { success: false, error: "Not authenticated" };
      const { error } = await this.supabase
        .from('soi_members')
        .update({ status: 'left', left_at: new Date().toISOString() })
        .eq('soi_id', soiId)
        .eq('user_id', user.id)
        .eq('status', 'joined');
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Leave failed' };
    }
  }
}

export const soiMemberService = new SoiMemberService();
