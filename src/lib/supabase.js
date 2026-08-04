import { createClient } from '@supabase/supabase-js';

// Ambil variabel lingkungan Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Cek apakah kredensial Supabase sudah disetel
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.includes('supabase.co') &&
  !supabaseUrl.includes('url-supabase-anda') &&
  !supabaseUrl.includes('xxxxxxxx')
);

// Inisialisasi Supabase Client (dengan fallback aman jika belum diisi)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// 1. PROFILES / AKUN WALI KELAS
// ==========================================
export async function fetchUserAccountsSupabase(defaultAccounts) {
  if (!isSupabaseConfigured || !supabase) return defaultAccounts;
  try {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error || !data || data.length === 0) return defaultAccounts;
    return data.map(p => ({
      id: p.id,
      username: p.username,
      password: p.password,
      nama: p.nama,
      nip: p.nip,
      kelasBinaan: p.kelas_binaan || p.kelasBinaan,
      role: p.role || 'Wali Kelas',
      email: p.email,
    }));
  } catch (err) {
    console.warn('Gagal memuat profil dari Supabase, menggunakan lokal state:', err);
    return defaultAccounts;
  }
}

export async function loginUserSupabase(username, password) {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const cleanUsername = (username || '').trim();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', cleanUsername)
      .maybeSingle();

    if (error || !data) return null;

    if (data.password === password) {
      return {
        id: data.id,
        username: data.username,
        password: data.password,
        nama: data.nama,
        nip: data.nip || '-',
        kelasBinaan: data.kelas_binaan || data.kelasBinaan || 'XII MIPA 1',
        role: data.role || 'Wali Kelas',
        email: data.email || '',
        phone: data.phone || ''
      };
    }
    return null;
  } catch (err) {
    console.error('Error verifikasi login Supabase:', err);
    return null;
  }
}

export async function saveUserAccountSupabase(account) {
  if (!isSupabaseConfigured || !supabase) return { success: true, mode: 'local' };
  try {
    const payload = {
      id: account.id || `USR-${Date.now()}`,
      username: account.username,
      password: account.password,
      nama: account.nama,
      nip: account.nip || '',
      kelas_binaan: account.kelasBinaan || account.kelas_binaan,
      role: account.role || 'Wali Kelas',
      email: account.email || '',
      phone: account.phone || ''
    };
    const { data, error } = await supabase.from('profiles').upsert([payload]);
    if (error) throw error;
    return { success: true, data, mode: 'supabase' };
  } catch (err) {
    console.error('Gagal menyimpan profil ke Supabase:', err);
    return { success: false, error: err.message };
  }
}

// ==========================================
// 2. STUDENTS / DATA SISWA
// ==========================================
export async function fetchStudentsSupabase(defaultStudents) {
  if (!isSupabaseConfigured || !supabase) return defaultStudents;
  try {
    const { data, error } = await supabase.from('students').select('*');
    if (error || !data || data.length === 0) return defaultStudents;
    return data.map(s => ({
      id: s.id,
      nisn: s.nisn,
      nama: s.nama,
      kelas: s.kelas,
      gender: s.gender,
      status: s.status || 'Aktif',
      email: s.email || '',
      namaOrtu: s.nama_ortu || s.namaOrtu || '',
      phoneOrtu: s.phone_ortu || s.phoneOrtu || '',
      alamat: s.alamat || '',
      catatan: s.catatan || '',
      qrImage: `/qr${s.id?.replace(/[^0-9]/g, '') || '1'}.png`
    }));
  } catch (err) {
    console.warn('Gagal memuat data siswa dari Supabase:', err);
    return defaultStudents;
  }
}

export async function saveStudentSupabase(student) {
  if (!isSupabaseConfigured || !supabase) return { success: true, mode: 'local' };
  try {
    const payload = {
      id: student.id,
      nisn: student.nisn,
      nama: student.nama,
      kelas: student.kelas,
      gender: student.gender,
      status: student.status || 'Aktif',
      email: student.email || '',
      nama_ortu: student.namaOrtu || student.nama_ortu || '',
      phone_ortu: student.phoneOrtu || student.phone_ortu || '',
      alamat: student.alamat || '',
      catatan: student.catatan || ''
    };
    const { data, error } = await supabase.from('students').upsert([payload]);
    if (error) throw error;
    return { success: true, data, mode: 'supabase' };
  } catch (err) {
    console.error('Gagal menyimpan siswa ke Supabase:', err);
    return { success: false, error: err.message };
  }
}

