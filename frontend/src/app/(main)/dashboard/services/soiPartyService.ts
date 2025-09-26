import { createClient } from "@/utils/supabase/client";

export class SoiPartyService {
  private supabase = createClient();

  async cancel(soiId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return { success: false, error: "Not authenticated" };

      const { error } = await this.supabase
        .from('soi_parties')
        .update({ is_active: false })
        .eq('id', soiId)
        .eq('host_id', user.id)
        .eq('is_active', true);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Cancel failed' };
    }
  }
}

export const soiPartyService = new SoiPartyService();
