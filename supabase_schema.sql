-- =========================================================
-- SKEMA BASIS DATA SUPABASE UNTUK DIGITAL GURU (WALI KELAS)
-- LENGKAP 9 TABEL + TRIGGER + INDEXES
-- TERHUBUNG DENGAN SELURUH MENU APLIKASI:
--   1. Login & Register       → profiles
--   2. Dashboard               → profiles, students, attendance_recap, grades
--   3. Data Siswa              → students
--   4. Absensi Harian          → daily_attendances
--   5. Rekap Absensi Siswa     → attendance_recap (auto-update via trigger)
--   6. Penilaian Siswa         → grades (+ mapel, catatan_ai)
--   7. Chat Asisten AI         → profiles, students, attendance_recap, grades
--   8. Analisis Kelas          → class_analytics
--   9. Bank Modul & RPP        → lesson_plans (+ kurikulum, alokasi_waktu, dll)
--  10. Jadwal Mengajar         → teaching_schedules
--  11. Pengaturan              → profiles, school_settings
-- =========================================================


-- =========================================================
-- DROP EXISTING (untuk fresh install / reset)
-- =========================================================
DROP TRIGGER IF EXISTS trg_update_attendance_recap ON public.daily_attendances;
DROP TRIGGER IF EXISTS trg_auto_calc_grades ON public.grades;
DROP FUNCTION IF EXISTS public.fn_update_attendance_recap();
DROP FUNCTION IF EXISTS public.fn_auto_calc_grades();

DROP TABLE IF EXISTS public.school_settings CASCADE;
DROP TABLE IF EXISTS public.class_analytics CASCADE;
DROP TABLE IF EXISTS public.lesson_plans CASCADE;
DROP TABLE IF EXISTS public.teaching_schedules CASCADE;
DROP TABLE IF EXISTS public.grades CASCADE;
DROP TABLE IF EXISTS public.attendance_recap CASCADE;
DROP TABLE IF EXISTS public.daily_attendances CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;


