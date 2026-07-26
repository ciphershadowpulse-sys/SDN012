import { supabase, isSupabaseConfigured } from '../lib/supabase';

export { supabase, isSupabaseConfigured };

export const teacherService = {
  async getProfile(userId) {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;
    return data;
  },

  async getClasses(teacherId) {
    if (!isSupabaseConfigured || !supabase) return [];
    const { data, error } = await supabase.from('profiles').select('kelas_binaan').eq('id', teacherId);
    if (error) throw error;
    return data;
  }
};