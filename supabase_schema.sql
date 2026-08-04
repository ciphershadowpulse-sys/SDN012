-- =========================================================
-- SKEMA BASIS DATA SUPABASE — DIGITAL GURU (WALI KELAS)
-- FULLY COMPATIBLE DENGAN SUPABASE SQL EDITOR
-- =========================================================
-- CARA PAKAI:
--   1. Buka Supabase Dashboard → SQL Editor
--   2. Copy-paste SELURUH isi file ini
--   3. Klik "Run" / "Execute"
--   4. Semua tabel, trigger, data demo, RLS & policy akan terbuat
-- =========================================================
-- TERHUBUNG DENGAN MENU APLIKASI:
--   1. Login & Register       → profiles
--   2. Dashboard               → profiles, students, attendance_recap, grades
--   3. Data Siswa              → students
--   4. Absensi Harian          → daily_attendances
--   5. Rekap Absensi Siswa     → attendance_recap
--   6. Penilaian Siswa         → grades
--   7. Chat Asisten AI         → profiles, students, attendance_recap, grades
--   8. Analisis Kelas          → class_analytics
--   9. Bank Modul & RPP        → lesson_plans
--  10. Jadwal Mengajar         → teaching_schedules
--  11. Pengaturan              → profiles, school_settings
-- =========================================================


-- =========================================================
-- LANGKAH 1: BERSIHKAN SEMUA YANG SUDAH ADA (SAFE RESET)
-- DROP TABLE CASCADE otomatis menghapus trigger & constraint
-- =========================================================

DROP TABLE IF EXISTS public.school_settings CASCADE;
DROP TABLE IF EXISTS public.class_analytics CASCADE;
DROP TABLE IF EXISTS public.lesson_plans CASCADE;
DROP TABLE IF EXISTS public.teaching_schedules CASCADE;
DROP TABLE IF EXISTS public.grades CASCADE;
DROP TABLE IF EXISTS public.attendance_recap CASCADE;
DROP TABLE IF EXISTS public.daily_attendances CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.fn_update_attendance_recap() CASCADE;
DROP FUNCTION IF EXISTS public.fn_auto_calc_grades() CASCADE;
DROP FUNCTION IF EXISTS public.fn_sync_student_to_recap() CASCADE;


-- =========================================================
-- LANGKAH 2: BUAT SEMUA TABEL
-- =========================================================

