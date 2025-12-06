import { createClient } from "@/utils/supabase/client";
import type { SoiMember } from "../types";

export class SoiMemberService {
  private supabase = createClient();

  async join(soiId: number): Promise<{ success: boolean; error?: string; member?: SoiMember }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return { success: false, error: "Not authenticated" };

      const { data: existing, error: existingError } = await this.supabase
        .from('soi_members')
        .select('*')
        .eq('soi_id', soiId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingError && existingError.code !== 'PGRST116') {
        return { success: false, error: existingError.message };
      }

      let activeRow = existing;

      if (existing?.status === 'joined') {
        // Already joined; nothing to change
      } else if (existing) {
        const { data: updated, error: updateError } = await this.supabase
          .from('soi_members')
          .update({ status: 'joined', left_at: null, joined_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single();
        if (updateError || !updated) {
          return { success: false, error: updateError?.message || 'Failed to re-join SOI' };
        }
        activeRow = updated;
      } else {
        const { data: inserted, error: insertError } = await this.supabase
          .from('soi_members')
          .insert({ soi_id: soiId, user_id: user.id, status: 'joined' })
          .select()
          .single();
        if (insertError || !inserted) {
          const message = insertError?.message || 'Failed to join';
          if (message.includes('duplicate key value')) {
            return { success: false, error: 'You are already marked as interested in this SOI.' };
          }
          return { success: false, error: message };
        }
        activeRow = inserted;
      }

      if (!activeRow) {
        return { success: false, error: 'Failed to join SOI' };
      }

      let profile: Record<string, any> | null = null;
      const { data: profileRow } = await this.supabase
        .from('profiles')
        .select('id, full_name, nickname, avatar_url, gender, points, university, show_university, created_at, updated_at, birth_date')
        .eq('id', activeRow.user_id)
        .maybeSingle();
      if (profileRow) {
        profile = {
          ...profileRow,
          created_at: profileRow.created_at ? new Date(profileRow.created_at) : null,
          updated_at: profileRow.updated_at ? new Date(profileRow.updated_at) : null,
          birth_date: profileRow.birth_date ? new Date(profileRow.birth_date) : null,
        };
      }

      const transformed: SoiMember = {
        ...activeRow,
        joined_at: activeRow.joined_at ? new Date(activeRow.joined_at) : new Date(),
        left_at: activeRow.left_at ? new Date(activeRow.left_at) : undefined,
        created_at: activeRow.created_at ? new Date(activeRow.created_at) : undefined,
        updated_at: activeRow.updated_at ? new Date(activeRow.updated_at) : undefined,
        profile: profile || undefined,
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
