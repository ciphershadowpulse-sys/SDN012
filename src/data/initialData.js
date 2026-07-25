// Data Awal Aplikasi Guru AI Pro (Siswa, Presensi, dan Penilaian)

export const INITIAL_CLASSES = [
  'XII MIPA 1',
  'XII MIPA 2',
  'XI MIPA 1',
  'X MIPA 1'
];

export const USER_QR_SAMPLES = [
  {
    id: 'QR-USER-1',
    code: '0012345688',
    altCodes: ['0012345688', 'Murid-SDN012-11'],
    studentId: 'STU-001',
    studentName: 'Ahmad Rizky Pratama',
    kelas: 'XII MIPA 1',
    image: '/qr1.png',
    label: 'QR Absensi Siswa 1 (0012345688 / Murid-SDN012-11)'
  },
  {
    id: 'QR-USER-2',
    code: '3184861266',
    altCodes: ['3184861266'],
    studentId: 'STU-002',
    studentName: 'Anisa Rahmawati',
    kelas: 'XII MIPA 1',
    image: '/qr2.png',
    label: 'QR Absensi Siswa 2 (3184861266)'
  }
];

export const INITIAL_STUDENTS = [
  {
    id: 'STU-001',
    nisn: '0012345688',
    altNisn: 'Murid-SDN012-11',
    nama: 'Ahmad Rizky Pratama',
    kelas: 'XII MIPA 1',
    gender: 'Laki-Laki',
    status: 'Aktif',
    email: 'rizky.pratama@siswa.belajar.id',
    phoneOrtu: '081234567801',
    namaOrtu: 'Bpk. Hendra Pratama',
    alamat: 'Jl. Merdeka No. 12, Jakarta',
    catatan: 'Aktif dalam diskusi matematika, ketua OSIS.',
    qrImage: '/qr1.png'
  },
  {
    id: 'STU-002',
    nisn: '3184861266',
    nama: 'Anisa Rahmawati',
    kelas: 'XII MIPA 1',
    gender: 'Perempuan',
    status: 'Aktif',
    email: 'anisa.rahma@siswa.belajar.id',
    phoneOrtu: '081234567802',
    namaOrtu: 'Ibu Kurniawati',
    alamat: 'Jl. Melati No. 45, Jakarta',
    catatan: 'Sangat teliti dalam pengerjaan tugas matematika.',
    qrImage: '/qr2.png'
  },
  {
    id: 'STU-003',
    nisn: '0051234503',
    nama: 'Bagus Setyo Nugroho',
    kelas: 'XII MIPA 1',
    gender: 'Laki-Laki',
    status: 'Aktif',
    email: 'bagus.setyo@siswa.belajar.id',
    phoneOrtu: '081234567803',
    namaOrtu: 'Bpk. Tri Nugroho',
    alamat: 'Jl. Mawar Gg. 3 No. 8, Jakarta',
    catatan: 'Perlu bimbingan ekstra pada materi kalkulus.'
  },
  {
    id: 'STU-004',
    nisn: '0051234504',
    nama: 'Citra Dewi Lestari',
    kelas: 'XII MIPA 1',
    gender: 'Perempuan',
    status: 'Aktif',
    email: 'citra.dewi@siswa.belajar.id',
    phoneOrtu: '081234567804',
    namaOrtu: 'Ibu Rahayu Lestari',
    alamat: 'Jl. Sudirman No. 88, Jakarta',
    catatan: 'Juara 2 Olimpiade Fisika tingkat Kota.'
  },
  {
    id: 'STU-005',
    nisn: '0051234505',
    nama: 'Daffa Farhan Al-Ghazali',
    kelas: 'XII MIPA 1',
    gender: 'Laki-Laki',
    status: 'Aktif',
    email: 'daffa.farhan@siswa.belajar.id',
    phoneOrtu: '081234567805',
    namaOrtu: 'Bpk. Ahmad Farhan',
    alamat: 'Jl. Gatot Subroto No. 19, Jakarta',
    catatan: 'Disiplin dan selalu hadir tepat waktu.'
  },
  {
    id: 'STU-006',
    nisn: '0051234506',
    nama: 'Eka Putri Maharani',
    kelas: 'XII MIPA 2',
    gender: 'Perempuan',
    status: 'Aktif',
    email: 'eka.putri@siswa.belajar.id',
    phoneOrtu: '081234567806',
    namaOrtu: 'Ibu Maharani',
    alamat: 'Jl. Anggrek No. 34, Jakarta',
    catatan: 'Aktif dalam kegiatan ekstrakurikuler PMR.'
  },
  {
    id: 'STU-007',
    nisn: '0051234507',
    nama: 'Fajar Nugraha',
    kelas: 'XII MIPA 2',
    gender: 'Laki-Laki',
    status: 'Aktif',
    email: 'fajar.nugraha@siswa.belajar.id',
    phoneOrtu: '081234567807',
    namaOrtu: 'Bpk. Herman Nugraha',
    alamat: 'Jl. Flamboyan No. 12, Jakarta',
    catatan: 'Sering alpa tanpa keterangan pada minggu lalu.'
  },
  {
    id: 'STU-008',
    nisn: '0051234508',
    nama: 'Gita Gutawa Putri',
    kelas: 'XI MIPA 1',
    gender: 'Perempuan',
    status: 'Aktif',
    email: 'gita.gutawa@siswa.belajar.id',
    phoneOrtu: '081234567808',
    namaOrtu: 'Bpk. Erwin Gutawa',
    alamat: 'Jl. Cempaka No. 90, Jakarta',
    catatan: 'Bakat tinggi di bidang seni & matematika.'
  },
  {
    id: 'STU-009',
    nisn: '0051234509',
    nama: 'Hafiz Ibnu Sina',
    kelas: 'XI MIPA 1',
    gender: 'Laki-Laki',
    status: 'Aktif',
    email: 'hafiz.sina@siswa.belajar.id',
    phoneOrtu: '081234567809',
    namaOrtu: 'Bpk. Lukman Sina',
    alamat: 'Jl. Diponegoro No. 23, Jakarta',
    catatan: 'Memiliki logika pemecahan masalah matematika sangat baik.'
  },
  {
    id: 'STU-010',
    nisn: '0051234510',
    nama: 'Intan Nuraini',
    kelas: 'X MIPA 1',
    gender: 'Perempuan',
    status: 'Aktif',
    email: 'intan.nuraini@siswa.belajar.id',
    phoneOrtu: '081234567810',
    namaOrtu: 'Ibu Nuraini',
    alamat: 'Jl. Veteran No. 56, Jakarta',
    catatan: 'Siswa baru berprestasi lulusan SMPN 1.'
  }
];

