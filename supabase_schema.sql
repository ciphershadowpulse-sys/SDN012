-- =========================================================
-- SKEMA BASIS DATA SUPABASE UNTUK DIGITAL GURU (WALI KELAS)
-- MEMUAT 8 TABEL LENGKAP UNTUK SELURUH MENU APLIKASI
-- =========================================================

-- 1. TABEL PROFIL WALI KELAS (PROFILES)
CREATE TABLE IF NOT EXISTS public.profiles (
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

-- 2. TABEL DATA MASTER SISWA (STUDENTS)
CREATE TABLE IF NOT EXISTS public.students (
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

-- 3. TABEL PRESENSI HARIAN (DAILY_ATTENDANCES)
CREATE TABLE IF NOT EXISTS public.daily_attendances (
  id BIGSERIAL PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  kelas VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('Hadir', 'Sakit', 'Izin', 'Alpa')),
  catatan TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_student_date UNIQUE (student_id, date)
);

-- 4. TABEL REKAPITULASI ABSENSI (ATTENDANCE_RECAP)
CREATE TABLE IF NOT EXISTS public.attendance_recap (
  student_id VARCHAR(50) PRIMARY KEY REFERENCES public.students(id) ON DELETE CASCADE,
  nama VARCHAR(100) NOT NULL,
  kelas VARCHAR(50) NOT NULL,
  hadir INT DEFAULT 0,
  sakit INT DEFAULT 0,
  izin INT DEFAULT 0,
  alpa INT DEFAULT 0,
  persentase DECIMAL(5,2) DEFAULT 100.00
);

-- 5. TABEL PENILAIAN SISWA (GRADES)
CREATE TABLE IF NOT EXISTS public.grades (
  student_id VARCHAR(50) PRIMARY KEY REFERENCES public.students(id) ON DELETE CASCADE,
  nama VARCHAR(100) NOT NULL,
  kelas VARCHAR(50) NOT NULL,
  tugas1 DECIMAL(5,2) DEFAULT 0,
  tugas2 DECIMAL(5,2) DEFAULT 0,
  uh DECIMAL(5,2) DEFAULT 0,
  uts DECIMAL(5,2) DEFAULT 0,
  uas DECIMAL(5,2) DEFAULT 0,
  nilai_akhir DECIMAL(5,2) DEFAULT 0,
  predikat VARCHAR(5) DEFAULT 'C',
  status VARCHAR(20) DEFAULT 'Remedial'
);

-- 6. TABEL JADWAL MENGAJAR (TEACHING_SCHEDULES)
CREATE TABLE IF NOT EXISTS public.teaching_schedules (
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

-- 7. TABEL BANK MODUL & RPP (LESSON_PLANS)
CREATE TABLE IF NOT EXISTS public.lesson_plans (
  id VARCHAR(50) PRIMARY KEY,
  teacher_username VARCHAR(50),
  judul VARCHAR(255) NOT NULL,
  kelas VARCHAR(50) NOT NULL,
  mapel VARCHAR(100) NOT NULL,
  fase VARCHAR(20) DEFAULT 'Fase F',
  ringkasan TEXT,
  file_url TEXT,
  status VARCHAR(30) DEFAULT 'Terverifikasi',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABEL ANALISIS KELAS (CLASS_ANALYTICS)
CREATE TABLE IF NOT EXISTS public.class_analytics (
  id VARCHAR(50) PRIMARY KEY,
  kelas VARCHAR(50) NOT NULL UNIQUE,
  rata_rata_kelas DECIMAL(5,2) DEFAULT 0.00,
  ketuntasan_persen DECIMAL(5,2) DEFAULT 0.00,
  catatan_ai TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================
-- DATA DEMO INITIAL UNTUK SELURUH TABEL
-- =========================================================

-- DATA DEMO PROFILES
INSERT INTO public.profiles (id, username, password, nama, nip, kelas_binaan, email, phone) VALUES
('USR-001', 'walikelas1', '123456', 'Pak Budi, S.Pd', '19850412 201001 1 008', 'XII MIPA 1', 'budi.matematika@sekolah.sch.id', '081234567890'),
('USR-002', 'walikelas2', '123456', 'Ibu Siti Rahmah, M.Pd', '19870820 201202 2 015', 'XII MIPA 2', 'siti.rahmah@sekolah.sch.id', '081234567891')
ON CONFLICT (username) DO NOTHING;

-- DATA DEMO STUDENTS
INSERT INTO public.students (id, nisn, nama, kelas, gender, email, nama_ortu, phone_ortu, alamat, catatan) VALUES
('STU-001', '0012345688', 'Ahmad Rizky Pratama', 'XII MIPA 1', 'Laki-Laki', 'ahmad.rizky@siswa.belajar.id', 'Bpk. Hendra Pratama', '081234567890', 'Jl. Sudirman No. 45', 'Siswa aktif dan ketua kelas'),
('STU-002', '3184861266', 'Anisa Rahmawati', 'XII MIPA 1', 'Perempuan', 'anisa.rahma@siswa.belajar.id', 'Ibu Rahmawati', '081298765432', 'Jl. Diponegoro No. 12', 'Prestasi olimpiade matematika'),
('STU-003', '0053456789', 'Bagus Setyawan', 'XII MIPA 1', 'Laki-Laki', 'bagus.s@siswa.belajar.id', 'Bpk. Bambang Setyawan', '081311223344', 'Jl. Gatot Subroto No. 88', 'Aktif organisasi OSIS'),
('STU-004', '0054567890', 'Citra Dewi Permata', 'XII MIPA 1', 'Perempuan', 'citra.dewi@siswa.belajar.id', 'Ibu Dewi Sukma', '081355667788', 'Jl. Ahmad Yani No. 23', 'Anggota klub karya ilmiah'),
('STU-005', '0055678901', 'Daffa Al-Faris', 'XII MIPA 1', 'Laki-Laki', 'daffa.faris@siswa.belajar.id', 'Bpk. Faris Hidayat', '081399887766', 'Jl. Pemuda No. 05', 'Kapten tim futsal sekolah')
ON CONFLICT (id) DO NOTHING;

-- DATA DEMO ATTENDANCE RECAP
INSERT INTO public.attendance_recap (student_id, nama, kelas, hadir, sakit, izin, alpa, persentase) VALUES
('STU-001', 'Ahmad Rizky Pratama', 'XII MIPA 1', 18, 0, 0, 0, 100.00),
('STU-002', 'Anisa Rahmawati', 'XII MIPA 1', 17, 1, 0, 0, 94.40),
('STU-003', 'Bagus Setyawan', 'XII MIPA 1', 16, 0, 2, 0, 88.80),
('STU-004', 'Citra Dewi Permata', 'XII MIPA 1', 18, 0, 0, 0, 100.00),
('STU-005', 'Daffa Al-Faris', 'XII MIPA 1', 15, 1, 1, 1, 83.30)
ON CONFLICT (student_id) DO NOTHING;

-- DATA DEMO GRADES
INSERT INTO public.grades (student_id, nama, kelas, tugas1, tugas2, uh, uts, uas, nilai_akhir, predikat, status) VALUES
('STU-001', 'Ahmad Rizky Pratama', 'XII MIPA 1', 90, 88, 92, 85, 90, 89.40, 'A', 'Tuntas'),
('STU-002', 'Anisa Rahmawati', 'XII MIPA 1', 95, 92, 96, 90, 94, 93.40, 'A', 'Tuntas'),
('STU-003', 'Bagus Setyawan', 'XII MIPA 1', 78, 80, 75, 76, 78, 77.40, 'B', 'Tuntas'),
('STU-004', 'Citra Dewi Permata', 'XII MIPA 1', 85, 88, 84, 82, 86, 85.00, 'A', 'Tuntas'),
('STU-005', 'Daffa Al-Faris', 'XII MIPA 1', 70, 68, 65, 72, 70, 69.00, 'D', 'Remedial')
ON CONFLICT (student_id) DO NOTHING;

-- DATA DEMO JADWAL MENGAJAR
INSERT INTO public.teaching_schedules (id, teacher_username, hari, jam, kelas, mapel, ruangan, topik, status) VALUES
('SCH-001', 'walikelas1', 'Senin', '07:30 - 09:00', 'XII MIPA 1', 'Matematika Peminatan', 'Lab Komputer 1', 'Turunan Fungsi Trigonometri', 'Selesai'),
('SCH-002', 'walikelas1', 'Senin', '09:15 - 10:45', 'XII MIPA 2', 'Matematika Peminatan', 'Ruang 204', 'Aplikasi Laju Perubahan', 'Selesai'),
('SCH-003', 'walikelas1', 'Selasa', '08:00 - 09:30', 'XII MIPA 1', 'Fisika Lanjutan', 'Lab Fisika', 'Gerak Harmonik Sederhana', 'Belum Dimulai')
ON CONFLICT (id) DO NOTHING;

-- DATA DEMO BANK MODUL & RPP
INSERT INTO public.lesson_plans (id, teacher_username, judul, kelas, mapel, fase, ringkasan, file_url, status) VALUES
('RPP-001', 'walikelas1', 'Modul Pembelajaran Interaktif — Vektor & Matriks 3D', 'XII MIPA 1', 'Matematika Peminatan', 'Fase F', 'Panduan belajar mandiri siswa untuk memahami operasi penjumlahan dan proyeksi ortogonal.', '/docs/modul_vektor.pdf', 'Terverifikasi'),
('RPP-002', 'walikelas1', 'RPP Kurikulum Merdeka — Statistika & Simpangan Baku', 'XII MIPA 1', 'Matematika Wajib', 'Fase F', 'Rencana pembelajaran diferensiasi produk untuk materi pemusatan data.', '/docs/rpp_statistika.pdf', 'Terverifikasi')
ON CONFLICT (id) DO NOTHING;

-- DATA DEMO CLASS ANALYTICS
INSERT INTO public.class_analytics (id, kelas, rata_rata_kelas, ketuntasan_persen, catatan_ai) VALUES
('ANL-001', 'XII MIPA 1', 82.84, 80.00, 'Tingkat ketuntasan kumulatif kelas berada pada kategori baik. Diperlukan pendampingan khusus untuk 1 siswa pada materi turunan rantai.')
ON CONFLICT (kelas) DO NOTHING;

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

-- DROP POLICY IF EXISTS JIKA SUDAH ADA
DROP POLICY IF EXISTS "Public Profiles Access" ON public.profiles;
DROP POLICY IF EXISTS "Public Students Access" ON public.students;
DROP POLICY IF EXISTS "Public Attendances Access" ON public.daily_attendances;
DROP POLICY IF EXISTS "Public Attendance Recap Access" ON public.attendance_recap;
DROP POLICY IF EXISTS "Public Grades Access" ON public.grades;
DROP POLICY IF EXISTS "Public Schedules Access" ON public.teaching_schedules;
DROP POLICY IF EXISTS "Public Lesson Plans Access" ON public.lesson_plans;
DROP POLICY IF EXISTS "Public Analytics Access" ON public.class_analytics;

-- BUAT KEBIJAKAN PUBLIC ACCESS (FOR ALL USING true WITH CHECK true)
CREATE POLICY "Public Profiles Access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Students Access" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Attendances Access" ON public.daily_attendances FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Attendance Recap Access" ON public.attendance_recap FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Grades Access" ON public.grades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Schedules Access" ON public.teaching_schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Lesson Plans Access" ON public.lesson_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Analytics Access" ON public.class_analytics FOR ALL USING (true) WITH CHECK (true);
