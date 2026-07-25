import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Sparkles, Download, Search, Filter, Plus, 
  Eye, BookOpen, Check, X, Copy, FileCode, CheckCircle2
} from 'lucide-react';

const initialDocuments = [
  {
    id: 'DOC-001',
    judul: 'RPP Modul Ajar — Turunan Fungsi Trigonometri & Kalkulus',
    kurikulum: 'Kurikulum Merdeka',
    kelas: 'XII MIPA 1',
    alokasiWaktu: '4 JP (2 x Pertemuan)',
    mapel: 'Matematika Peminatan',
    penulis: 'Pak Budi, S.Pd',
    tanggal: '20 Jul 2026',
    format: 'PDF / DOCX',
    ringkasan: 'Menguraikan penerapan turunan fungsi trigonometri pada permasalahan kecepatan spasial dan optimasi fungsi.',
    tujuan: 'Siswa mampu menentukan turunan pertama fungsi sinus dan kosinus serta menerapkannya dalam soal cerita fisika.',
    langkah: [
      'Kegiatan Awal (15 menit): Apersepsi grafik fungsi sinus dan pengenalan kemiringan garis singgung.',
      'Kegiatan Inti (60 menit): Eksplorasi rumus turunan dengan konsep limit dan diskusi kelompok pemecahan masalah.',
      'Kegiatan Penutup (15 menit): Refleksi mandiri dan pengerjaan kuis formatik 3 soal.'
    ]
  },
  {
    id: 'DOC-002',
    judul: 'Modul Pembelajaran Interaktif — Vektor & Matriks Tiga Dimensi',
    kurikulum: 'Kurikulum Merdeka',
    kelas: 'XII MIPA 2',
    alokasiWaktu: '6 JP (3 x Pertemuan)',
    mapel: 'Matematika Peminatan',
    penulis: 'Pak Budi, S.Pd',
    tanggal: '18 Jul 2026',
    format: 'PDF',
    ringkasan: 'Panduan belajar mandiri siswa untuk memahami operasi penjumlahan, perkalian skalar, dan proyeksi ortogonal vektor.',
    tujuan: 'Siswa dapat menghitung panjang vektor dan sudut antara dua vektor dalam ruang 3D.',
    langkah: [
      'Kegiatan Awal (10 menit): Demostrasi alat peraga spasial 3D.',
      'Kegiatan Inti (65 menit): Latihan komputasi dot product dan perkalian silang vektor.',
      'Kegiatan Penutup (15 menit): Rangkuman rumus utama.'
    ]
  },
  {
    id: 'DOC-003',
    judul: 'RPP Diferensiasi — Statistika & Distribusi Normal',
    kurikulum: 'K13 Revisi',
    kelas: 'XI MIPA 1',
    alokasiWaktu: '4 JP (2 x Pertemuan)',
    mapel: 'Matematika Wajib',
    penulis: 'Pak Budi, S.Pd',
    tanggal: '10 Jul 2026',
    format: 'DOCX',
    ringkasan: 'Rencana pembelajaran diferensiasi produk untuk materi pemusatan data dan simpangan baku.',
    tujuan: 'Siswa dapat mengolah data kelompok ke dalam tabel distribusi frekuensi dan histogram.',
    langkah: [
      'Kegiatan Awal (15 menit): Pengumpulan data tinggi badan siswa di kelas.',
      'Kegiatan Inti (60 menit): Penyusunan tabel frekuensi dan perhitungan nilai rata-rata gabungan.',
      'Kegiatan Penutup (15 menit): Evaluasi antar teman.'
    ]
  }
];