-- =========================================================
-- 1. TABEL PROFIL WALI KELAS (PROFILES)
--    Menu: Login & Register, Dashboard, Pengaturan, Chat AI
-- =========================================================
CREATE TABLE public.profiles (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nama VARCHAR(100) NOT NULL,
  nip VARCHAR(50),
  kelas_binaan VARCHAR(50) NOT NULL,
  role VARCHAR(50) DEFAULT 'Wali Kelas',
  email VARCHAR(100),
  phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =========================================================
-- 2. TABEL DATA MASTER SISWA (STUDENTS)
--    Menu: Data Siswa, Dashboard, Absensi, Penilaian, Chat AI
-- =========================================================
CREATE TABLE public.students (
  id VARCHAR(50) PRIMARY KEY,
  nisn VARCHAR(50) UNIQUE NOT NULL,
  nama VARCHAR(100) NOT NULL,
  kelas VARCHAR(50) NOT NULL,
  gender VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'Aktif',
  email VARCHAR(100),
  nama_ortu VARCHAR(100),
  phone_ortu VARCHAR(50),
  alamat TEXT,
  catatan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_students_kelas ON public.students(kelas);
CREATE INDEX idx_students_status ON public.students(status);


-- =========================================================
-- 3. TABEL PRESENSI HARIAN (DAILY_ATTENDANCES)
--    Menu: Absensi Harian (QR Scanner + Manual Input)
-- =========================================================
CREATE TABLE public.daily_attendances (
  id BIGSERIAL PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  kelas VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('Hadir', 'Sakit', 'Izin', 'Alpa')),
  catatan TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_student_date UNIQUE (student_id, date)
);

CREATE INDEX idx_daily_att_date ON public.daily_attendances(date);
CREATE INDEX idx_daily_att_student ON public.daily_attendances(student_id);
CREATE INDEX idx_daily_att_kelas ON public.daily_attendances(kelas);


-- =========================================================
-- 4. TABEL REKAPITULASI ABSENSI (ATTENDANCE_RECAP)
--    Menu: Rekap Absensi Siswa, Dashboard, Chat AI
--    Auto-updated via trigger dari daily_attendances
-- =========================================================
CREATE TABLE public.attendance_recap (
  student_id VARCHAR(50) PRIMARY KEY REFERENCES public.students(id) ON DELETE CASCADE,
  nama VARCHAR(100) NOT NULL,
  kelas VARCHAR(50) NOT NULL,
  hadir INT DEFAULT 0,
  sakit INT DEFAULT 0,
  izin INT DEFAULT 0,
  alpa INT DEFAULT 0,
  persentase DECIMAL(5,2) DEFAULT 100.00
);

CREATE INDEX idx_recap_kelas ON public.attendance_recap(kelas);


-- =========================================================
-- 5. TABEL PENILAIAN SISWA (GRADES)
--    Menu: Penilaian Siswa, Dashboard, Chat AI, Analisis Kelas
--    Ditambahkan: mapel, catatan_ai (digunakan oleh PenilaianView)
-- =========================================================
CREATE TABLE public.grades (
  id BIGSERIAL PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  nama VARCHAR(100) NOT NULL,
  kelas VARCHAR(50) NOT NULL,
  mapel VARCHAR(100) NOT NULL DEFAULT 'Matematika Peminatan',
  tugas1 DECIMAL(5,2) DEFAULT 0,
  tugas2 DECIMAL(5,2) DEFAULT 0,
  uh DECIMAL(5,2) DEFAULT 0,
  uts DECIMAL(5,2) DEFAULT 0,
  uas DECIMAL(5,2) DEFAULT 0,
  nilai_akhir DECIMAL(5,2) DEFAULT 0,
  predikat VARCHAR(5) DEFAULT 'C',
  status VARCHAR(20) DEFAULT 'Remedial',
  catatan_ai TEXT,
  CONSTRAINT unique_student_mapel UNIQUE (student_id, mapel)
);

CREATE INDEX idx_grades_kelas ON public.grades(kelas);
CREATE INDEX idx_grades_mapel ON public.grades(mapel);
CREATE INDEX idx_grades_student ON public.grades(student_id);


-- =========================================================
-- 6. TABEL JADWAL MENGAJAR (TEACHING_SCHEDULES)
--    Menu: Jadwal Mengajar
--    Kolom 'ruangan' sesuai dengan mapping di supabase.js
-- =========================================================
CREATE TABLE public.teaching_schedules (
  id VARCHAR(50) PRIMARY KEY,
  teacher_username VARCHAR(50),
  hari VARCHAR(20) NOT NULL,
  jam VARCHAR(50) NOT NULL,
  kelas VARCHAR(50) NOT NULL,
  mapel VARCHAR(100) NOT NULL,
  ruangan VARCHAR(50) NOT NULL,
  topik TEXT NOT NULL,
  status VARCHAR(30) DEFAULT 'Belum Dimulai',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_schedules_teacher ON public.teaching_schedules(teacher_username);
CREATE INDEX idx_schedules_hari ON public.teaching_schedules(hari);
CREATE INDEX idx_schedules_kelas ON public.teaching_schedules(kelas);


-- =========================================================
-- 7. TABEL BANK MODUL & RPP (LESSON_PLANS)
--    Menu: Bank Modul & RPP
--    Ditambahkan: kurikulum, alokasi_waktu, penulis, tanggal,
--    format, tujuan, langkah (digunakan oleh BankModulRppView)
-- =========================================================
CREATE TABLE public.lesson_plans (
  id VARCHAR(50) PRIMARY KEY,
  teacher_username VARCHAR(50),
  judul VARCHAR(255) NOT NULL,
  kelas VARCHAR(50) NOT NULL,
  mapel VARCHAR(100) NOT NULL,
  fase VARCHAR(20) DEFAULT 'Fase F',
  kurikulum VARCHAR(50) DEFAULT 'Kurikulum Merdeka',
  alokasi_waktu VARCHAR(100),
  penulis VARCHAR(100),
  tanggal VARCHAR(50),
  format VARCHAR(50) DEFAULT 'PDF',
  ringkasan TEXT,
  tujuan TEXT,
  langkah JSONB,
  file_url TEXT,
  status VARCHAR(30) DEFAULT 'Terverifikasi',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lesson_teacher ON public.lesson_plans(teacher_username);
CREATE INDEX idx_lesson_kelas ON public.lesson_plans(kelas);
CREATE INDEX idx_lesson_mapel ON public.lesson_plans(mapel);


-- =========================================================
-- 8. TABEL ANALISIS KELAS (CLASS_ANALYTICS)
--    Menu: Analisis Kelas
-- =========================================================
CREATE TABLE public.class_analytics (
  id VARCHAR(50) PRIMARY KEY,
  kelas VARCHAR(50) NOT NULL UNIQUE,
  rata_rata_kelas DECIMAL(5,2) DEFAULT 0.00,
  ketuntasan_persen DECIMAL(5,2) DEFAULT 0.00,
  jumlah_siswa INT DEFAULT 0,
  jumlah_tuntas INT DEFAULT 0,
  jumlah_remedial INT DEFAULT 0,
  catatan_ai TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =========================================================
-- 9. TABEL PENGATURAN SEKOLAH (SCHOOL_SETTINGS)
--    Menu: Pengaturan (menyimpan konfigurasi per guru)
-- =========================================================
CREATE TABLE public.school_settings (
  id BIGSERIAL PRIMARY KEY,
  teacher_username VARCHAR(50) UNIQUE NOT NULL,
  nama_sekolah VARCHAR(255) DEFAULT 'SMA Negeri 1 Jakarta',
  tahun_ajaran VARCHAR(100) DEFAULT '2026/2027 (Semester Ganjil)',
  kkm_default INT DEFAULT 75,
  kurikulum VARCHAR(50) DEFAULT 'Kurikulum Merdeka',
  ai_model VARCHAR(100) DEFAULT 'Gemini 3.6 Pro (Fast & Accurate)',
  auto_wa_alert BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =========================================================
-- TRIGGER: AUTO-UPDATE ATTENDANCE RECAP
-- Setiap kali data daily_attendances berubah, rekap otomatis
-- dihitung ulang untuk siswa yang bersangkutan.
-- =========================================================
CREATE OR REPLACE FUNCTION public.fn_update_attendance_recap()
RETURNS TRIGGER AS $$
DECLARE
  v_student_id VARCHAR(50);
  v_nama VARCHAR(100);
  v_kelas VARCHAR(50);
  v_hadir INT;
  v_sakit INT;
  v_izin INT;
  v_alpa INT;
  v_total INT;
  v_persentase DECIMAL(5,2);
BEGIN
  -- Ambil student_id dari record yang berubah
  IF TG_OP = 'DELETE' THEN
    v_student_id := OLD.student_id;
  ELSE
    v_student_id := NEW.student_id;
  END IF;

  -- Ambil data siswa
  SELECT nama, kelas INTO v_nama, v_kelas
  FROM public.students WHERE id = v_student_id;

  -- Hitung rekap
  SELECT
    COALESCE(SUM(CASE WHEN status = 'Hadir' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN status = 'Sakit' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN status = 'Izin' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN status = 'Alpa' THEN 1 ELSE 0 END), 0),
    COUNT(*)
  INTO v_hadir, v_sakit, v_izin, v_alpa, v_total
  FROM public.daily_attendances
  WHERE student_id = v_student_id;

  -- Hitung persentase kehadiran
  IF v_total > 0 THEN
    v_persentase := ROUND((v_hadir::DECIMAL / v_total) * 100, 2);
  ELSE
    v_persentase := 100.00;
  END IF;

  -- Upsert ke attendance_recap
  INSERT INTO public.attendance_recap (student_id, nama, kelas, hadir, sakit, izin, alpa, persentase)
  VALUES (v_student_id, v_nama, v_kelas, v_hadir, v_sakit, v_izin, v_alpa, v_persentase)
  ON CONFLICT (student_id) DO UPDATE SET
    nama = EXCLUDED.nama,
    kelas = EXCLUDED.kelas,
    hadir = EXCLUDED.hadir,
    sakit = EXCLUDED.sakit,
    izin = EXCLUDED.izin,
    alpa = EXCLUDED.alpa,
    persentase = EXCLUDED.persentase;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_attendance_recap
AFTER INSERT OR UPDATE OR DELETE ON public.daily_attendances
FOR EACH ROW EXECUTE FUNCTION public.fn_update_attendance_recap();


-- =========================================================
-- TRIGGER: AUTO-CALC NILAI AKHIR & PREDIKAT
-- Formula: (tugas1*15% + tugas2*15% + uh*20% + uts*25% + uas*25%)
-- Predikat: A (>=88), B (>=75), C (>=60), D (<60)
-- Status: Tuntas jika nilai_akhir >= KKM (75)
-- =========================================================
CREATE OR REPLACE FUNCTION public.fn_auto_calc_grades()
RETURNS TRIGGER AS $$
DECLARE
  v_nilai DECIMAL(5,2);
  v_pred VARCHAR(5);
  v_stat VARCHAR(20);
BEGIN
  -- Hitung nilai akhir dengan bobot
  v_nilai := ROUND(
    (NEW.tugas1 * 0.15) +
    (NEW.tugas2 * 0.15) +
    (NEW.uh * 0.20) +
    (NEW.uts * 0.25) +
    (NEW.uas * 0.25),
  2);

  -- Tentukan predikat
  IF v_nilai >= 88 THEN v_pred := 'A';
  ELSIF v_nilai >= 75 THEN v_pred := 'B';
  ELSIF v_nilai >= 60 THEN v_pred := 'C';
  ELSE v_pred := 'D';
  END IF;

  -- Tentukan status ketuntasan (KKM = 75)
  IF v_nilai >= 75 THEN v_stat := 'Tuntas';
  ELSE v_stat := 'Remedial';
  END IF;

  NEW.nilai_akhir := v_nilai;
  NEW.predikat := v_pred;
  NEW.status := v_stat;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_calc_grades
BEFORE INSERT OR UPDATE ON public.grades
FOR EACH ROW EXECUTE FUNCTION public.fn_auto_calc_grades();


-- =========================================================
-- DATA DEMO LENGKAP — 4 PROFIL WALI KELAS
-- (sesuai userAccounts.js)
-- =========================================================
INSERT INTO public.profiles (id, username, password, nama, nip, kelas_binaan, email, phone) VALUES
('USR-001', 'walikelas1', '123456', 'Pak Budi, S.Pd', '19850412 201001 1 008', 'XII MIPA 1', 'budi.matematika@sekolah.sch.id', '081234567890'),
('USR-002', 'walikelas2', '123456', 'Ibu Siti Rahmah, M.Pd', '19870820 201202 2 015', 'XII MIPA 2', 'siti.rahmah@sekolah.sch.id', '081234567891'),
('USR-003', 'walikelas3', '123456', 'Bpk. Agus Santoso, S.Si', '19830514 200801 1 004', 'XI MIPA 1', 'agus.santoso@sekolah.sch.id', '081234567892'),
('USR-004', 'walikelas4', '123456', 'Ibu Dewi Lestari, S.Pd', '19900311 201503 2 009', 'X MIPA 1', 'dewi.lestari@sekolah.sch.id', '081234567893')
ON CONFLICT (username) DO NOTHING;


-- =========================================================
-- DATA DEMO LENGKAP — 10 SISWA SEMUA KELAS
-- (sesuai initialData.js)
-- =========================================================
INSERT INTO public.students (id, nisn, nama, kelas, gender, email, nama_ortu, phone_ortu, alamat, catatan) VALUES
('STU-001', '0012345688', 'Ahmad Rizky Pratama', 'XII MIPA 1', 'Laki-Laki', 'rizky.pratama@siswa.belajar.id', 'Bpk. Hendra Pratama', '081234567801', 'Jl. Merdeka No. 12, Jakarta', 'Aktif dalam diskusi matematika, ketua OSIS.'),
('STU-002', '3184861266', 'Anisa Rahmawati', 'XII MIPA 1', 'Perempuan', 'anisa.rahma@siswa.belajar.id', 'Ibu Kurniawati', '081234567802', 'Jl. Melati No. 45, Jakarta', 'Sangat teliti dalam pengerjaan tugas matematika.'),
('STU-003', '0051234503', 'Bagus Setyo Nugroho', 'XII MIPA 1', 'Laki-Laki', 'bagus.setyo@siswa.belajar.id', 'Bpk. Tri Nugroho', '081234567803', 'Jl. Mawar Gg. 3 No. 8, Jakarta', 'Perlu bimbingan ekstra pada materi kalkulus.'),
('STU-004', '0051234504', 'Citra Dewi Lestari', 'XII MIPA 1', 'Perempuan', 'citra.dewi@siswa.belajar.id', 'Ibu Rahayu Lestari', '081234567804', 'Jl. Sudirman No. 88, Jakarta', 'Juara 2 Olimpiade Fisika tingkat Kota.'),
('STU-005', '0051234505', 'Daffa Farhan Al-Ghazali', 'XII MIPA 1', 'Laki-Laki', 'daffa.farhan@siswa.belajar.id', 'Bpk. Ahmad Farhan', '081234567805', 'Jl. Gatot Subroto No. 19, Jakarta', 'Disiplin dan selalu hadir tepat waktu.'),
('STU-006', '0051234506', 'Eka Putri Maharani', 'XII MIPA 2', 'Perempuan', 'eka.putri@siswa.belajar.id', 'Ibu Maharani', '081234567806', 'Jl. Anggrek No. 34, Jakarta', 'Aktif dalam kegiatan ekstrakurikuler PMR.'),
('STU-007', '0051234507', 'Fajar Nugraha', 'XII MIPA 2', 'Laki-Laki', 'fajar.nugraha@siswa.belajar.id', 'Bpk. Herman Nugraha', '081234567807', 'Jl. Flamboyan No. 12, Jakarta', 'Sering alpa tanpa keterangan pada minggu lalu.'),
('STU-008', '0051234508', 'Gita Gutawa Putri', 'XI MIPA 1', 'Perempuan', 'gita.gutawa@siswa.belajar.id', 'Bpk. Erwin Gutawa', '081234567808', 'Jl. Cempaka No. 90, Jakarta', 'Bakat tinggi di bidang seni & matematika.'),
('STU-009', '0051234509', 'Hafiz Ibnu Sina', 'XI MIPA 1', 'Laki-Laki', 'hafiz.sina@siswa.belajar.id', 'Bpk. Lukman Sina', '081234567809', 'Jl. Diponegoro No. 23, Jakarta', 'Memiliki logika pemecahan masalah matematika sangat baik.'),
('STU-010', '0051234510', 'Intan Nuraini', 'X MIPA 1', 'Perempuan', 'intan.nuraini@siswa.belajar.id', 'Ibu Nuraini', '081234567810', 'Jl. Veteran No. 56, Jakarta', 'Siswa baru berprestasi lulusan SMPN 1.')
ON CONFLICT (id) DO NOTHING;


-- =========================================================
-- DATA DEMO — REKAP ABSENSI (10 SISWA)
-- (sesuai initialData.js INITIAL_ATTENDANCE_RECAP)
-- =========================================================
INSERT INTO public.attendance_recap (student_id, nama, kelas, hadir, sakit, izin, alpa, persentase) VALUES
('STU-001', 'Ahmad Rizky Pratama', 'XII MIPA 1', 38, 1, 1, 0, 95.00),
('STU-002', 'Anisa Rahmawati', 'XII MIPA 1', 40, 0, 0, 0, 100.00),
('STU-003', 'Bagus Setyo Nugroho', 'XII MIPA 1', 35, 2, 2, 1, 87.50),
('STU-004', 'Citra Dewi Lestari', 'XII MIPA 1', 39, 1, 0, 0, 97.50),
('STU-005', 'Daffa Farhan Al-Ghazali', 'XII MIPA 1', 40, 0, 0, 0, 100.00),
('STU-006', 'Eka Putri Maharani', 'XII MIPA 2', 37, 2, 1, 0, 92.50),
('STU-007', 'Fajar Nugraha', 'XII MIPA 2', 30, 3, 2, 5, 75.00),
('STU-008', 'Gita Gutawa Putri', 'XI MIPA 1', 39, 1, 0, 0, 97.50),
('STU-009', 'Hafiz Ibnu Sina', 'XI MIPA 1', 38, 2, 0, 0, 95.00),
('STU-010', 'Intan Nuraini', 'X MIPA 1', 40, 0, 0, 0, 100.00)
ON CONFLICT (student_id) DO NOTHING;


-- =========================================================
-- DATA DEMO — PENILAIAN / GRADES (10 SISWA)
-- (sesuai initialData.js INITIAL_GRADES, + mapel & catatan_ai)
-- Trigger akan otomatis menghitung nilai_akhir, predikat, status
-- =========================================================
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


-- =========================================================
-- DATA DEMO — JADWAL MENGAJAR (7 JADWAL)
-- (sesuai JadwalMengajarView initialSchedules)
-- =========================================================
INSERT INTO public.teaching_schedules (id, teacher_username, hari, jam, kelas, mapel, ruangan, topik, status) VALUES
('SCH-001', 'walikelas1', 'Senin', '07:30 - 09:00', 'XII MIPA 1', 'Matematika Peminatan', 'Lab Mat 1', 'Turunan Fungsi Trigonometri', 'Selesai'),
('SCH-002', 'walikelas1', 'Senin', '10:00 - 11:30', 'XII MIPA 2', 'Matematika Peminatan', 'Ruang 12B', 'Vektor & Proyeksi 3D', 'Selesai'),
('SCH-003', 'walikelas1', 'Selasa', '08:15 - 09:45', 'XI MIPA 1', 'Matematika Wajib', 'Ruang 11A', 'Statistika & Distribusi', 'Belum Dimulai'),
('SCH-004', 'walikelas1', 'Selasa', '10:15 - 11:45', 'X MIPA 1', 'Fisika Dasar', 'Ruang 10C', 'Vektor Posisi & Kecepatan', 'Belum Dimulai'),
('SCH-005', 'walikelas1', 'Rabu', '07:30 - 09:00', 'XII MIPA 1', 'Matematika Peminatan', 'Lab Mat 1', 'Latihan Turunan Implisit', 'Belum Dimulai'),
('SCH-006', 'walikelas1', 'Kamis', '09:00 - 10:30', 'XII MIPA 2', 'Matematika Peminatan', 'Ruang 12B', 'Kuis Bab 2', 'Belum Dimulai'),
('SCH-007', 'walikelas1', 'Jumat', '08:00 - 09:30', 'XI MIPA 1', 'Matematika Wajib', 'Ruang 11A', 'Pembahasan Tugas Mandiri', 'Belum Dimulai')
ON CONFLICT (id) DO NOTHING;


-- =========================================================
-- DATA DEMO — BANK MODUL & RPP (3 DOKUMEN)
-- (sesuai BankModulRppView initialDocuments + field baru)
-- =========================================================
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


-- =========================================================
-- DATA DEMO — ANALISIS KELAS (4 KELAS)
-- =========================================================
INSERT INTO public.class_analytics (id, kelas, rata_rata_kelas, ketuntasan_persen, jumlah_siswa, jumlah_tuntas, jumlah_remedial, catatan_ai) VALUES
('ANL-001', 'XII MIPA 1', 86.48, 80.00, 5, 4, 1, 'Tingkat ketuntasan kumulatif kelas berada pada kategori baik. Diperlukan pendampingan khusus untuk 1 siswa pada materi turunan rantai.'),
('ANL-002', 'XII MIPA 2', 72.60, 50.00, 2, 1, 1, 'Perlu peningkatan signifikan. 1 dari 2 siswa membutuhkan remedial.'),
('ANL-003', 'XI MIPA 1', 89.05, 100.00, 2, 2, 0, 'Seluruh siswa mencapai KKM. Pertahankan capaian ini dan berikan pengayaan materi.'),
('ANL-004', 'X MIPA 1', 92.50, 100.00, 1, 1, 0, 'Siswa menunjukkan performa sangat baik. Siap untuk materi tingkat lanjut.')
ON CONFLICT (kelas) DO NOTHING;


-- =========================================================
-- DATA DEMO — PENGATURAN SEKOLAH
-- =========================================================
INSERT INTO public.school_settings (teacher_username, nama_sekolah, tahun_ajaran, kkm_default, kurikulum, ai_model, auto_wa_alert) VALUES
('walikelas1', 'SMA Negeri 1 Jakarta', '2026/2027 (Semester Ganjil)', 75, 'Kurikulum Merdeka', 'Gemini 3.6 Pro (Fast & Accurate)', true),
('walikelas2', 'SMA Negeri 1 Jakarta', '2026/2027 (Semester Ganjil)', 75, 'Kurikulum Merdeka', 'Gemini 3.6 Pro (Fast & Accurate)', true),
('walikelas3', 'SMA Negeri 1 Jakarta', '2026/2027 (Semester Ganjil)', 75, 'Kurikulum Merdeka', 'Gemini 3.6 Pro (Fast & Accurate)', true),
('walikelas4', 'SMA Negeri 1 Jakarta', '2026/2027 (Semester Ganjil)', 75, 'Kurikulum Merdeka', 'Gemini 3.6 Pro (Fast & Accurate)', true)
ON CONFLICT (teacher_username) DO NOTHING;


-- =========================================================
-- AKTIFKAN RLS (ROW LEVEL SECURITY) UNTUK SEMUA TABEL
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
-- DROP POLICY IF EXISTS (BERSIHKAN JIKA SUDAH ADA)
-- =========================================================
DROP POLICY IF EXISTS "Public Profiles Access" ON public.profiles;
DROP POLICY IF EXISTS "Public Students Access" ON public.students;
DROP POLICY IF EXISTS "Public Attendances Access" ON public.daily_attendances;
DROP POLICY IF EXISTS "Public Attendance Recap Access" ON public.attendance_recap;
DROP POLICY IF EXISTS "Public Grades Access" ON public.grades;
DROP POLICY IF EXISTS "Public Schedules Access" ON public.teaching_schedules;
DROP POLICY IF EXISTS "Public Lesson Plans Access" ON public.lesson_plans;
DROP POLICY IF EXISTS "Public Analytics Access" ON public.class_analytics;
DROP POLICY IF EXISTS "Public Settings Access" ON public.school_settings;


-- =========================================================
-- BUAT KEBIJAKAN PUBLIC ACCESS (FOR ALL)
-- =========================================================
CREATE POLICY "Public Profiles Access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Students Access" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Attendances Access" ON public.daily_attendances FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Attendance Recap Access" ON public.attendance_recap FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Grades Access" ON public.grades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Schedules Access" ON public.teaching_schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Lesson Plans Access" ON public.lesson_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Analytics Access" ON public.class_analytics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Settings Access" ON public.school_settings FOR ALL USING (true) WITH CHECK (true);