export async function deleteStudentSupabase(studentId) {
  if (!isSupabaseConfigured || !supabase) return { success: true, mode: 'local' };
  try {
    const { error } = await supabase.from('students').delete().eq('id', studentId);
    if (error) throw error;
    return { success: true, mode: 'supabase' };
  } catch (err) {
    console.error('Gagal menghapus siswa dari Supabase:', err);
    return { success: false, error: err.message };
  }
}

// ==========================================
// 3. DAILY ATTENDANCES / PRESENSI HARIAN
// ==========================================
export async function fetchDailyAttendanceSupabase(kelas, date) {
  if (!isSupabaseConfigured || !supabase) return {};
  try {
    const { data, error } = await supabase
      .from('daily_attendances')
      .select('*')
      .eq('kelas', kelas)
      .eq('date', date);

    if (error || !data) return {};

    const recordsMap = {};
    data.forEach(item => {
      recordsMap[item.student_id] = {
        status: item.status,
        catatan: item.catatan || ''
      };
    });
    return recordsMap;
  } catch (err) {
    console.warn('Gagal memuat presensi harian dari Supabase:', err);
    return {};
  }
}

export async function saveDailyAttendanceSupabase(attendanceRecords, classStudents, kelas, date) {
  if (!isSupabaseConfigured || !supabase) return { success: true, mode: 'local' };
  try {
    const validStudentIds = new Set((classStudents || []).map(s => s.id));
    const payload = Object.entries(attendanceRecords)
      .filter(([studentId]) => validStudentIds.has(studentId))
      .map(([studentId, record]) => ({
        student_id: studentId,
        kelas,
        date,
        status: record.status || 'Hadir',
        catatan: record.catatan || '',
        updated_at: new Date().toISOString()
      }));

    if (payload.length === 0) return { success: true, mode: 'supabase' };

    const { data, error } = await supabase
      .from('daily_attendances')
      .upsert(payload, { onConflict: 'student_id,date' });

    if (error) throw error;
    return { success: true, data, mode: 'supabase' };
  } catch (err) {
    console.error('Error menyimpan presensi ke Supabase:', err);
    return { success: false, error: err.message };
  }
}

// ==========================================
// 4. ATTENDANCE RECAP / REKAP ABSENSI
// ==========================================
export async function fetchAttendanceRecapSupabase(defaultRecap) {
  if (!isSupabaseConfigured || !supabase) return defaultRecap;
  try {
    const { data, error } = await supabase.from('attendance_recap').select('*');
    if (error || !data || data.length === 0) return defaultRecap;
    return data.map(r => ({
      studentId: r.student_id || r.studentId,
      nama: r.nama,
      kelas: r.kelas,
      hadir: Number(r.hadir || 0),
      sakit: Number(r.sakit || 0),
      izin: Number(r.izin || 0),
      alpa: Number(r.alpa || 0),
      persentase: Number(r.persentase || 100)
    }));
  } catch (err) {
    console.warn('Gagal memuat rekap absensi dari Supabase:', err);
    return defaultRecap;
  }
}

export async function saveAttendanceRecapSupabase(recapArray) {
  if (!isSupabaseConfigured || !supabase) return { success: true, mode: 'local' };
  try {
    const payload = recapArray.map(r => ({
      student_id: r.studentId || r.student_id,
      nama: r.nama || '',
      kelas: r.kelas || '',
      hadir: r.hadir || 0,
      sakit: r.sakit || 0,
      izin: r.izin || 0,
      alpa: r.alpa || 0,
      persentase: r.persentase || 100
    }));
    const { error } = await supabase.from('attendance_recap').upsert(payload, { onConflict: 'student_id' });
    if (error) throw error;
    return { success: true, mode: 'supabase' };
  } catch (err) {
    console.error('Gagal menyimpan rekap absensi ke Supabase:', err);
    return { success: false, error: err.message };
  }
}

