import { createClient } from '@supabase/supabase-js';

// Ambil variabel lingkungan Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Cek apakah kredensial Supabase sudah disetel
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.includes('supabase.co'));

// Inisialisasi Supabase Client (dengan fallback aman jika belum diisi)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper Sinkronisasi Wali Kelas dari Supabase
export async function fetchUserAccountsSupabase(defaultAccounts) {
  if (!isSupabaseConfigured || !supabase) return defaultAccounts;
  try {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error || !data || data.length === 0) return defaultAccounts;
    return data;
  } catch (err) {
    console.warn('Gagal memuat akun dari Supabase, menggunakan lokal state:', err);
    return defaultAccounts;
  }
}

// Helper Sinkronisasi Data Siswa dari Supabase
export async function fetchStudentsSupabase(defaultStudents, kelasFilter) {
  if (!isSupabaseConfigured || !supabase) {
    return defaultStudents.filter(s => s.kelas === kelasFilter);
  }
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('kelas', kelasFilter);

    if (error || !data || data.length === 0) {
      return defaultStudents.filter(s => s.kelas === kelasFilter);
    }
    return data;
  } catch (err) {
    console.warn('Gagal memuat data siswa dari Supabase:', err);
    return defaultStudents.filter(s => s.kelas === kelasFilter);
  }
}

// Helper Simpan Presensi Kehadiran ke Supabase
export async function saveDailyAttendanceSupabase(attendanceRecords, kelas, date) {
  if (!isSupabaseConfigured || !supabase) return { success: true, mode: 'local' };
  try {
    const payload = Object.entries(attendanceRecords).map(([studentId, record]) => ({
      student_id: studentId,
      kelas,
      date,
      status: record.status,
      catatan: record.catatan || '',
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('daily_attendances')
      .upsert(payload, { onConflict: 'student_id,date' });

    if (error) throw error;
    return { success: true, mode: 'supabase' };
  } catch (err) {
    console.error('Error menyimpan presensi ke Supabase:', err);
    return { success: false, error: err.message };
  }
}