-- 1. PROFILES (Login & Register, Dashboard, Pengaturan)
CREATE TABLE public.profiles (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  nama TEXT NOT NULL,
  nip TEXT,
  kelas_binaan TEXT NOT NULL,
  role TEXT DEFAULT 'Wali Kelas',
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. STUDENTS (Data Siswa, Dashboard, Absensi, Penilaian, Chat AI)
CREATE TABLE public.students (
  id TEXT PRIMARY KEY,
  nisn TEXT UNIQUE NOT NULL,
  alt_nisn TEXT,
  nama TEXT NOT NULL,
  kelas TEXT NOT NULL,
  gender TEXT NOT NULL,
  status TEXT DEFAULT 'Aktif',
  email TEXT,
  nama_ortu TEXT,
  phone_ortu TEXT,
  alamat TEXT,
  catatan TEXT,
  qr_image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_students_kelas ON public.students(kelas);

-- 3. DAILY_ATTENDANCES (Absensi Harian — QR Scanner)
CREATE TABLE public.daily_attendances (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  kelas TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Hadir', 'Sakit', 'Izin', 'Alpa')),
  catatan TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (student_id, date)
);

CREATE INDEX idx_daily_att_date ON public.daily_attendances(date);
CREATE INDEX idx_daily_att_student ON public.daily_attendances(student_id);

-- 4. ATTENDANCE_RECAP (Rekap Absensi, Dashboard, Chat AI)
CREATE TABLE public.attendance_recap (
  student_id TEXT PRIMARY KEY REFERENCES public.students(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  kelas TEXT NOT NULL,
  hadir INTEGER DEFAULT 0,
  sakit INTEGER DEFAULT 0,
  izin INTEGER DEFAULT 0,
  alpa INTEGER DEFAULT 0,
  persentase NUMERIC(5,2) DEFAULT 100.00
);

CREATE INDEX idx_recap_kelas ON public.attendance_recap(kelas);

-- 5. GRADES (Penilaian Siswa, Dashboard, Chat AI, Analisis Kelas)
CREATE TABLE public.grades (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  kelas TEXT NOT NULL,
  mapel TEXT NOT NULL DEFAULT 'Matematika Peminatan',
  tugas1 NUMERIC(5,2) DEFAULT 0,
  tugas2 NUMERIC(5,2) DEFAULT 0,
  uh NUMERIC(5,2) DEFAULT 0,
  uts NUMERIC(5,2) DEFAULT 0,
  uas NUMERIC(5,2) DEFAULT 0,
  nilai_akhir NUMERIC(5,2) DEFAULT 0,
  predikat TEXT DEFAULT 'C',
  status TEXT DEFAULT 'Remedial',
  catatan_ai TEXT,
  UNIQUE (student_id, mapel)
);

CREATE INDEX idx_grades_kelas ON public.grades(kelas);
CREATE INDEX idx_grades_student ON public.grades(student_id);

-- 6. TEACHING_SCHEDULES (Jadwal Mengajar)
CREATE TABLE public.teaching_schedules (
  id TEXT PRIMARY KEY,
  teacher_username TEXT,
  hari TEXT NOT NULL,
  jam TEXT NOT NULL,
  kelas TEXT NOT NULL,
  mapel TEXT NOT NULL,
  ruangan TEXT NOT NULL,
  topik TEXT NOT NULL,
  status TEXT DEFAULT 'Belum Dimulai',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_schedules_teacher ON public.teaching_schedules(teacher_username);

-- 7. LESSON_PLANS (Bank Modul & RPP)
CREATE TABLE public.lesson_plans (
  id TEXT PRIMARY KEY,
  teacher_username TEXT,
  judul TEXT NOT NULL,
  kelas TEXT NOT NULL,
  mapel TEXT NOT NULL,
  fase TEXT DEFAULT 'Fase F',
  kurikulum TEXT DEFAULT 'Kurikulum Merdeka',
  alokasi_waktu TEXT,
  penulis TEXT,
  tanggal TEXT,
  format TEXT DEFAULT 'PDF',
  ringkasan TEXT,
  tujuan TEXT,
  langkah JSONB,
  file_url TEXT,
  status TEXT DEFAULT 'Terverifikasi',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_lesson_teacher ON public.lesson_plans(teacher_username);
CREATE INDEX idx_lesson_kelas ON public.lesson_plans(kelas);

-- 8. CLASS_ANALYTICS (Analisis Kelas)
CREATE TABLE public.class_analytics (
  id TEXT PRIMARY KEY,
  kelas TEXT NOT NULL UNIQUE,
  rata_rata_kelas NUMERIC(5,2) DEFAULT 0.00,
  ketuntasan_persen NUMERIC(5,2) DEFAULT 0.00,
  jumlah_siswa INTEGER DEFAULT 0,
  jumlah_tuntas INTEGER DEFAULT 0,
  jumlah_remedial INTEGER DEFAULT 0,
  catatan_ai TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. SCHOOL_SETTINGS (Pengaturan per guru)
CREATE TABLE public.school_settings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  teacher_username TEXT UNIQUE NOT NULL,
  nama_sekolah TEXT DEFAULT 'SMA Negeri 1 Jakarta',
  tahun_ajaran TEXT DEFAULT '2026/2027 (Semester Ganjil)',
  kkm_default INTEGER DEFAULT 75,
  kurikulum TEXT DEFAULT 'Kurikulum Merdeka',
  ai_model TEXT DEFAULT 'Gemini 3.6 Pro (Fast & Accurate)',
  auto_wa_alert BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);


-- =========================================================
-- LANGKAH 3: BUAT TRIGGER FUNCTIONS
-- =========================================================

-- TRIGGER FUNCTION 1: Inisialisasi & sinkronisasi siswa ke attendance_recap
CREATE OR REPLACE FUNCTION public.fn_sync_student_to_recap()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.attendance_recap (student_id, nama, kelas, hadir, sakit, izin, alpa, persentase)
  VALUES (NEW.id, NEW.nama, NEW.kelas, 0, 0, 0, 0, 100.00)
  ON CONFLICT (student_id) DO UPDATE SET
    nama = EXCLUDED.nama,
    kelas = EXCLUDED.kelas;

  -- Update nama/kelas di tabel grades jika data siswa diperbarui
  UPDATE public.grades
  SET nama = NEW.nama, kelas = NEW.kelas
  WHERE student_id = NEW.id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_student_to_recap
AFTER INSERT OR UPDATE ON public.students
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_student_to_recap();


-- TRIGGER FUNCTION 2: Auto-update rekap absensi saat ada presensi harian
CREATE OR REPLACE FUNCTION public.fn_update_attendance_recap()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_student_id TEXT;
  v_nama TEXT;
  v_kelas TEXT;
  v_hadir INTEGER;
  v_sakit INTEGER;
  v_izin INTEGER;
  v_alpa INTEGER;
  v_total INTEGER;
  v_persen NUMERIC(5,2);
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_student_id := OLD.student_id;
  ELSE
    v_student_id := NEW.student_id;
  END IF;

  SELECT s.nama, s.kelas INTO v_nama, v_kelas
  FROM public.students s WHERE s.id = v_student_id;

  SELECT
    COALESCE(SUM(CASE WHEN da.status = 'Hadir' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN da.status = 'Sakit' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN da.status = 'Izin'  THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN da.status = 'Alpa'  THEN 1 ELSE 0 END), 0),
    COUNT(*)
  INTO v_hadir, v_sakit, v_izin, v_alpa, v_total
  FROM public.daily_attendances da
  WHERE da.student_id = v_student_id;

  IF v_total > 0 THEN
    v_persen := ROUND((v_hadir::NUMERIC / v_total::NUMERIC) * 100, 2);
  ELSE
    v_persen := 100.00;
  END IF;

  INSERT INTO public.attendance_recap (student_id, nama, kelas, hadir, sakit, izin, alpa, persentase)
  VALUES (v_student_id, v_nama, v_kelas, v_hadir, v_sakit, v_izin, v_alpa, v_persen)
  ON CONFLICT (student_id) DO UPDATE SET
    nama = EXCLUDED.nama,
    kelas = EXCLUDED.kelas,
    hadir = EXCLUDED.hadir,
    sakit = EXCLUDED.sakit,
    izin = EXCLUDED.izin,
    alpa = EXCLUDED.alpa,
    persentase = EXCLUDED.persentase;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER trg_update_attendance_recap
AFTER INSERT OR UPDATE OR DELETE ON public.daily_attendances
FOR EACH ROW EXECUTE FUNCTION public.fn_update_attendance_recap();


-- TRIGGER FUNCTION 3: Auto-calc nilai akhir & predikat
CREATE OR REPLACE FUNCTION public.fn_auto_calc_grades()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_nilai NUMERIC(5,2);
  v_pred TEXT;
  v_stat TEXT;
BEGIN
  v_nilai := ROUND(
    (NEW.tugas1 * 0.15) +
    (NEW.tugas2 * 0.15) +
    (NEW.uh * 0.20) +
    (NEW.uts * 0.25) +
    (NEW.uas * 0.25)
  , 2);

  IF v_nilai >= 88 THEN v_pred := 'A';
  ELSIF v_nilai >= 80 THEN v_pred := 'B';
  ELSIF v_nilai >= 70 THEN v_pred := 'C';
  ELSE v_pred := 'D';
  END IF;

  IF v_nilai >= 75 THEN v_stat := 'Tuntas';
  ELSE v_stat := 'Remedial';
  END IF;

  NEW.nilai_akhir := v_nilai;
  NEW.predikat := v_pred;
  NEW.status := v_stat;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_calc_grades
BEFORE INSERT OR UPDATE ON public.grades
FOR EACH ROW EXECUTE FUNCTION public.fn_auto_calc_grades();


-- =========================================================
-- LANGKAH 4: MASUKKAN DATA DEMO
-- =========================================================

-- 4 Profil Wali Kelas
INSERT INTO public.profiles (id, username, password, nama, nip, kelas_binaan, email, phone) VALUES
  ('USR-001', 'walikelas1', '123456', 'Pak Budi, S.Pd', '19850412 201001 1 008', 'XII MIPA 1', 'budi.matematika@sekolah.sch.id', '081234567890'),
  ('USR-002', 'walikelas2', '123456', 'Ibu Siti Rahmah, M.Pd', '19870820 201202 2 015', 'XII MIPA 2', 'siti.rahmah@sekolah.sch.id', '081234567891'),
  ('USR-003', 'walikelas3', '123456', 'Bpk. Agus Santoso, S.Si', '19830514 200801 1 004', 'XI MIPA 1', 'agus.santoso@sekolah.sch.id', '081234567892'),
  ('USR-004', 'walikelas4', '123456', 'Ibu Dewi Lestari, S.Pd', '19900311 201503 2 009', 'X MIPA 1', 'dewi.lestari@sekolah.sch.id', '081234567893')
ON CONFLICT (username) DO NOTHING;

-- 10 Siswa (Otomatis men-trigger fn_sync_student_to_recap untuk membuat baris awal di attendance_recap)
INSERT INTO public.students (id, nisn, alt_nisn, nama, kelas, gender, email, nama_ortu, phone_ortu, alamat, catatan, qr_image) VALUES
  ('STU-001', '0012345688', 'Murid-SDN012-11', 'Ahmad Rizky Pratama', 'XII MIPA 1', 'Laki-Laki', 'rizky.pratama@siswa.belajar.id', 'Bpk. Hendra Pratama', '081234567801', 'Jl. Merdeka No. 12, Jakarta', 'Aktif dalam diskusi matematika, ketua OSIS.', '/qr1.png'),
  ('STU-002', '3184861266', NULL, 'Anisa Rahmawati', 'XII MIPA 1', 'Perempuan', 'anisa.rahma@siswa.belajar.id', 'Ibu Kurniawati', '081234567802', 'Jl. Melati No. 45, Jakarta', 'Sangat teliti dalam pengerjaan tugas matematika.', '/qr2.png'),
  ('STU-003', '0051234503', NULL, 'Bagus Setyo Nugroho', 'XII MIPA 1', 'Laki-Laki', 'bagus.setyo@siswa.belajar.id', 'Bpk. Tri Nugroho', '081234567803', 'Jl. Mawar Gg. 3 No. 8, Jakarta', 'Perlu bimbingan ekstra pada materi kalkulus.', NULL),
  ('STU-004', '0051234504', NULL, 'Citra Dewi Lestari', 'XII MIPA 1', 'Perempuan', 'citra.dewi@siswa.belajar.id', 'Ibu Rahayu Lestari', '081234567804', 'Jl. Sudirman No. 88, Jakarta', 'Juara 2 Olimpiade Fisika tingkat Kota.', NULL),
  ('STU-005', '0051234505', NULL, 'Daffa Farhan Al-Ghazali', 'XII MIPA 1', 'Laki-Laki', 'daffa.farhan@siswa.belajar.id', 'Bpk. Ahmad Farhan', '081234567805', 'Jl. Gatot Subroto No. 19, Jakarta', 'Disiplin dan selalu hadir tepat waktu.', NULL),
  ('STU-006', '0051234506', NULL, 'Eka Putri Maharani', 'XII MIPA 2', 'Perempuan', 'eka.putri@siswa.belajar.id', 'Ibu Maharani', '081234567806', 'Jl. Anggrek No. 34, Jakarta', 'Aktif dalam kegiatan ekstrakurikuler PMR.', NULL),
  ('STU-007', '0051234507', NULL, 'Fajar Nugraha', 'XII MIPA 2', 'Laki-Laki', 'fajar.nugraha@siswa.belajar.id', 'Bpk. Herman Nugraha', '081234567807', 'Jl. Flamboyan No. 12, Jakarta', 'Sering alpa tanpa keterangan pada minggu lalu.', NULL),
  ('STU-008', '0051234508', NULL, 'Gita Gutawa Putri', 'XI MIPA 1', 'Perempuan', 'gita.gutawa@siswa.belajar.id', 'Bpk. Erwin Gutawa', '081234567808', 'Jl. Cempaka No. 90, Jakarta', 'Bakat tinggi di bidang seni & matematika.', NULL),
  ('STU-009', '0051234509', NULL, 'Hafiz Ibnu Sina', 'XI MIPA 1', 'Laki-Laki', 'hafiz.sina@siswa.belajar.id', 'Bpk. Lukman Sina', '081234567809', 'Jl. Diponegoro No. 23, Jakarta', 'Memiliki logika pemecahan masalah matematika sangat baik.', NULL),
  ('STU-010', '0051234510', NULL, 'Intan Nuraini', 'X MIPA 1', 'Perempuan', 'intan.nuraini@siswa.belajar.id', 'Ibu Nuraini', '081234567810', 'Jl. Veteran No. 56, Jakarta', 'Siswa baru berprestasi lulusan SMPN 1.', NULL)
ON CONFLICT (id) DO NOTHING;

-- Penilaian / Grades (10 Siswa — trigger auto-calc nilai_akhir)
INSERT INTO public.grades (student_id, nama, kelas, mapel, tugas1, tugas2, uh, uts, uas, catatan_ai) VALUES
  ('STU-001', 'Ahmad Rizky Pratama', 'XII MIPA 1', 'Matematika Peminatan', 88, 90, 85, 92, 90, 'Penguasaan konsep kalkulus dan turunan fungsi sangat unggul. Tingkatkan konsistensi dalam latihan soal kompleks.'),
  ('STU-002', 'Anisa Rahmawati', 'XII MIPA 1', 'Matematika Peminatan', 95, 96, 92, 95, 94, 'Sangat luar biasa! Pemahaman teori dan penyelesaian masalah matematika sangat presisi.'),
  ('STU-003', 'Bagus Setyo Nugroho', 'XII MIPA 1', 'Matematika Peminatan', 70, 75, 68, 72, 70, 'Perlu pengayaan ulang pada dasar-dasar trigonometri dan turunan. Disarankan mengikuti tutor sebaya.'),
  ('STU-004', 'Citra Dewi Lestari', 'XII MIPA 1', 'Matematika Peminatan', 92, 90, 94, 90, 93, 'Daya analisis sangat tajam. Mampu menerapkan rumus turunan pada soal cerita fisika matematika.'),
  ('STU-005', 'Daffa Farhan Al-Ghazali', 'XII MIPA 1', 'Matematika Peminatan', 85, 88, 84, 86, 88, 'Capaian hasil belajar sangat baik dan stabil. Siap melanjutkan ke bab vektor dan matriks.'),
  ('STU-006', 'Eka Putri Maharani', 'XII MIPA 2', 'Matematika Peminatan', 80, 82, 85, 83, 81, 'Hasil pengerjaan tugas sangat baik. Pertahankan fokus saat ujian semester.'),
  ('STU-007', 'Fajar Nugraha', 'XII MIPA 2', 'Matematika Peminatan', 65, 60, 62, 64, 60, 'Memerlukan remedial khusus dan pendampingan hadir di kelas. Berikan tugas perbaikan mandiri.'),
  ('STU-008', 'Gita Gutawa Putri', 'XI MIPA 1', 'Matematika Peminatan', 90, 92, 88, 90, 91, 'Sangat aktif di kelas dan menunjukkan logika yang terstruktur dengan rapi.'),
  ('STU-009', 'Hafiz Ibnu Sina', 'XI MIPA 1', 'Matematika Peminatan', 88, 85, 90, 89, 87, 'Kemampuan eksplorasi mandiri amat baik. Pertahankan performa positif ini.'),
  ('STU-010', 'Intan Nuraini', 'X MIPA 1', 'Matematika Peminatan', 92, 95, 91, 93, 92, 'Prestasi gemilang sebagai siswa baru. Mampu beradaptasi cepat dengan tingkat kesulitan soal.')
ON CONFLICT (student_id, mapel) DO NOTHING;

-- Jadwal Mengajar (7 Jadwal)
INSERT INTO public.teaching_schedules (id, teacher_username, hari, jam, kelas, mapel, ruangan, topik, status) VALUES
  ('SCH-001', 'walikelas1', 'Senin', '07:30 - 09:00', 'XII MIPA 1', 'Matematika Peminatan', 'Lab Mat 1', 'Turunan Fungsi Trigonometri', 'Selesai'),
  ('SCH-002', 'walikelas1', 'Senin', '10:00 - 11:30', 'XII MIPA 2', 'Matematika Peminatan', 'Ruang 12B', 'Vektor & Proyeksi 3D', 'Selesai'),
  ('SCH-003', 'walikelas1', 'Selasa', '08:15 - 09:45', 'XI MIPA 1', 'Matematika Wajib', 'Ruang 11A', 'Statistika & Distribusi', 'Belum Dimulai'),
  ('SCH-004', 'walikelas1', 'Selasa', '10:15 - 11:45', 'X MIPA 1', 'Fisika Dasar', 'Ruang 10C', 'Vektor Posisi & Kecepatan', 'Belum Dimulai'),
  ('SCH-005', 'walikelas1', 'Rabu', '07:30 - 09:00', 'XII MIPA 1', 'Matematika Peminatan', 'Lab Mat 1', 'Latihan Turunan Implisit', 'Belum Dimulai'),
  ('SCH-006', 'walikelas1', 'Kamis', '09:00 - 10:30', 'XII MIPA 2', 'Matematika Peminatan', 'Ruang 12B', 'Kuis Bab 2', 'Belum Dimulai'),
  ('SCH-007', 'walikelas1', 'Jumat', '08:00 - 09:30', 'XI MIPA 1', 'Matematika Wajib', 'Ruang 11A', 'Pembahasan Tugas Mandiri', 'Belum Dimulai')
ON CONFLICT (id) DO NOTHING;

-- Bank Modul & RPP (3 Dokumen)
INSERT INTO public.lesson_plans (id, teacher_username, judul, kelas, mapel, fase, kurikulum, alokasi_waktu, penulis, tanggal, format, ringkasan, tujuan, langkah, file_url, status) VALUES
  ('RPP-001', 'walikelas1',
    'RPP Modul Ajar — Turunan Fungsi Trigonometri & Kalkulus',
    'XII MIPA 1', 'Matematika Peminatan', 'Fase F', 'Kurikulum Merdeka',
    '4 JP (2 x Pertemuan)', 'Pak Budi, S.Pd', '20 Jul 2026', 'PDF / DOCX',
    'Menguraikan penerapan turunan fungsi trigonometri pada permasalahan kecepatan spasial dan optimasi fungsi.',
    'Siswa mampu menentukan turunan pertama fungsi sinus dan kosinus serta menerapkannya dalam soal cerita fisika.',
    '["Kegiatan Awal (15 menit): Apersepsi grafik fungsi sinus dan pengenalan kemiringan garis singgung.", "Kegiatan Inti (60 menit): Eksplorasi rumus turunan dengan konsep limit dan diskusi kelompok pemecahan masalah.", "Kegiatan Penutup (15 menit): Refleksi mandiri dan pengerjaan kuis formatik 3 soal."]'::jsonb,
    '/docs/rpp_turunan.pdf', 'Terverifikasi'),
  ('RPP-002', 'walikelas1',
    'Modul Pembelajaran Interaktif — Vektor & Matriks Tiga Dimensi',
    'XII MIPA 2', 'Matematika Peminatan', 'Fase F', 'Kurikulum Merdeka',
    '6 JP (3 x Pertemuan)', 'Pak Budi, S.Pd', '18 Jul 2026', 'PDF',
    'Panduan belajar mandiri siswa untuk memahami operasi penjumlahan, perkalian skalar, dan proyeksi ortogonal vektor.',
    'Siswa dapat menghitung panjang vektor dan sudut antara dua vektor dalam ruang 3D.',
    '["Kegiatan Awal (10 menit): Demostrasi alat peraga spasial 3D.", "Kegiatan Inti (65 menit): Latihan komputasi dot product dan perkalian silang vektor.", "Kegiatan Penutup (15 menit): Rangkuman rumus utama."]'::jsonb,
    '/docs/modul_vektor.pdf', 'Terverifikasi'),
  ('RPP-003', 'walikelas1',
    'RPP Diferensiasi — Statistika & Distribusi Normal',
    'XI MIPA 1', 'Matematika Wajib', 'Fase E', 'K13 Revisi',
    '4 JP (2 x Pertemuan)', 'Pak Budi, S.Pd', '10 Jul 2026', 'DOCX',
    'Rencana pembelajaran diferensiasi produk untuk materi pemusatan data dan simpangan baku.',
    'Siswa dapat mengolah data kelompok ke dalam tabel distribusi frekuensi dan histogram.',
    '["Kegiatan Awal (15 menit): Pengumpulan data tinggi badan siswa di kelas.", "Kegiatan Inti (60 menit): Penyusunan tabel frekuensi dan perhitungan nilai rata-rata gabungan.", "Kegiatan Penutup (15 menit): Evaluasi antar teman."]'::jsonb,
    '/docs/rpp_statistika.pdf', 'Terverifikasi')
ON CONFLICT (id) DO NOTHING;

-- Analisis Kelas (4 Kelas)
INSERT INTO public.class_analytics (id, kelas, rata_rata_kelas, ketuntasan_persen, jumlah_siswa, jumlah_tuntas, jumlah_remedial, catatan_ai) VALUES
  ('ANL-001', 'XII MIPA 1', 86.48, 80.00, 5, 4, 1, 'Tingkat ketuntasan kumulatif kelas berada pada kategori baik. Diperlukan pendampingan khusus untuk 1 siswa pada materi turunan rantai.'),
  ('ANL-002', 'XII MIPA 2', 72.60, 50.00, 2, 1, 1, 'Perlu peningkatan signifikan. 1 dari 2 siswa membutuhkan remedial.'),
  ('ANL-003', 'XI MIPA 1', 89.05, 100.00, 2, 2, 0, 'Seluruh siswa mencapai KKM. Pertahankan capaian ini dan berikan pengayaan materi.'),
  ('ANL-004', 'X MIPA 1', 92.50, 100.00, 1, 1, 0, 'Siswa menunjukkan performa sangat baik. Siap untuk materi tingkat lanjut.')
ON CONFLICT (kelas) DO NOTHING;

-- Pengaturan Sekolah (4 Guru)
INSERT INTO public.school_settings (teacher_username, nama_sekolah, tahun_ajaran, kkm_default, kurikulum, ai_model, auto_wa_alert) VALUES
  ('walikelas1', 'SMA Negeri 1 Jakarta', '2026/2027 (Semester Ganjil)', 75, 'Kurikulum Merdeka', 'Gemini 3.6 Pro (Fast & Accurate)', true),
  ('walikelas2', 'SMA Negeri 1 Jakarta', '2026/2027 (Semester Ganjil)', 75, 'Kurikulum Merdeka', 'Gemini 3.6 Pro (Fast & Accurate)', true),
  ('walikelas3', 'SMA Negeri 1 Jakarta', '2026/2027 (Semester Ganjil)', 75, 'Kurikulum Merdeka', 'Gemini 3.6 Pro (Fast & Accurate)', true),
  ('walikelas4', 'SMA Negeri 1 Jakarta', '2026/2027 (Semester Ganjil)', 75, 'Kurikulum Merdeka', 'Gemini 3.6 Pro (Fast & Accurate)', true)
ON CONFLICT (teacher_username) DO NOTHING;


-- =========================================================
-- LANGKAH 5: AKTIFKAN ROW LEVEL SECURITY (RLS)
-- =========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_recap ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teaching_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;


-- =========================================================
-- LANGKAH 6: BUAT RLS POLICIES UNTUK ANON & AUTHENTICATED
-- =========================================================

-- PROFILES
DROP POLICY IF EXISTS "Allow anon select profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow anon insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow anon update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow anon delete profiles" ON public.profiles;
CREATE POLICY "Allow anon select profiles" ON public.profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anon insert profiles" ON public.profiles FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon update profiles" ON public.profiles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete profiles" ON public.profiles FOR DELETE TO anon, authenticated USING (true);

-- STUDENTS
DROP POLICY IF EXISTS "Allow anon select students" ON public.students;
DROP POLICY IF EXISTS "Allow anon insert students" ON public.students;
DROP POLICY IF EXISTS "Allow anon update students" ON public.students;
DROP POLICY IF EXISTS "Allow anon delete students" ON public.students;
CREATE POLICY "Allow anon select students" ON public.students FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anon insert students" ON public.students FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon update students" ON public.students FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete students" ON public.students FOR DELETE TO anon, authenticated USING (true);

-- DAILY_ATTENDANCES
DROP POLICY IF EXISTS "Allow anon select daily_attendances" ON public.daily_attendances;
DROP POLICY IF EXISTS "Allow anon insert daily_attendances" ON public.daily_attendances;
DROP POLICY IF EXISTS "Allow anon update daily_attendances" ON public.daily_attendances;
DROP POLICY IF EXISTS "Allow anon delete daily_attendances" ON public.daily_attendances;
CREATE POLICY "Allow anon select daily_attendances" ON public.daily_attendances FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anon insert daily_attendances" ON public.daily_attendances FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon update daily_attendances" ON public.daily_attendances FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete daily_attendances" ON public.daily_attendances FOR DELETE TO anon, authenticated USING (true);

-- ATTENDANCE_RECAP
DROP POLICY IF EXISTS "Allow anon select attendance_recap" ON public.attendance_recap;
DROP POLICY IF EXISTS "Allow anon insert attendance_recap" ON public.attendance_recap;
DROP POLICY IF EXISTS "Allow anon update attendance_recap" ON public.attendance_recap;
DROP POLICY IF EXISTS "Allow anon delete attendance_recap" ON public.attendance_recap;
CREATE POLICY "Allow anon select attendance_recap" ON public.attendance_recap FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anon insert attendance_recap" ON public.attendance_recap FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon update attendance_recap" ON public.attendance_recap FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete attendance_recap" ON public.attendance_recap FOR DELETE TO anon, authenticated USING (true);

-- GRADES
DROP POLICY IF EXISTS "Allow anon select grades" ON public.grades;
DROP POLICY IF EXISTS "Allow anon insert grades" ON public.grades;
DROP POLICY IF EXISTS "Allow anon update grades" ON public.grades;
DROP POLICY IF EXISTS "Allow anon delete grades" ON public.grades;
CREATE POLICY "Allow anon select grades" ON public.grades FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anon insert grades" ON public.grades FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon update grades" ON public.grades FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete grades" ON public.grades FOR DELETE TO anon, authenticated USING (true);

-- TEACHING_SCHEDULES
DROP POLICY IF EXISTS "Allow anon select teaching_schedules" ON public.teaching_schedules;
DROP POLICY IF EXISTS "Allow anon insert teaching_schedules" ON public.teaching_schedules;
DROP POLICY IF EXISTS "Allow anon update teaching_schedules" ON public.teaching_schedules;
DROP POLICY IF EXISTS "Allow anon delete teaching_schedules" ON public.teaching_schedules;
CREATE POLICY "Allow anon select teaching_schedules" ON public.teaching_schedules FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anon insert teaching_schedules" ON public.teaching_schedules FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon update teaching_schedules" ON public.teaching_schedules FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete teaching_schedules" ON public.teaching_schedules FOR DELETE TO anon, authenticated USING (true);

-- LESSON_PLANS
DROP POLICY IF EXISTS "Allow anon select lesson_plans" ON public.lesson_plans;
DROP POLICY IF EXISTS "Allow anon insert lesson_plans" ON public.lesson_plans;
DROP POLICY IF EXISTS "Allow anon update lesson_plans" ON public.lesson_plans;
DROP POLICY IF EXISTS "Allow anon delete lesson_plans" ON public.lesson_plans;
CREATE POLICY "Allow anon select lesson_plans" ON public.lesson_plans FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anon insert lesson_plans" ON public.lesson_plans FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon update lesson_plans" ON public.lesson_plans FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete lesson_plans" ON public.lesson_plans FOR DELETE TO anon, authenticated USING (true);

-- CLASS_ANALYTICS
DROP POLICY IF EXISTS "Allow anon select class_analytics" ON public.class_analytics;
DROP POLICY IF EXISTS "Allow anon insert class_analytics" ON public.class_analytics;
DROP POLICY IF EXISTS "Allow anon update class_analytics" ON public.class_analytics;
DROP POLICY IF EXISTS "Allow anon delete class_analytics" ON public.class_analytics;
CREATE POLICY "Allow anon select class_analytics" ON public.class_analytics FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anon insert class_analytics" ON public.class_analytics FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon update class_analytics" ON public.class_analytics FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete class_analytics" ON public.class_analytics FOR DELETE TO anon, authenticated USING (true);

-- SCHOOL_SETTINGS
DROP POLICY IF EXISTS "Allow anon select school_settings" ON public.school_settings;
DROP POLICY IF EXISTS "Allow anon insert school_settings" ON public.school_settings;
DROP POLICY IF EXISTS "Allow anon update school_settings" ON public.school_settings;
DROP POLICY IF EXISTS "Allow anon delete school_settings" ON public.school_settings;
CREATE POLICY "Allow anon select school_settings" ON public.school_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anon insert school_settings" ON public.school_settings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon update school_settings" ON public.school_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete school_settings" ON public.school_settings FOR DELETE TO anon, authenticated USING (true);


-- =========================================================
-- LANGKAH 7: GRANT PERMISSIONS KE ROLE anon & authenticated
-- =========================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_attendances TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance_recap TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.grades TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teaching_schedules TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_plans TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_analytics TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.school_settings TO anon, authenticated;

-- Grant akses ke sequences (untuk BIGINT GENERATED ALWAYS AS IDENTITY)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;


-- =========================================================
-- SELESAI! Schema siap digunakan.
-- Buka aplikasi dan login dengan:
--   Username: walikelas1  |  Password: 123456
--   Username: walikelas2  |  Password: 123456
--   Username: walikelas3  |  Password: 123456
--   Username: walikelas4  |  Password: 123456
-- =========================================================