// ==========================================
// 5. GRADES / PENILAIAN SISWA
// ==========================================
export async function fetchGradesSupabase(defaultGrades) {
  if (!isSupabaseConfigured || !supabase) return defaultGrades;
  try {
    const { data, error } = await supabase.from('grades').select('*');
    if (error || !data || data.length === 0) return defaultGrades;
    return data.map(g => ({
      studentId: g.student_id || g.studentId,
      nama: g.nama,
      kelas: g.kelas,
      mapel: g.mapel || 'Matematika Peminatan',
      tugas1: Number(g.tugas1 || 0),
      tugas2: Number(g.tugas2 || 0),
      uh: Number(g.uh || 0),
      uts: Number(g.uts || 0),
      uas: Number(g.uas || 0),
      nilaiAkhir: Number(g.nilai_akhir || g.nilaiAkhir || 0),
      predikat: g.predikat || 'C',
      status: g.status || 'Remedial',
      catatanAi: g.catatan_ai || g.catatanAi || ''
    }));
  } catch (err) {
    console.warn('Gagal memuat nilai dari Supabase:', err);
    return defaultGrades;
  }
}

export async function saveGradesSupabase(gradesArray) {
  if (!isSupabaseConfigured || !supabase) return { success: true, mode: 'local' };
  try {
    const payload = gradesArray.map(g => ({
      student_id: g.studentId || g.student_id,
      nama: g.nama || '',
      kelas: g.kelas || '',
      mapel: g.mapel || 'Matematika Peminatan',
      tugas1: g.tugas1 || 0,
      tugas2: g.tugas2 || 0,
      uh: g.uh || 0,
      uts: g.uts || 0,
      uas: g.uas || 0,
      nilai_akhir: g.nilaiAkhir || g.nilai_akhir || 0,
      predikat: g.predikat || 'C',
      status: g.status || 'Tuntas',
      catatan_ai: g.catatanAi || g.catatan_ai || ''
    }));
    const { error } = await supabase.from('grades').upsert(payload, { onConflict: 'student_id,mapel' });
    if (error) throw error;
    return { success: true, mode: 'supabase' };
  } catch (err) {
    console.error('Gagal menyimpan nilai ke Supabase:', err);
    return { success: false, error: err.message };
  }
}

// ==========================================
// 6. TEACHING SCHEDULES / JADWAL MENGAJAR
// ==========================================
export async function fetchTeachingSchedulesSupabase(defaultSchedules) {
  if (!isSupabaseConfigured || !supabase) return defaultSchedules;
  try {
    const { data, error } = await supabase.from('teaching_schedules').select('*');
    if (error || !data || data.length === 0) return defaultSchedules;
    return data.map(s => ({
      id: s.id,
      hari: s.hari,
      jam: s.jam,
      kelas: s.kelas,
      mapel: s.mapel,
      ruangan: s.ruangan,
      topik: s.topik,
      status: s.status || 'Belum Dimulai'
    }));
  } catch (err) {
    console.warn('Gagal memuat jadwal mengajar dari Supabase:', err);
    return defaultSchedules;
  }
}

export async function saveTeachingScheduleSupabase(schedule) {
  if (!isSupabaseConfigured || !supabase) return { success: true, mode: 'local' };
  try {
    const payload = {
      id: schedule.id || `SCH-${Date.now()}`,
      hari: schedule.hari,
      jam: schedule.jam,
      kelas: schedule.kelas,
      mapel: schedule.mapel,
      ruangan: schedule.ruangan,
      topik: schedule.topik,
      status: schedule.status || 'Belum Dimulai'
    };
    const { data, error } = await supabase.from('teaching_schedules').upsert([payload]);
    if (error) throw error;
    return { success: true, data, mode: 'supabase' };
  } catch (err) {
    console.error('Gagal menyimpan jadwal mengajar ke Supabase:', err);
    return { success: false, error: err.message };
  }
}

