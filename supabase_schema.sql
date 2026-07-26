-- =========================================================
-- SKEMA BASIS DATA SUPABASE UNTUK GURU AI PRO (WALI KELAS)
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

-- DATA AWAL DEMO WALI KELAS
INSERT INTO public.profiles (id, username, password, nama, nip, kelas_binaan, email, phone) VALUES
('USR-001', 'walikelas1', '123456', 'Pak Budi, S.Pd', '19850412 201001 1 008', 'XII MIPA 1', 'budi.matematika@sekolah.sch.id', '081234567890'),
('USR-002', 'walikelas2', '123456', 'Ibu Siti Rahmah, M.Pd', '19870820 201202 2 015', 'XII MIPA 2', 'siti.rahmah@sekolah.sch.id', '081234567891'),
('USR-003', 'walikelas3', '123456', 'Bpk. Agus Santoso, S.Si', '19830514 200801 1 004', 'XI MIPA 1', 'agus.santoso@sekolah.sch.id', '081234567892'),
('USR-004', 'walikelas4', '123456', 'Ibu Dewi Lestari, S.Pd', '19900311 201503 2 009', 'X MIPA 1', 'dewi.lestari@sekolah.sch.id', '081234567893')
ON CONFLICT (username) DO NOTHING;

-- DATA AWAL MASTER SISWA
INSERT INTO public.students (id, nisn, nama, kelas, gender, email, nama_ortu, phone_ortu, alamat, catatan) VALUES
('STU-001', '0012345688', 'Ahmad Rizky Pratama', 'XII MIPA 1', 'Laki-Laki', 'ahmad.rizky@siswa.belajar.id', 'Bpk. Hendra Pratama', '081234567890', 'Jl. Sudirman No. 45', 'Siswa aktif dan ketua kelas'),
('STU-002', '3184861266', 'Anisa Rahmawati', 'XII MIPA 1', 'Perempuan', 'anisa.rahma@siswa.belajar.id', 'Ibu Rahmawati', '081298765432', 'Jl. Diponegoro No. 12', 'Prestasi olimpiade matematika'),
('STU-003', '0053456789', 'Bagus Setyawan', 'XII MIPA 1', 'Laki-Laki', 'bagus.s@siswa.belajar.id', 'Bpk. Bambang Setyawan', '081311223344', 'Jl. Gatot Subroto No. 88', 'Aktif organisasi OSIS'),
('STU-004', '0054567890', 'Citra Dewi Permata', 'XII MIPA 1', 'Perempuan', 'citra.dewi@siswa.belajar.id', 'Ibu Dewi Sukma', '081355667788', 'Jl. Ahmad Yani No. 23', 'Anggota klub karya ilmiah'),
('STU-005', '0055678901', 'Daffa Al-Faris', 'XII MIPA 1', 'Laki-Laki', 'daffa.faris@siswa.belajar.id', 'Bpk. Faris Hidayat', '081399887766', 'Jl. Pemuda No. 05', 'Kapten tim futsal sekolah')
ON CONFLICT (id) DO NOTHING;

-- AKTIFKAN RLS (ROW LEVEL SECURITY)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_recap ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- POLICY PUBLIC ACCESS FOR DEMO
CREATE POLICY "Public Profiles Access" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Public Students Access" ON public.students FOR ALL USING (true);
CREATE POLICY "Public Attendances Access" ON public.daily_attendances FOR ALL USING (true);
CREATE POLICY "Public Attendance Recap Access" ON public.attendance_recap FOR ALL USING (true);
CREATE POLICY "Public Grades Access" ON public.grades FOR ALL USING (true);