export const INITIAL_ATTENDANCE_RECAP = [
  { studentId: 'STU-001', hadir: 38, sakit: 1, izin: 1, alpa: 0, persentase: 95 },
  { studentId: 'STU-002', hadir: 40, sakit: 0, izin: 0, alpa: 0, persentase: 100 },
  { studentId: 'STU-003', hadir: 35, sakit: 2, izin: 2, alpa: 1, persentase: 87.5 },
  { studentId: 'STU-004', hadir: 39, sakit: 1, izin: 0, alpa: 0, persentase: 97.5 },
  { studentId: 'STU-005', hadir: 40, sakit: 0, izin: 0, alpa: 0, persentase: 100 },
  { studentId: 'STU-006', hadir: 37, sakit: 2, izin: 1, alpa: 0, persentase: 92.5 },
  { studentId: 'STU-007', hadir: 30, sakit: 3, izin: 2, alpa: 5, persentase: 75 },
  { studentId: 'STU-008', hadir: 39, sakit: 1, izin: 0, alpa: 0, persentase: 97.5 },
  { studentId: 'STU-009', hadir: 38, sakit: 2, izin: 0, alpa: 0, persentase: 95 },
  { studentId: 'STU-010', hadir: 40, sakit: 0, izin: 0, alpa: 0, persentase: 100 }
];