// ==========================================
// 7. LESSON PLANS / BANK MODUL & RPP
// ==========================================
export async function fetchLessonPlansSupabase(defaultPlans) {
  if (!isSupabaseConfigured || !supabase) return defaultPlans;
  try {
    const { data, error } = await supabase.from('lesson_plans').select('*');
    if (error || !data || data.length === 0) return defaultPlans;
    return data.map(p => ({
      id: p.id,
      judul: p.judul,
      kelas: p.kelas,
      mapel: p.mapel,
      fase: p.fase || 'Fase F',
      kurikulum: p.kurikulum || 'Kurikulum Merdeka',
      alokasiWaktu: p.alokasi_waktu || p.alokasiWaktu || '',
      penulis: p.penulis || '',
      tanggal: p.tanggal || '',
      format: p.format || 'PDF',
      ringkasan: p.ringkasan,
      tujuan: p.tujuan || '',
      langkah: p.langkah || [],
      fileUrl: p.file_url || p.fileUrl || '/docs/modul_vektor.pdf',
      status: p.status || 'Terverifikasi'
    }));
  } catch (err) {
    console.warn('Gagal memuat modul/RPP dari Supabase:', err);
    return defaultPlans;
  }
}

export async function saveLessonPlanSupabase(plan) {
  if (!isSupabaseConfigured || !supabase) return { success: true, mode: 'local' };
  try {
    const payload = {
      id: plan.id || `RPP-${Date.now()}`,
      judul: plan.judul,
      kelas: plan.kelas,
      mapel: plan.mapel,
      fase: plan.fase || 'Fase F',
      kurikulum: plan.kurikulum || 'Kurikulum Merdeka',
      alokasi_waktu: plan.alokasiWaktu || plan.alokasi_waktu || '',
      penulis: plan.penulis || '',
      tanggal: plan.tanggal || '',
      format: plan.format || 'PDF',
      ringkasan: plan.ringkasan || '',
      tujuan: plan.tujuan || '',
      langkah: plan.langkah || [],
      file_url: plan.fileUrl || plan.file_url || '',
      status: plan.status || 'Terverifikasi'
    };
    const { data, error } = await supabase.from('lesson_plans').upsert([payload]);
    if (error) throw error;
    return { success: true, data, mode: 'supabase' };
  } catch (err) {
    console.error('Gagal menyimpan modul/RPP ke Supabase:', err);
    return { success: false, error: err.message };
  }
}

// ==========================================
// 8. SCHOOL SETTINGS / PENGATURAN SEKOLAH
// ==========================================
export async function fetchSchoolSettingsSupabase(teacherUsername, defaultSettings) {
  if (!isSupabaseConfigured || !supabase) return defaultSettings;
  try {
    const { data, error } = await supabase
      .from('school_settings')
      .select('*')
      .eq('teacher_username', teacherUsername)
      .maybeSingle();
    if (error || !data) return defaultSettings;
    return {
      namaSekolah: data.nama_sekolah || defaultSettings.namaSekolah,
      tahunAjaran: data.tahun_ajaran || defaultSettings.tahunAjaran,
      kkmDefault: data.kkm_default || defaultSettings.kkmDefault,
      kurikulum: data.kurikulum || defaultSettings.kurikulum,
      aiModel: data.ai_model || defaultSettings.aiModel,
      autoWaAlert: data.auto_wa_alert !== undefined ? data.auto_wa_alert : defaultSettings.autoWaAlert
    };
  } catch (err) {
    console.warn('Gagal memuat pengaturan sekolah dari Supabase:', err);
    return defaultSettings;
  }
}

export async function saveSchoolSettingsSupabase(teacherUsername, settings) {
  if (!isSupabaseConfigured || !supabase) return { success: true, mode: 'local' };
  try {
    const payload = {
      teacher_username: teacherUsername,
      nama_sekolah: settings.namaSekolah || 'SMA Negeri 1 Jakarta',
      tahun_ajaran: settings.tahunAjaran || '',
      kkm_default: settings.kkmDefault || 75,
      kurikulum: settings.kurikulum || 'Kurikulum Merdeka',
      ai_model: settings.aiModel || '',
      auto_wa_alert: settings.autoWaAlert !== undefined ? settings.autoWaAlert : true,
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase
      .from('school_settings')
      .upsert([payload], { onConflict: 'teacher_username' });
    if (error) throw error;
    return { success: true, mode: 'supabase' };
  } catch (err) {
    console.error('Gagal menyimpan pengaturan sekolah ke Supabase:', err);
    return { success: false, error: err.message };
  }
}