export default function BankModulRppView({ classes }) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKurikulum, setSelectedKurikulum] = useState('Semua Kurikulum');
  const [selectedClass, setSelectedClass] = useState('Semua Kelas');
  
  // Modals
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Form AI Generator State
  const [aiForm, setAiForm] = useState({
    topik: '',
    kelas: classes[0] || 'XII MIPA 1',
    mapel: 'Matematika Peminatan',
    alokasiWaktu: '4 JP (2 Pertemuan)',
    kurikulum: 'Kurikulum Merdeka'
  });

  // Filtered Docs
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.judul.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.ringkasan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKurikulum = selectedKurikulum === 'Semua Kurikulum' || doc.kurikulum === selectedKurikulum;
    const matchesClass = selectedClass === 'Semua Kelas' || doc.kelas === selectedClass;
    return matchesSearch && matchesKurikulum && matchesClass;
  });

  // Handle Preview
  const handleOpenPreview = (doc) => {
    setActiveDoc(doc);
    setIsPreviewOpen(true);
  };

  // Handle AI Generator Submit
  const handleGenerateRpp = (e) => {
    e.preventDefault();
    if (!aiForm.topik.trim()) {
      alert('Mohon masukkan topik pembelajaran!');
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      const newDoc = {
        id: `DOC-00${documents.length + 1}`,
        judul: `RPP Modul Ajar AI — ${aiForm.topik}`,
        kurikulum: aiForm.kurikulum,
        kelas: aiForm.kelas,
        alokasiWaktu: aiForm.alokasiWaktu,
        mapel: aiForm.mapel,
        penulis: 'Asisten AI & Pak Budi, S.Pd',
        tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        format: 'PDF / DOCX',
        ringkasan: `Modul ajar yang dirancang otomatis oleh AI untuk topik ${aiForm.topik} dengan pendekatan Deep Learning & Kurikulum Merdeka.`,
        tujuan: `Peserta didik mampu menganalisis, membuktikan, dan menerapkan konsep dasar ${aiForm.topik} pada soal pemecahan masalah konteks nyata.`,
        langkah: [
          `Kegiatan Awal (15 menit): Pemantik kognitif via pertanyaan kritis AI tentang ${aiForm.topik}.`,
          `Kegiatan Inti (60 menit): Kerja kelompok kolaboratif, manipulasi simbolik, dan pembuatan infografis hasil pengerjaan.`,
          `Kegiatan Penutup (15 menit): Kuis asesmen formatik 5 menit dan umpan balik balik dari guru.`
        ]
      };

      setDocuments([newDoc, ...documents]);
      setIsGenerating(false);
      setIsAiModalOpen(false);
      setActiveDoc(newDoc);
      setIsPreviewOpen(true);

      showToast('Draf RPP Baru Berhasil Di-Generate oleh AI!');
    }, 1500);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="p-8 space-y-8 overflow-y-auto flex-1 text-gray-100 relative"
    >
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-8 z-50 bg-purple-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-semibold text-sm border border-purple-400/40"
          >
            <Sparkles className="w-5 h-5" /> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER & AI BANNER */}
      <div className="bg-gradient-to-r from-purple-900/40 via-cardBg to-blue-900/40 border border-purple-500/30 p-8 rounded-2xl shadow-xl flex items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Modul & RPP Pintar AI
          </div>
          <h2 className="text-2xl font-bold text-white">Bank Modul Ajar & RPP Pembelajaran</h2>
          <p className="text-xs text-gray-300 leading-relaxed">
            Kelola, unduh, dan buat draf Rencana Pelaksanaan Pembelajaran (RPP) Kurikulum Merdeka secara otomatis menggunakan teknologi AI untuk hemat waktu mengajar Anda.
          </p>
        </div>

        <button 
          onClick={() => setIsAiModalOpen(true)}
          className="bg-gradient-to-r from-primaryPurple to-accentBlue px-6 py-3.5 rounded-xl text-sm font-bold text-white shadow-xl shadow-purple-500/30 flex items-center gap-2.5 hover:opacity-90 transition shrink-0"
        >
          <Sparkles className="w-5 h-5" /> Generate RPP Otomatis AI
        </button>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-cardBg border border-cardBorder p-5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari judul modul, bab, atau materi RPP..." 
              className="w-full pl-10 pr-4 py-2.5 bg-darkBg border border-cardBorder rounded-xl text-sm text-white focus:outline-none focus:border-primaryPurple"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <select 
              value={selectedKurikulum}
              onChange={(e) => setSelectedKurikulum(e.target.value)}
              className="bg-darkBg border border-cardBorder rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primaryPurple"
            >
              <option value="Semua Kurikulum">Semua Kurikulum</option>
              <option value="Kurikulum Merdeka">Kurikulum Merdeka</option>
              <option value="K13 Revisi">K13 Revisi</option>
            </select>

            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-darkBg border border-cardBorder rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primaryPurple"
            >
              <option value="Semua Kelas">Semua Kelas</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <span className="text-xs text-gray-400 font-medium">
          Ditemukan <strong className="text-white">{filteredDocs.length}</strong> Dokumen
        </span>
      </div>

      {/* GRID LIST RPP & MODUL */}
      <div className="grid grid-cols-3 gap-6">
        {filteredDocs.length > 0 ? (
          filteredDocs.map((doc) => (
            <div 
              key={doc.id} 
              className="bg-cardBg border border-cardBorder rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-primaryPurple/50 transition group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-300">
                    {doc.kurikulum}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">{doc.tanggal}</span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-white group-hover:text-primaryPurple transition line-clamp-2">
                    {doc.judul}
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                    {doc.ringkasan}
                  </p>
                </div>

                <div className="bg-darkBg p-3 rounded-xl border border-cardBorder space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-300">
                    <span className="text-gray-400">Kelas & Mapel:</span>
                    <span className="font-semibold text-white">{doc.kelas} • {doc.mapel}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span className="text-gray-400">Alokasi Waktu:</span>
                    <span className="font-semibold text-emerald-400">{doc.alokasiWaktu}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-cardBorder flex items-center justify-between gap-2">
                <button 
                  onClick={() => handleOpenPreview(doc)}
                  className="flex-1 bg-darkBg hover:bg-cardBorder border border-cardBorder text-gray-200 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Eye className="w-3.5 h-3.5 text-accentBlue" /> Pratinjau
                </button>
                
                <button 
                  onClick={() => showToast(`Mengunduh dokumen "${doc.judul}"...`)}
                  className="bg-primaryPurple hover:bg-primaryPurple/80 text-white p-2.5 rounded-xl text-xs transition"
                  title="Unduh Dokumen RPP"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 py-16 text-center text-gray-400 bg-cardBg border border-cardBorder rounded-2xl">
            Tidak ada dokumen RPP yang sesuai dengan kriteria filter.
          </div>
        )}
      </div>

      {/* MODAL GENERATOR RPP AI */}
      <AnimatePresence>
        {isAiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-cardBg border border-cardBorder rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-cardBorder flex items-center justify-between bg-darkBg/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primaryPurple" />
                  <h3 className="font-bold text-lg text-white">Generator RPP & Modul Ajar AI</h3>
                </div>
                <button onClick={() => setIsAiModalOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleGenerateRpp} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Topik / Materi Pembelajaran *</label>
                  <input 
                    type="text"
                    required
                    value={aiForm.topik}
                    onChange={(e) => setAiForm({ ...aiForm, topik: e.target.value })}
                    className="w-full bg-darkBg border border-cardBorder rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primaryPurple"
                    placeholder="Contoh: Turunan Fungsi Implisit & Kecepatan Sesaat..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Kurikulum</label>
                    <select 
                      value={aiForm.kurikulum}
                      onChange={(e) => setAiForm({ ...aiForm, kurikulum: e.target.value })}
                      className="w-full bg-darkBg border border-cardBorder rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primaryPurple"
                    >
                      <option value="Kurikulum Merdeka">Kurikulum Merdeka</option>
                      <option value="K13 Revisi">K13 Revisi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Target Kelas</label>
                    <select 
                      value={aiForm.kelas}
                      onChange={(e) => setAiForm({ ...aiForm, kelas: e.target.value })}
                      className="w-full bg-darkBg border border-cardBorder rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primaryPurple"
                    >
                      {classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Mata Pelajaran</label>
                    <input 
                      type="text"
                      value={aiForm.mapel}
                      onChange={(e) => setAiForm({ ...aiForm, mapel: e.target.value })}
                      className="w-full bg-darkBg border border-cardBorder rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primaryPurple"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Alokasi Waktu</label>
                    <input 
                      type="text"
                      value={aiForm.alokasiWaktu}
                      onChange={(e) => setAiForm({ ...aiForm, alokasiWaktu: e.target.value })}
                      className="w-full bg-darkBg border border-cardBorder rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primaryPurple"
                    />
                  </div>
                </div>

                <div className="p-4 bg-darkBg rounded-xl border border-cardBorder text-xs text-purple-300 leading-relaxed flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primaryPurple shrink-0 mt-0.5" />
                  <span>AI akan secara otomatis merancang Identitas Pembelajaran, Capaian (CP), Tujuan (TP), Langkah Pembelajaran (Awal, Inti, Penutup), dan Asesmen Formatif.</span>
                </div>

                <div className="pt-4 border-t border-cardBorder flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsAiModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-cardBorder text-gray-300 hover:text-white transition text-sm"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-primaryPurple to-accentBlue px-6 py-2.5 rounded-xl text-white font-bold shadow-lg shadow-purple-500/20 text-sm flex items-center gap-2 hover:opacity-90 transition disabled:opacity-50"
                  >
                    <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    {isGenerating ? 'Menyusun RPP AI...' : 'Buat RPP Sekarang'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL PREVIEW RPP */}
      <AnimatePresence>
        {isPreviewOpen && activeDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-cardBg border border-cardBorder rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="px-6 py-4 border-b border-cardBorder flex items-center justify-between bg-darkBg/50 shrink-0">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accentBlue" />
                  <h3 className="font-bold text-base text-white truncate max-w-md">{activeDoc.judul}</h3>
                </div>
                <button onClick={() => setIsPreviewOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-300 flex-1 leading-relaxed">
                <div className="grid grid-cols-3 gap-4 bg-darkBg p-4 rounded-xl border border-cardBorder text-xs">
                  <div>
                    <span className="text-gray-400 block">Kurikulum & Kelas</span>
                    <strong className="text-white">{activeDoc.kurikulum} ({activeDoc.kelas})</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Mata Pelajaran</span>
                    <strong className="text-white">{activeDoc.mapel}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Alokasi Waktu</span>
                    <strong className="text-emerald-400">{activeDoc.alokasiWaktu}</strong>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> A. Tujuan Pembelajaran (TP)
                  </h4>
                  <p className="bg-darkBg p-4 rounded-xl border border-cardBorder text-xs text-gray-200">
                    {activeDoc.tujuan}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primaryPurple" /> B. Langkah-Langkah Kegiatan Pembelajaran
                  </h4>
                  <div className="bg-darkBg p-4 rounded-xl border border-cardBorder space-y-3 text-xs">
                    {activeDoc.langkah && activeDoc.langkah.map((l, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                          {i + 1}
                        </span>
                        <p className="text-gray-200">{l}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm mb-2">C. Asesmen Penilaian</h4>
                  <p className="bg-darkBg p-4 rounded-xl border border-cardBorder text-xs text-gray-300">
                    Asesmen Formatif (Kuis singkat 3 soal) & Asesmen Sumatif (Tugas analisis mandiri di lembar kerja siswa).
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 bg-darkBg/60 border-t border-cardBorder flex justify-end gap-3 shrink-0">
                <button 
                  onClick={() => showToast('Konten RPP berhasil disalin ke Clipboard!')}
                  className="px-4 py-2 rounded-xl border border-cardBorder text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Copy className="w-3.5 h-3.5" /> Salin Teks
                </button>
                <button 
                  onClick={() => showToast(`Mengunduh RPP "${activeDoc.judul}"...`)}
                  className="px-5 py-2 rounded-xl bg-primaryPurple text-white text-xs font-bold hover:bg-primaryPurple/80 flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" /> Unduh PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