export const INITIAL_GRADES = [
  {
    studentId: 'STU-001',
    mapel: 'Matematika Peminatan',
    tugas1: 88,
    tugas2: 90,
    uh: 85,
    uts: 92,
    uas: 90,
    nilaiAkhir: 89.2,
    predikat: 'A',
    status: 'Tuntas',
    catatanAi: 'Penguasaan konsep kalkulus dan turunan fungsi sangat unggul. Tingkatkan konsistensi dalam latihan soal kompleks.'
  },
  {
    studentId: 'STU-002',
    mapel: 'Matematika Peminatan',
    tugas1: 95,
    tugas2: 96,
    uh: 92,
    uts: 95,
    uas: 94,
    nilaiAkhir: 94.4,
    predikat: 'A',
    status: 'Tuntas',
    catatanAi: 'Sangat luar biasa! Pemahaman teori dan penyelesaian masalah matematika sangat presisi.'
  },
  {
    studentId: 'STU-003',
    mapel: 'Matematika Peminatan',
    tugas1: 70,
    tugas2: 75,
    uh: 68,
    uts: 72,
    uas: 70,
    nilaiAkhir: 70.8,
    predikat: 'C',
    status: 'Remidial',
    catatanAi: 'Perlu pengayaan ulang pada dasar-dasar trigonometri dan turunan. Disarankan mengikuti tutor sebaya.'
  },
  {
    studentId: 'STU-004',
    mapel: 'Matematika Peminatan',
    tugas1: 92,
    tugas2: 90,
    uh: 94,
    uts: 90,
    uas: 93,
    nilaiAkhir: 91.9,
    predikat: 'A',
    status: 'Tuntas',
    catatanAi: 'Daya analisis sangat tajam. Mampu menerapkan rumus turunan pada soal cerita fisika matematika.'
  },
  {
    studentId: 'STU-005',
    mapel: 'Matematika Peminatan',
    tugas1: 85,
    tugas2: 88,
    uh: 84,
    uts: 86,
    uas: 88,
    nilaiAkhir: 86.3,
    predikat: 'B',
    status: 'Tuntas',
    catatanAi: 'Capaian hasil belajar sangat baik dan stabil. Siap melanjutkan ke bab vektor dan matriks.'
  },
  {
    studentId: 'STU-006',
    mapel: 'Matematika Peminatan',
    tugas1: 80,
    tugas2: 82,
    uh: 85,
    uts: 83,
    uas: 81,
    nilaiAkhir: 82.2,
    predikat: 'B',
    status: 'Tuntas',
    catatanAi: 'Hasil pengerjaan tugas sangat baik. Pertahankan fokus saat ujian semester.'
  },
  {
    studentId: 'STU-007',
    mapel: 'Matematika Peminatan',
    tugas1: 65,
    tugas2: 60,
    uh: 62,
    uts: 64,
    uas: 60,
    nilaiAkhir: 62.1,
    predikat: 'D',
    status: 'Remidial',
    catatanAi: 'Memerlukan remedial khusus dan pendampingan hadir di kelas. Berikan tugas perbaikan mandiri.'
  },
  {
    studentId: 'STU-008',
    mapel: 'Matematika Peminatan',
    tugas1: 90,
    tugas2: 92,
    uh: 88,
    uts: 90,
    uas: 91,
    nilaiAkhir: 90.3,
    predikat: 'A',
    status: 'Tuntas',
    catatanAi: 'Sangat aktif di kelas dan menunjukkan logika yang terstruktur dengan rapi.'
  },
  {
    studentId: 'STU-009',
    mapel: 'Matematika Peminatan',
    tugas1: 88,
    tugas2: 85,
    uh: 90,
    uts: 89,
    uas: 87,
    nilaiAkhir: 87.8,
    predikat: 'B',
    status: 'Tuntas',
    catatanAi: 'Kemampuan eksplorasi mandiri amat baik. Pertahankan performa positif ini.'
  },
  {
    studentId: 'STU-010',
    mapel: 'Matematika Peminatan',
    tugas1: 92,
    tugas2: 95,
    uh: 91,
    uts: 93,
    uas: 92,
    nilaiAkhir: 92.5,
    predikat: 'A',
    status: 'Tuntas',
    catatanAi: 'Prestasi gemilang sebagai siswa baru. Mampu beradaptasi cepat dengan tingkat kesulitan soal.'
  }
];
